import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { json, internalError, validationError } from "@/lib/http";
import { GraveStatus } from "@prisma/client";

// GET /api/map/districts/[x]/[y] - Get graves for a specific district
export async function GET(
  req: NextRequest,
  { params }: { params: { x: string; y: string } }
) {
  try {
    const x = parseInt(params.x);
    const y = parseInt(params.y);

    if (isNaN(x) || isNaN(y) || x < 0 || y < 0 || x > 31 || y > 31) {
      return validationError({
        issues: [
          {
            code: "custom",
            path: ["coordinates"],
            message: "Invalid coordinates. X and Y must be between 0 and 31.",
          },
        ],
        name: "ZodError",
        errors: [],
      } as any);
    }

    // Get graves that are actually located in this district
    const graves = await prisma.grave.findMany({
      where: {
        status: GraveStatus.APPROVED,
        mapX: x,
        mapY: y,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        photoUrl: true,
        category: true,
        heartCount: true,
        candleCount: true,
        roseCount: true,
        lolCount: true,
        createdAt: true,
        featured: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const districtData = {
      x,
      y,
      graveCount: graves.length,
      graves: graves.map((grave) => ({
        id: grave.id,
        slug: grave.slug,
        title: grave.title,
        photoUrl: grave.photoUrl,
        category: grave.category,
        reactions: {
          heart: grave.heartCount,
          candle: grave.candleCount,
          rose: grave.roseCount,
          lol: grave.lolCount,
        },
        createdAt: grave.createdAt.toISOString(),
        featured: grave.featured,
      })),
    };

    return json(districtData);
  } catch (error) {
    console.error(`Error fetching district ${params.x},${params.y}:`, error);
    return internalError();
  }
}