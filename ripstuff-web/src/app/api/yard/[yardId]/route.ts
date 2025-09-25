import { NextRequest } from "next/server";
import { z } from "zod";
import { GraveStatus } from "@prisma/client";

import prisma from "@/lib/prisma";
import { json, validationError, internalError } from "@/lib/http";

export const runtime = "nodejs";

const yardParams = z.object({
  // Full device hash (sha256 hex, 64 chars)
  yardId: z.string().regex(/^[a-f0-9]{64}$/i, "Invalid yard id"),
});

export async function GET(req: NextRequest, { params }: { params: { yardId: string } }) {
  const parsedParams = yardParams.safeParse(params);
  if (!parsedParams.success) {
    return validationError(parsedParams.error);
  }
  const { yardId } = parsedParams.data;

  const search = new URL(req.url).searchParams;
  const limit = Math.min(Math.max(Number(search.get("limit") ?? 12), 1), 24);
  const cursorStr = search.get("cursor");
  const cursor = cursorStr ? new Date(cursorStr) : undefined;

  const where = {
    creatorDeviceHash: { equals: yardId },
    status: { equals: GraveStatus.APPROVED },
    ...(cursor && !Number.isNaN(cursor.getTime()) ? { createdAt: { lt: cursor } } : {}),
  } as const;

  try {
    const graves = await prisma.grave.findMany({
      where,
      orderBy: { createdAt: "desc" },
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

    let nextCursor: string | null = null;
    if (graves.length > limit) {
      const next = graves.pop();
      if (next) nextCursor = next.createdAt.toISOString();
    }

    const items = graves.map((grave) => ({
      id: grave.id,
      slug: grave.slug,
      title: grave.title,
      category: grave.category,
      eulogyPreview: grave.eulogyText.slice(0, 160),
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

    return json({ items, nextCursor });
  } catch (error) {
    return internalError();
  }
}
