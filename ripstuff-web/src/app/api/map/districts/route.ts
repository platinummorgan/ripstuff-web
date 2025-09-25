import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { json, internalError } from "@/lib/http";
import { GraveStatus } from "@prisma/client";

// GET /api/map/districts - Get all districts with grave counts
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const gridSize = Math.min(Math.max(parseInt(url.searchParams.get("gridSize") || "16"), 8), 32);

    // For now, return a simple response with some demo data until TypeScript issues are resolved
    const totalGraves = await prisma.grave.count({
      where: {
        status: GraveStatus.APPROVED,
      },
    });

    // Create some demo districts for now
    const districts = [];
    if (totalGraves > 0) {
      // Distribute graves across a few demo districts
      const gravesPerDistrict = Math.ceil(totalGraves / 4);
      const demoDistricts = [
        { x: 2, y: 3, graveCount: Math.min(gravesPerDistrict, totalGraves), samplePhotoUrl: null },
        { x: 5, y: 7, graveCount: Math.min(gravesPerDistrict, Math.max(0, totalGraves - gravesPerDistrict)), samplePhotoUrl: null },
        { x: 8, y: 2, graveCount: Math.min(gravesPerDistrict, Math.max(0, totalGraves - gravesPerDistrict * 2)), samplePhotoUrl: null },
        { x: 12, y: 9, graveCount: Math.max(0, totalGraves - gravesPerDistrict * 3), samplePhotoUrl: null }
      ];
      districts.push(...demoDistricts.filter(d => d.graveCount > 0));
    }

    return json({ districts, gridSize });
  } catch (error) {
    console.error("Error fetching districts:", error);
    return internalError();
  }
}