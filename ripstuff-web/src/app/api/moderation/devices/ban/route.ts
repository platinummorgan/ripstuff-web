import { NextRequest } from "next/server";
import { z } from "zod";

import { internalError, json, unauthorized, validationError } from "@/lib/http";
import { requireUserModerator } from "@/lib/auth";
import prisma from "@/lib/prisma";

const banDeviceSchema = z.object({
  deviceHash: z.string().min(1),
  reason: z.string().min(1).max(280).optional(),
  expiresAt: z.string().datetime().optional(), // ISO string for expiration
});

const unbanDeviceSchema = z.object({
  deviceHash: z.string().min(1),
  reason: z.string().min(1).max(280).optional(),
});

// POST /api/moderation/devices/ban - Ban a device hash
export async function POST(request: NextRequest) {
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
    console.error("/api/moderation/devices/ban auth error", error);
    return internalError();
  }

  const body = await request.json().catch(() => ({}));
  const parsedBody = banDeviceSchema.safeParse(body);

  if (!parsedBody.success) {
    return validationError(parsedBody.error);
  }

  const { deviceHash, reason, expiresAt } = parsedBody.data;

  try {
    const now = new Date();
    const expirationDate = expiresAt ? new Date(expiresAt) : null;

    // Create or update banned device record
    const bannedDevice = await prisma.bannedDevice.upsert({
      where: { deviceHash },
      create: {
        deviceHash,
        reason: reason || 'Banned for violating community guidelines',
        bannedBy: 'system', // TODO: Get actual moderator ID
        expiresAt: expirationDate,
        isActive: true,
      },
      update: {
        reason: reason || 'Banned for violating community guidelines',
        bannedBy: 'system', // TODO: Get actual moderator ID
        expiresAt: expirationDate,
        isActive: true,
        updatedAt: now,
      },
    });

    // Create moderation action record
    await prisma.userModerationAction.create({
      data: {
        targetDeviceHash: deviceHash,
        moderatorId: 'system', // TODO: Get actual moderator ID
        action: 'BAN_DEVICE',
        reason,
        expiresAt: expirationDate,
        metadata: JSON.stringify({
          deviceHash,
          permanent: !expirationDate,
        }),
      },
    });

    return json({
      success: true,
      bannedDevice,
      message: "Device banned successfully",
    });

  } catch (error) {
    console.error("Device ban error:", error);
    return internalError();
  }
}

// DELETE /api/moderation/devices/ban - Unban a device hash
export async function DELETE(request: NextRequest) {
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
    console.error("/api/moderation/devices/ban auth error", error);
    return internalError();
  }

  const body = await request.json().catch(() => ({}));
  const parsedBody = unbanDeviceSchema.safeParse(body);

  if (!parsedBody.success) {
    return validationError(parsedBody.error);
  }

  const { deviceHash, reason } = parsedBody.data;

  try {
    // Update banned device to inactive
    const bannedDevice = await prisma.bannedDevice.update({
      where: { deviceHash },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    // Create moderation action record
    await prisma.userModerationAction.create({
      data: {
        targetDeviceHash: deviceHash,
        moderatorId: 'system', // TODO: Get actual moderator ID
        action: 'UNBAN_DEVICE',
        reason: reason || 'Manual device unban',
        metadata: JSON.stringify({
          deviceHash,
        }),
      },
    });

    return json({
      success: true,
      bannedDevice,
      message: "Device unbanned successfully",
    });

  } catch (error) {
    console.error("Device unban error:", error);
    return internalError();
  }
}

// GET /api/moderation/devices/ban - List banned devices
export async function GET(request: NextRequest) {
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
    console.error("/api/moderation/devices/ban auth error", error);
    return internalError();
  }

  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active') !== 'false'; // Default to showing active bans only
    const limit = Math.min(parseInt(searchParams.get('limit') || '25'), 100);
    const cursor = searchParams.get('cursor');

    const where: any = { isActive: active };
    
    if (cursor) {
      where.createdAt = { lt: new Date(cursor) };
    }

    const bannedDevices = await prisma.bannedDevice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
    });

    const hasNextPage = bannedDevices.length > limit;
    const items = hasNextPage ? bannedDevices.slice(0, -1) : bannedDevices;
    const nextCursor = hasNextPage ? items[items.length - 1].createdAt.toISOString() : null;

    return json({
      items,
      nextCursor,
      total: items.length,
    });

  } catch (error) {
    console.error("List banned devices error:", error);
    return internalError();
  }
}