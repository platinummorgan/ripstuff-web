import prisma from "@/lib/prisma";
import { forbidden } from "@/lib/http";

export interface BanCheckResult {
  isBanned: boolean;
  isDeviceBanned: boolean;
  isSuspended: boolean;
  reason?: string;
  expiresAt?: Date | null;
}

/**
 * Check if a user is banned, suspended, or their device is banned
 */
export async function checkUserBanStatus(
  userId?: string,
  deviceHash?: string
): Promise<BanCheckResult> {
  const result: BanCheckResult = {
    isBanned: false,
    isDeviceBanned: false,
    isSuspended: false,
  };

  try {
    // Check user-level bans and suspensions
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          isBanned: true,
          bannedAt: true,
          banReason: true,
          banExpiresAt: true,
          suspendedUntil: true,
        },
      });

      if (user) {
        // Check if user is banned
        if (user.isBanned) {
          // Check if ban has expired
          if (user.banExpiresAt && user.banExpiresAt <= new Date()) {
            // Ban has expired - we should clear it (but for now just ignore)
            result.isBanned = false;
          } else {
            result.isBanned = true;
            result.reason = user.banReason || "Account banned";
            result.expiresAt = user.banExpiresAt;
          }
        }

        // Check if user is suspended
        if (user.suspendedUntil && user.suspendedUntil > new Date()) {
          result.isSuspended = true;
          result.reason = result.reason || "Account temporarily suspended";
          result.expiresAt = user.suspendedUntil;
        }
      }
    }

    // Check device-level bans
    if (deviceHash) {
      const bannedDevice = await prisma.bannedDevice.findUnique({
        where: { deviceHash },
        select: {
          isActive: true,
          reason: true,
          expiresAt: true,
        },
      });

      if (bannedDevice && bannedDevice.isActive) {
        // Check if device ban has expired
        if (bannedDevice.expiresAt && bannedDevice.expiresAt <= new Date()) {
          // Ban has expired - we should clear it (but for now just ignore)
          result.isDeviceBanned = false;
        } else {
          result.isDeviceBanned = true;
          result.reason = result.reason || bannedDevice.reason || "Device banned";
          result.expiresAt = result.expiresAt || bannedDevice.expiresAt;
        }
      }
    }

    return result;
  } catch (error) {
    // If there's an error (e.g., tables don't exist yet), assume not banned
    console.warn("Ban check error (likely before migration):", error);
    return result;
  }
}

/**
 * Middleware to check for bans and return appropriate error response
 */
export async function requireNotBanned(userId?: string, deviceHash?: string) {
  const banStatus = await checkUserBanStatus(userId, deviceHash);

  if (banStatus.isBanned) {
    const message = banStatus.expiresAt
      ? `Account banned until ${banStatus.expiresAt.toLocaleDateString()}. Reason: ${banStatus.reason}`
      : `Account permanently banned. Reason: ${banStatus.reason}`;
    
    throw new Error(`BANNED:${message}`);
  }

  if (banStatus.isDeviceBanned) {
    const message = banStatus.expiresAt
      ? `Device banned until ${banStatus.expiresAt.toLocaleDateString()}. Reason: ${banStatus.reason}`
      : `Device permanently banned. Reason: ${banStatus.reason}`;
    
    throw new Error(`DEVICE_BANNED:${message}`);
  }

  if (banStatus.isSuspended) {
    const message = `Account suspended until ${banStatus.expiresAt?.toLocaleDateString()}. Reason: ${banStatus.reason}`;
    throw new Error(`SUSPENDED:${message}`);
  }

  return banStatus;
}

/**
 * Helper to handle ban-related errors in API routes
 */
export function handleBanError(error: Error) {
  const message = error.message;
  
  if (message.startsWith("BANNED:")) {
    return forbidden(message.replace("BANNED:", ""));
  }
  
  if (message.startsWith("DEVICE_BANNED:")) {
    return forbidden(message.replace("DEVICE_BANNED:", ""));
  }
  
  if (message.startsWith("SUSPENDED:")) {
    return forbidden(message.replace("SUSPENDED:", ""));
  }
  
  throw error; // Re-throw if not a ban error
}

/**
 * Get device hash from request headers (implement based on your current device tracking)
 */
export function getDeviceHashFromRequest(request: Request): string | null {
  // You may want to implement this based on how you currently track device hashes
  // For example, from headers, cookies, or IP address hashing
  return request.headers.get('x-device-hash') || null;
}

/**
 * Batch check multiple users/devices for bans (useful for bulk operations)
 */
export async function batchCheckBans(
  items: Array<{ userId?: string; deviceHash?: string }>
): Promise<Array<{ index: number; banned: boolean; reason?: string }>> {
  const results = await Promise.all(
    items.map(async (item, index) => {
      const banStatus = await checkUserBanStatus(item.userId, item.deviceHash);
      const banned = banStatus.isBanned || banStatus.isDeviceBanned || banStatus.isSuspended;
      
      return {
        index,
        banned,
        reason: banStatus.reason,
      };
    })
  );

  return results;
}