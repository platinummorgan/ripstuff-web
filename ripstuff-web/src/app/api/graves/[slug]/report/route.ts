import { NextRequest } from "next/server";
import { requireNotBanned, handleBanError } from "@/lib/ban-enforcement";
import { resolveDeviceHash } from "@/lib/device";
import prisma from "@/lib/prisma";
import { internalError, json, notFound, rateLimitError, validationError } from "@/lib/http";
import { checkRateLimit, rateLimitRetrySeconds } from "@/lib/rate-limit";
import { z } from "zod";

const reportInput = z.object({
  reason: z.string().trim().min(10).max(280).optional(),
});

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const deviceHash = resolveDeviceHash();
  
  // Rate limiting for reports
  const rateResult = await checkRateLimit({
    scope: "grave:report",
    identifier: deviceHash,
    limit: 3, // 3 reports per hour per device
    windowSeconds: 3600,
  });

  if (!rateResult.ok) {
    return rateLimitError(rateLimitRetrySeconds(rateResult));
  }

  // Check if user or device is banned
  try {
    await requireNotBanned(undefined, deviceHash);
  } catch (error) {
    if (error instanceof Error) {
      return handleBanError(error);
    }
    throw error;
  }

  // Parse request body
  const body = await req.json().catch(() => ({}));
  const parsed = reportInput.safeParse(body);
  
  if (!parsed.success) {
    return validationError(parsed.error);
  }

  try {
    // Find the grave by slug
    const grave = await prisma.grave.findUnique({
      where: { slug: params.slug },
      select: { id: true, title: true },
    });

    if (!grave) {
      return notFound("Grave not found");
    }

    // Check if user already reported this grave
    const existingReport = await prisma.report.findUnique({
      where: {
        graveId_deviceHash: {
          graveId: grave.id,
          deviceHash,
        },
      },
    });

    if (existingReport) {
      return json({ 
        message: "You have already reported this memorial. Thank you for helping keep our community safe.",
        alreadyReported: true 
      }, 200);
    }

    // Create the report
    await prisma.report.create({
      data: {
        graveId: grave.id,
        deviceHash,
        reason: parsed.data.reason || "Inappropriate content",
      },
    });

    // Create a moderation action for tracking
    await prisma.moderationAction.create({
      data: {
        graveId: grave.id,
        action: "NOTE",
        reason: `Report received: ${parsed.data.reason || "Inappropriate content"}`,
      },
    });

    return json({ 
      message: "Report received. We'll review this memorial shortly and take appropriate action if needed. Thank you for helping keep our community safe.",
      success: true 
    }, 200);

  } catch (error) {
    console.error(`/api/graves/${params.slug}/report error:`, error);
    return internalError();
  }
}