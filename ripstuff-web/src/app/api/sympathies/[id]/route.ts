import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { json, forbidden, notFound, internalError } from "@/lib/http";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated and is a moderator
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }
    
    if (!currentUser.isModerator) {
      return forbidden("MODERATOR_PERMISSIONS_REQUIRED");
    }

    const sympathyId = params.id;

    // Find the sympathy to delete
    const sympathy = await prisma.sympathy.findUnique({
      where: { id: sympathyId },
      include: {
        grave: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      }
    });

    if (!sympathy) {
      return notFound();
    }

    // Delete the sympathy
    await prisma.sympathy.delete({
      where: { id: sympathyId }
    });

    // Log the moderation action
    await prisma.moderationAction.create({
      data: {
        graveId: sympathy.grave.id,
        action: "DELETE_SYMPATHY",
        reason: `Moderator ${currentUser.name || currentUser.email} deleted sympathy: "${sympathy.body.substring(0, 50)}${sympathy.body.length > 50 ? '...' : ''}"`
      }
    });

    return json({ 
      success: true, 
      message: 'Sympathy deleted successfully',
      graveSlug: sympathy.grave.slug 
    });

  } catch (error) {
    console.error('Error deleting sympathy:', error);
    return internalError();
  }
}