import { NextRequest } from "next/server";
import { z } from "zod";

import { internalError, json, notFound, unauthorized, validationError } from "@/lib/http";
import { requireUserModerator } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

const banUserSchema = z.object({
  reason: z.string().min(1).max(280).optional(),
  expiresAt: z.string().datetime().optional(), // ISO string for expiration
  type: z.enum(['ban', 'suspend']).default('ban'),
});

const unbanUserSchema = z.object({
  reason: z.string().min(1).max(280).optional(),
});

// POST /api/moderation/users/[userId]/ban - Ban or suspend a user
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
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
    console.error("/api/moderation/users/[userId]/ban auth error", error);
    return internalError();
  }

  const body = await request.json().catch(() => ({}));
  const parsedBody = banUserSchema.safeParse(body);

  if (!parsedBody.success) {
    return validationError(parsedBody.error);
  }

  const { reason, expiresAt, type } = parsedBody.data;
  const { userId } = params;

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return notFound("User not found");
    }

    // Check if user is a moderator (prevent banning moderators)
    if (user.isModerator) {
      return json({ error: "Cannot ban moderator accounts" }, 403);
    }

    const now = new Date();
    const expirationDate = expiresAt ? new Date(expiresAt) : null;

    // Update user ban status
    const updateData: any = {
      updatedAt: now,
    };

    if (type === 'ban') {
      updateData.isBanned = true;
      updateData.bannedAt = now;
      updateData.banReason = reason;
      updateData.banExpiresAt = expirationDate;
      updateData.bannedBy = 'system'; // TODO: Get actual moderator ID
    } else if (type === 'suspend') {
      updateData.suspendedUntil = expirationDate || new Date(Date.now() + 24 * 60 * 60 * 1000); // Default 24h
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        isBanned: true,
        bannedAt: true,
        banReason: true,
        banExpiresAt: true,
        suspendedUntil: true,
        updatedAt: true,
      },
    });

    // Create moderation action record
    await prisma.userModerationAction.create({
      data: {
        targetUserId: userId,
        targetDeviceHash: user.deviceHash,
        moderatorId: 'system', // TODO: Get actual moderator ID
        action: type === 'ban' ? 'BAN_USER' : 'SUSPEND_USER',
        reason,
        expiresAt: expirationDate,
        metadata: JSON.stringify({
          userEmail: user.email,
          userName: user.name,
          permanent: !expirationDate,
        }),
      },
    });

    return json({
      success: true,
      user: updatedUser,
      message: `User ${type}ned successfully`,
    });

  } catch (error) {
    console.error(`User ${type} error:`, error);
    return internalError();
  }
}

// DELETE /api/moderation/users/[userId]/ban - Unban a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
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
    console.error("/api/moderation/users/[userId]/ban auth error", error);
    return internalError();
  }

  const body = await request.json().catch(() => ({}));
  const parsedBody = unbanUserSchema.safeParse(body);

  if (!parsedBody.success) {
    return validationError(parsedBody.error);
  }

  const { reason } = parsedBody.data;
  const { userId } = params;

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return notFound("User not found");
    }

    const now = new Date();

    // Update user to remove ban/suspension
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: false,
        bannedAt: null,
        bannedBy: null,
        banReason: null,
        banExpiresAt: null,
        suspendedUntil: null,
        updatedAt: now,
      },
      select: {
        id: true,
        email: true,
        name: true,
        isBanned: true,
        bannedAt: true,
        banReason: true,
        banExpiresAt: true,
        suspendedUntil: true,
        updatedAt: true,
      },
    });

    // Create moderation action record
    await prisma.userModerationAction.create({
      data: {
        targetUserId: userId,
        targetDeviceHash: user.deviceHash,
        moderatorId: 'system', // TODO: Get actual moderator ID
        action: 'UNBAN_USER',
        reason: reason || 'Manual unban',
        metadata: JSON.stringify({
          userEmail: user.email,
          userName: user.name,
        }),
      },
    });

    return json({
      success: true,
      user: updatedUser,
      message: "User unbanned successfully",
    });

  } catch (error) {
    console.error("User unban error:", error);
    return internalError();
  }
}