import { NextRequest } from "next/server";
import { requireUserModerator } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { internalError, json, notFound, unauthorized } from "@/lib/http";

export async function POST(req: NextRequest, { params }: { params: { reportId: string } }) {
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

    console.error("/api/moderation/reports/[reportId]/resolve auth error", error);
    return internalError();
  }

  try {
    // Find the report
    const report = await prisma.report.findUnique({
      where: { id: params.reportId },
      include: { grave: { select: { id: true, title: true } } },
    });

    if (!report) {
      return notFound("Report not found");
    }

    if (report.resolvedAt) {
      return json({ message: "Report already resolved", alreadyResolved: true }, 200);
    }

    // Mark report as resolved
    await prisma.report.update({
      where: { id: params.reportId },
      data: { resolvedAt: new Date() },
    });

    // Create a moderation action for tracking
    await prisma.moderationAction.create({
      data: {
        graveId: report.graveId,
        action: "NOTE",
        reason: `Report resolved: ${report.reason || "No reason provided"}`,
      },
    });

    return json({ 
      message: "Report resolved successfully",
      success: true 
    }, 200);

  } catch (error) {
    console.error(`/api/moderation/reports/${params.reportId}/resolve error:`, error);
    return internalError();
  }
}