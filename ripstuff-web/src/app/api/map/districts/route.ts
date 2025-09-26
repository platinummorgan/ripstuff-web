import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { json, internalError } from "@/lib/http";
import { GraveStatus } from "@prisma/client";

export const dynamic = 'force-dynamic';

// GET /api/map/districts - Get all districts with grave counts
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const gridSize = Math.min(Math.max(parseInt(url.searchParams.get("gridSize") || "16"), 8), 32);

    // Get actual grave counts by map coordinates
    const gravesByDistrict = await prisma.grave.groupBy({
      by: ['mapX', 'mapY'],
      where: {
        status: GraveStatus.APPROVED,
        mapX: {
          not: null,
          gte: 0,
          lt: gridSize
        },
        mapY: {
          not: null,
          gte: 0,
          lt: gridSize
        }
      },
      _count: {
        id: true
      }
    });

    // Get a sample photo for each district
    const districtsWithSamples = await Promise.all(
      gravesByDistrict.map(async (district) => {
        const sampleGrave = await prisma.grave.findFirst({
          where: {
            status: GraveStatus.APPROVED,
            mapX: district.mapX,
            mapY: district.mapY,
            photoUrl: {
              not: null
            }
          },
          select: {
            photoUrl: true
          }
        });

        return {
          x: district.mapX!,
          y: district.mapY!,
          graveCount: district._count.id,
          samplePhotoUrl: sampleGrave?.photoUrl || null
        };
      })
    );

    return json({ districts: districtsWithSamples, gridSize });
  } catch (error) {
    console.error("Error fetching districts:", error);
    return internalError();
  }
}