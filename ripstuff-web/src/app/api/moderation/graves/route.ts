import { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";

import { internalError, json, unauthorized, validationError } from "@/lib/http";
import { requireUserModerator } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { moderationListQuery, moderationQueueResponse } from "@/lib/validation";

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(new URL(req.url).searchParams.entries());
  const parsedQuery = moderationListQuery.safeParse(params);

  if (!parsedQuery.success) {
    return validationError(parsedQuery.error);
  }

  try {
    await requireUserModerator();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "AUTHENTICATION_REQUIRED") {
        return unauthorized("Please sign in to access moderation features");
      }
      if (error.message === "MODERATOR_PERMISSIONS_REQUIRED") {
        return unauthorized("Moderator permissions required");
      }
    }

    console.error("/api/moderation/graves auth error", error);
    return internalError();
  }

  const { limit, cursor, status, reported } = parsedQuery.data;

  const where: Prisma.GraveWhereInput = {};

  if (status) {
    where.status = status;
  } else {
    // If filtering by reported only, show all statuses, otherwise show pending/hidden
    if (reported === undefined) {
      where.status = { in: ["PENDING", "HIDDEN"] };
    }
  }

  if (reported !== undefined) {
    const wantsReported = reported === true || reported === "true";
    where.reports = wantsReported
      ? { some: { resolvedAt: null } }
      : { none: { resolvedAt: null } };
  }

  if (cursor) {
    const cursorDate = new Date(cursor);
    if (!Number.isNaN(cursorDate.getTime())) {
      where.createdAt = { lt: cursorDate };
    }
  }

  try {
  const graves = await prisma.grave.findMany({
    where,
    cursor: cursor ? { id: cursor } : undefined,
    take: limit + 1,
    orderBy: { createdAt: "desc" },
    include: {
      reports: {
        where: { resolvedAt: null },
        select: { id: true, reason: true, createdAt: true, deviceHash: true },
        orderBy: { createdAt: "desc" },
      },
      moderationTrail: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

    let nextCursor: string | null = null;
    if (graves.length > limit) {
      const next = graves.pop();
      if (next) {
        nextCursor = next.createdAt.toISOString();
      }
    }

    const items = graves.map((grave) => ({
      id: grave.id,
      slug: grave.slug,
      title: grave.title,
      status: grave.status,
      featured: grave.featured,
      createdAt: grave.createdAt.toISOString(),
      reports: grave.reports.length,
      reportDetails: grave.reports.map((report) => ({
        id: report.id,
        reason: report.reason,
        createdAt: report.createdAt.toISOString(),
        deviceHash: report.deviceHash.substring(0, 8) + "...", // Partial hash for privacy
      })),
      category: grave.category,
      eulogyPreview: grave.eulogyText.slice(0, 160),
      backstory: grave.backstory ?? null,
      lastActions: grave.moderationTrail.map((action) => ({
        id: action.id,
        action: action.action,
        reason: action.reason,
        createdAt: action.createdAt.toISOString(),
      })),
    }));

    const payload = moderationQueueResponse.parse({
      items,
      nextCursor,
    });

    return json(payload, 200);
  } catch (error) {
    console.error("/api/moderation/graves query error", error);
    return internalError();
  }
}

