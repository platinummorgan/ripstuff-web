import { Prisma } from "@prisma/client";
import { GraveCard } from "@/components/GraveCard";
import { LoadMoreFeedButton } from "./LoadMoreFeedButton";
import { createEulogyPreview } from "@/lib/eulogy";
import prisma from "@/lib/prisma";
import type { FeedItem } from "@/lib/validation";

interface FeedResponse {
  items: FeedItem[];
  nextCursor: string | null;
}

interface FeedListProps {
  featured?: boolean;
}

async function fetchFeedItems(featured?: boolean): Promise<FeedResponse> {
  try {
    const devShowPending = process.env.NEXT_PUBLIC_SHOW_PENDING_IN_FEED === "1";
    const where: Prisma.GraveWhereInput = devShowPending
      ? { status: { in: ["APPROVED", "PENDING"] } }
      : { status: "APPROVED" };

    if (typeof featured === "boolean") {
      where.featured = featured;
    }

    const limit = 8;
    const graves = await prisma.grave.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: limit + 1,
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
        createdAt: true,
        featured: true,
        creatorDeviceHash: true,
      },
    });

    // Get creator info for all graves
    const deviceHashes = graves
      .map(g => g.creatorDeviceHash)
      .filter((hash): hash is string => hash !== null);
    
    const creators = deviceHashes.length > 0 
      ? await prisma.user.findMany({
          where: { deviceHash: { in: deviceHashes } },
          select: { deviceHash: true, name: true, picture: true },
        })
      : [];
    
    const creatorMap = new Map(
      creators.map(creator => [creator.deviceHash, creator])
    );

    let nextCursor: string | null = null;
    if (graves.length > limit) {
      const nextRecord = graves.pop();
      if (nextRecord) {
        nextCursor = nextRecord.createdAt.toISOString();
      }
    }

    const items: FeedItem[] = graves.map((grave) => {
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
          name: creator.name,
          picture: creator.picture,
        } : null,
      };
    });

    return { items, nextCursor };
  } catch (error) {
    console.error('[FeedList] Error fetching feed items:', error);
    return { items: [], nextCursor: null };
  }
}

export async function FeedList({ featured }: FeedListProps = {}) {
  const { items, nextCursor } = await fetchFeedItems(featured);

  if (!items.length) {
    return <p className="text-sm text-[var(--muted)]">No graves here yet. Be the first to bury something memorable.</p>;
  }

  return (
    <div className="space-y-10">
      <div className="grid gap-6 sm:grid-cols-2">
        {items.map((item) => (
          <GraveCard key={`${item.id}-${item.slug}`} grave={item} />
        ))}
      </div>
      {nextCursor && (
        <div className="flex justify-center">
          <LoadMoreFeedButton 
            cursor={nextCursor} 
            featured={featured}
            initialItems={items}
          />
        </div>
      )}
    </div>
  );
}
