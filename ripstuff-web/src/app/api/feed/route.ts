import { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";

import { createEulogyPreview } from "@/lib/eulogy";
import { internalError, json, validationError } from "@/lib/http";
import prisma from "@/lib/prisma";
import { feedQuery, feedResponse } from "@/lib/validation";

export const dynamic = 'force-dynamic';

function coerceFeatured(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    if (value.toLowerCase() === "true") {
      return true;
    }
    if (value.toLowerCase() === "false") {
      return false;
    }
  }

  return undefined;
}

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(new URL(req.url).searchParams.entries());
  const parsed = feedQuery.safeParse(params);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const { limit } = parsed.data;
  const featuredFlag = coerceFeatured(parsed.data.featured);
  const cursorDate = parsed.data.cursor ? new Date(parsed.data.cursor) : undefined;

  const devShowPending = process.env.NEXT_PUBLIC_SHOW_PENDING_IN_FEED === "1";
  const where: Prisma.GraveWhereInput = devShowPending
    ? { status: { in: ["APPROVED", "PENDING"] } }
    : { status: "APPROVED" };

  if (typeof featuredFlag === "boolean") {
    where.featured = featuredFlag;
  }

  if (cursorDate) {
    where.createdAt = {
      lt: cursorDate,
    };
  }

  try {
    console.log('[API/feed] Query:', JSON.stringify(where));
    const graves = await prisma.grave.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: limit + 1,
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        eulogyText: true,
        photoUrl: true,
        heartCount: true,
        candleCount: true,
        roseCount: true,
        lolCount: true,
        createdAt: true,
        featured: true,
      },
    });
    console.log('[API/feed] Graves found:', graves.length);

    let nextCursor: string | null = null;
    if (graves.length > limit) {
      const nextRecord = graves.pop();
      if (nextRecord) {
        nextCursor = nextRecord.createdAt.toISOString();
      }
    }

    const items = graves.map((grave) => ({
      id: grave.id,
      slug: grave.slug,
      title: grave.title,
      category: grave.category,
      eulogyPreview: createEulogyPreview(grave.eulogyText),
      photoUrl: grave.photoUrl ?? null,
      reactions: {
        heart: grave.heartCount,
        candle: grave.candleCount,
        rose: grave.roseCount,
        lol: grave.lolCount,
      },
      createdAt: grave.createdAt.toISOString(),
      featured: grave.featured,
    }));
    console.log('[API/feed] Returning items:', items.length);

    const payload = feedResponse.parse({
      items,
      nextCursor,
    });

    return json(payload, 200);
  } catch (error) {
    console.error("/api/feed error", error);
    return internalError();
  }
}
