import { NextRequest } from "next/server";
import { z } from "zod";

import { internalError, json, unauthorized, validationError } from "@/lib/http";
import { requireUserModerator } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

const userSearchSchema = z.object({
  query: z.string().optional(),
  status: z.enum(['all', 'active', 'banned', 'suspended']).optional().default('all'),
  limit: z.coerce.number().min(1).max(100).optional().default(25),
  cursor: z.string().optional(),
});

// GET /api/moderation/users - Search and list users
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
    console.error("/api/moderation/users auth error", error);
    return internalError();
  }

  const { searchParams } = new URL(request.url);
  const parsedQuery = userSearchSchema.safeParse({
    query: searchParams.get('query') || undefined,
    status: searchParams.get('status') || 'all',
    limit: searchParams.get('limit') || '25',
    cursor: searchParams.get('cursor') || undefined,
  });

  if (!parsedQuery.success) {
    return validationError(parsedQuery.error);
  }

  const { query, status, limit, cursor } = parsedQuery.data;

  try {
    const where: any = {};
    
    // Apply status filter (will work after migration)
    // For now, we'll prepare the logic but it won't filter until migration is applied
    if (status === 'banned') {
      where.isBanned = true; // This field will exist after migration
    } else if (status === 'suspended') {
      where.suspendedUntil = { gt: new Date() }; // This field will exist after migration
    } else if (status === 'active') {
      // Will work after migration - for now shows all users
      where.AND = [
        { OR: [{ isBanned: { not: true } }, { isBanned: null }] },
        { OR: [{ suspendedUntil: null }, { suspendedUntil: { lt: new Date() } }] }
      ];
    }

    // Apply search query
    if (query) {
      where.OR = [
        { email: { contains: query, mode: 'insensitive' } },
        { name: { contains: query, mode: 'insensitive' } },
        { deviceHash: { contains: query } },
      ];
    }

    // Apply cursor pagination
    if (cursor) {
      where.createdAt = { lt: new Date(cursor) };
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1, // Fetch one extra to check if there's a next page
      select: {
        id: true,
        email: true,
        name: true,
        picture: true,
        provider: true,
        deviceHash: true,
        isModerator: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const hasNextPage = users.length > limit;
    const items = hasNextPage ? users.slice(0, -1) : users;
    const nextCursor = hasNextPage ? items[items.length - 1].createdAt.toISOString() : null;

    // Get user stats for each user
    const userStats = await Promise.all(
      items.map(async (user) => {
        const userDeviceHash = user.deviceHash;
        
        if (!userDeviceHash) {
          return {
            userId: user.id,
            gravesCount: 0,
            reportsCount: 0,
            sympathiesCount: 0,
          };
        }

        const [gravesCount, reportsCount, sympathiesCount] = await Promise.all([
          prisma.grave.count({
            where: { creatorDeviceHash: userDeviceHash }
          }),
          prisma.report.count({
            where: { deviceHash: userDeviceHash }
          }),
          prisma.sympathy.count({
            where: { deviceHash: userDeviceHash }
          }),
        ]);

        return {
          userId: user.id,
          gravesCount,
          reportsCount,
          sympathiesCount,
        };
      })
    );

    const itemsWithStats = items.map((user) => ({
      ...user,
      // Add placeholders for ban fields until migration is applied
      isBanned: false,
      bannedAt: null,
      bannedBy: null,
      banReason: null,
      banExpiresAt: null,
      suspendedUntil: null,
      stats: userStats.find((s) => s.userId === user.id) || {
        gravesCount: 0,
        reportsCount: 0,
        sympathiesCount: 0,
      },
    }));

    return json({
      items: itemsWithStats,
      nextCursor,
      total: items.length,
    });

  } catch (error) {
    console.error("User search error:", error);
    return internalError();
  }
}