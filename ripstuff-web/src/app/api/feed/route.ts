import { Prisma, GraveCategory } from "@prisma/client";
import { NextRequest } from "next/server";

import { createEulogyPreview } from "@/lib/eulogy";
import { internalError, json, validationError } from "@/lib/http";
import prisma from "@/lib/prisma";
import { feedQuery, feedResponse } from "@/lib/validation";

export const dynamic = 'force-dynamic';

function coerceFeatured(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    if (value.toLowerCase() === "true") {
      return true;
    }
    if (value.toLowerCase() === "false") {
      return false;
    }
  }

  return undefined;
}

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(new URL(req.url).searchParams.entries());
  const parsed = feedQuery.safeParse(params);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const { limit } = parsed.data;
  const featuredFlag = coerceFeatured(parsed.data.featured);
  const cursorDate = parsed.data.cursor ? new Date(parsed.data.cursor) : undefined;

  // Extract search and filter parameters
  const searchQuery = params.search?.trim();
  const category = params.category && params.category !== 'ALL' ? params.category as GraveCategory : undefined;
  const sortBy = params.sortBy || 'newest';
  const timeRange = params.timeRange || 'all';
  const hasPhoto = params.hasPhoto === 'true' ? true : params.hasPhoto === 'false' ? false : undefined;
  const minReactions = params.minReactions ? parseInt(params.minReactions, 10) : 0;
  const offset = params.offset ? parseInt(params.offset, 10) : 0;

  const devShowPending = process.env.NEXT_PUBLIC_SHOW_PENDING_IN_FEED === "1";
  const where: Prisma.GraveWhereInput = devShowPending
    ? { status: { in: ["APPROVED", "PENDING"] } }
    : { status: "APPROVED" };

  if (typeof featuredFlag === "boolean") {
    where.featured = featuredFlag;
  }

  // Search functionality
  if (searchQuery) {
    where.OR = [
      { title: { contains: searchQuery, mode: 'insensitive' } },
      { eulogyText: { contains: searchQuery, mode: 'insensitive' } },
      { backstory: { contains: searchQuery, mode: 'insensitive' } },
    ];
  }

  // Category filter
  if (category) {
    where.category = category;
  }

  // Time range filter
  if (timeRange !== 'all') {
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case 'today':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // fallback to beginning of time
    }
    
    if (!where.createdAt) {
      where.createdAt = { gte: startDate };
    } else if (typeof where.createdAt === 'object') {
      where.createdAt = { ...where.createdAt, gte: startDate };
    }
  }

  // Determine if we have active filters (use offset-based pagination for filtered results)
  const hasActiveFilters = searchQuery || category || sortBy !== 'newest' || timeRange !== 'all' || hasPhoto !== undefined || minReactions > 0;
  
  // Use cursor-based pagination only for simple newest-first queries without filters
  if (cursorDate && !hasActiveFilters) {
    where.createdAt = {
      lt: cursorDate,
    };
  }

  // Photo filter
  if (hasPhoto !== undefined) {
    if (hasPhoto) {
      where.photoUrl = { not: null };
    } else {
      where.photoUrl = null;
    }
  }

  // Build orderBy based on sortBy parameter
  let orderBy: Prisma.GraveOrderByWithRelationInput[] = [{ createdAt: "desc" }];
  
  switch (sortBy) {
    case 'oldest':
      orderBy = [{ createdAt: "asc" }];
      break;
    case 'popular':
      orderBy = [
        { heartCount: "desc" },
        { candleCount: "desc" },
        { roseCount: "desc" },
        { lolCount: "desc" },
        { createdAt: "desc" }
      ];
      break;
    case 'controversial':
      // Sort by roast count desc (most controversial first)
      orderBy = [
        { roastCount: "desc" },
        { eulogyCount: "desc" },
        { createdAt: "desc" }
      ];
      break;
    case 'alphabetical':
      orderBy = [{ title: "asc" }];
      break;
    case 'newest':
    default:
      orderBy = [{ createdAt: "desc" }];
      break;
  }

  try {
    console.log('[API/feed] Query:', JSON.stringify(where));
    console.log('[API/feed] OrderBy:', JSON.stringify(orderBy));
    
    // Use different pagination strategies based on whether filters are active
    const queryOptions: any = {
      where,
      orderBy,
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        eulogyText: true,
        photoUrl: true,
        heartCount: true,
        candleCount: true,
        roseCount: true,
        lolCount: true,
        roastCount: true,
        eulogyCount: true,
        createdAt: true,
        featured: true,
        creatorDeviceHash: true,
      },
    };

    if (hasActiveFilters) {
      // Use offset-based pagination for filtered results
      queryOptions.skip = offset;
      queryOptions.take = limit + 1; // +1 to check if there are more results
    } else {
      // Use cursor-based pagination for simple queries
      queryOptions.take = limit + 1;
    }

    let graves = await prisma.grave.findMany(queryOptions);

    // Apply minimum reactions filter after fetching
    if (minReactions > 0) {
      graves = graves.filter(grave => 
        (grave.heartCount + grave.candleCount + grave.roseCount + grave.lolCount) >= minReactions
      );
    }

    // Get creator info for all graves
    const deviceHashes = graves
      .map(g => g.creatorDeviceHash)
      .filter((hash): hash is string => hash !== null);
    
    const creators = deviceHashes.length > 0 
      ? await prisma.user.findMany({
          where: { deviceHash: { in: deviceHashes } },
          select: { id: true, deviceHash: true, name: true, picture: true },
        })
      : [];
    
    const creatorMap = new Map(
      creators.map(creator => [creator.deviceHash, creator])
    );
    console.log('[API/feed] Graves found:', graves.length);

    // Handle pagination metadata
    let nextCursor: string | null = null;
    let nextOffset: number | null = null;
    
    if (graves.length > limit) {
      const nextRecord = graves.pop(); // Remove the extra record
      
      if (hasActiveFilters) {
        // For filtered results, use offset-based pagination
        nextOffset = offset + limit;
      } else if (nextRecord) {
        // For simple queries, use cursor-based pagination
        nextCursor = nextRecord.createdAt.toISOString();
      }
    }

    const items = graves.map((grave) => {
      const creator = grave.creatorDeviceHash 
        ? creatorMap.get(grave.creatorDeviceHash) 
        : null;
      
      return {
        id: grave.id,
        slug: grave.slug,
        title: grave.title,
        category: grave.category,
        eulogyPreview: createEulogyPreview(grave.eulogyText),
        photoUrl: grave.photoUrl ?? null,
        reactions: {
          heart: grave.heartCount,
          candle: grave.candleCount,
          rose: grave.roseCount,
          lol: grave.lolCount,
        },
        createdAt: grave.createdAt.toISOString(),
        featured: grave.featured,
        creatorInfo: creator ? {
          id: creator.id,
          name: creator.name,
          picture: creator.picture,
        } : null,
      };
    });
    console.log('[API/feed] Returning items:', items.length);

    const payload = feedResponse.parse({
      items,
      nextCursor: nextCursor || (nextOffset !== null ? nextOffset.toString() : null),
    });

    return json(payload, 200);
  } catch (error) {
    console.error("/api/feed error", error);
    return internalError();
  }
}
