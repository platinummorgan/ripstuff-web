import type { NextRequest } from "next/server";

import { createEulogyPreview } from "@/lib/eulogy";
import { internalError, json, notFound } from "@/lib/http";
import prisma from "@/lib/prisma";
import { graveDetailResponse } from "@/lib/validation";

const SYMPATHY_LIMIT = Number.parseInt(process.env.GRAVE_SYMPATHY_LIMIT ?? "50", 10);

interface RouteContext {
  params: {
    slug: string;
  };
}

export async function GET(_req: NextRequest, context: RouteContext) {
  const params = await context.params;
  const { slug } = params;

  if (!slug) {
    return notFound("Missing slug parameter");
  }

  try {
    const grave = await prisma.grave.findUnique({
      where: { slug },
      include: {
        sympathies: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: SYMPATHY_LIMIT,
        },
      },
    });

    // Get creator info if available
    let creatorInfo = null;
    if (grave?.creatorDeviceHash) {
      const user = await prisma.user.findFirst({
        where: { deviceHash: grave.creatorDeviceHash },
        select: { name: true, picture: true },
      });
      if (user) {
        creatorInfo = {
          name: user.name,
          picture: user.picture,
        };
      }
    }

    if (!grave || grave.status === "HIDDEN") {
      return notFound("Grave not found");
    }

    const payload = graveDetailResponse.parse({
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
      roastCount: grave.roastCount || 0,
      eulogyCount: grave.eulogyCount || 0,
      createdAt: grave.createdAt.toISOString(),
      featured: grave.featured,
      eulogyText: grave.eulogyText,
      datesText: grave.datesText ?? null,
      backstory: grave.backstory ?? null,
      creatorInfo,
      sympathies: grave.sympathies.map((sympathy) => ({
        id: sympathy.id,
        body: sympathy.body,
        createdAt: sympathy.createdAt.toISOString(),
      })),
      status: grave.status,
    });

    return json(payload, 200);
  } catch (error) {
    console.error(`/api/graves/${slug} error`, error);
    return internalError();
  }
}
