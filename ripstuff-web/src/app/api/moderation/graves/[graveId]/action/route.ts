import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";

import { internalError, json, notFound, unauthorized, validationError } from "@/lib/http";
import { requireUserModerator } from "@/lib/auth";
import { moderationActionInput } from "@/lib/validation";

export const dynamic = 'force-dynamic';
import prisma from "@/lib/prisma";

interface Context {
  params: {
    graveId: string;
  };
}

export async function POST(request: NextRequest, context: Context) {
  try {
    // Check authentication first
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

    console.error("/api/moderation/graves/[graveId]/action auth error", error);
    return internalError();
  }

  const { graveId } = context.params;

  // Validate request body
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ 
      code: "BAD_REQUEST",
      message: "Invalid JSON body" 
    }, 400);
  }

  const parsedAction = moderationActionInput.safeParse(body);
  if (!parsedAction.success) {
    return validationError(parsedAction.error);
  }

  const { action, reason } = parsedAction.data;

  try {
    // Check if grave exists
    const existingGrave = await prisma.grave.findUnique({
      where: { id: graveId },
      select: {
        id: true,
        status: true,
        featured: true,
        reports: {
          where: { resolvedAt: null },
          select: { id: true },
        },
      },
    });

    if (!existingGrave) {
      return notFound("Grave not found");
    }

    let updatedGrave;
    let remainingReports = existingGrave.reports.length;

    // Handle different moderation actions
    switch (action) {
      case "APPROVE":
        updatedGrave = await prisma.grave.update({
          where: { id: graveId },
          data: { status: "APPROVED" },
          select: {
            id: true,
            status: true,
            featured: true,
          },
        });
        break;

      case "HIDE":
        updatedGrave = await prisma.grave.update({
          where: { id: graveId },
          data: { status: "HIDDEN" },
          select: {
            id: true,
            status: true,
            featured: true,
          },
        });
        break;

      case "UNHIDE":
        updatedGrave = await prisma.grave.update({
          where: { id: graveId },
          data: { status: "APPROVED" },
          select: {
            id: true,
            status: true,
            featured: true,
          },
        });
        break;

      case "FEATURE":
        updatedGrave = await prisma.grave.update({
          where: { id: graveId },
          data: { featured: true },
          select: {
            id: true,
            status: true,
            featured: true,
          },
        });
        break;

      case "DELETE":
        // For DELETE, we just delete the grave directly
        // Cascade delete will handle related records (sympathies, reactions, reports, moderation actions)
        await prisma.grave.delete({
          where: { id: graveId },
        });

        // Return success response for deletion
        return json({
          success: true,
          action: "DELETE",
          message: "Grave has been permanently deleted",
        });

      case "NOTE":
        // For NOTE, we don't modify the grave, just record the action
        updatedGrave = {
          id: existingGrave.id,
          status: existingGrave.status,
          featured: existingGrave.featured,
        };
        break;

      default:
        return json({ message: `Unknown action: ${action}` }, 400);
    }

    // Record the moderation action in the trail
    await prisma.moderationAction.create({
      data: {
        graveId,
        action,
        reason,
      },
    });

    // Revalidate the moderation page
    revalidatePath("/moderation");

    return json({
      success: true,
      status: updatedGrave.status,
      featured: updatedGrave.featured,
      remainingReports,
      action,
      reason: reason || null,
    });

  } catch (error) {
    console.error("/api/moderation/graves/[graveId]/action error", error);
    return internalError();
  }
}