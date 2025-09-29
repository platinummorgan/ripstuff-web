import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { GraveCard } from "@/components/GraveCard";
import { HeadstoneCard } from "@/components/HeadstoneCard";
import { CemeteryCanvas } from "@/components/cemetery/CemeteryCanvas";
import { SearchAndFilter, type SearchFilters } from "@/components/SearchAndFilter";
import UserProfileHeader from "@/components/profile/UserProfileHeader";
import { UserMemorialStats } from "@/components/profile/UserMemorialStats";
import { SearchableUserFeed } from "@/components/profile/SearchableUserFeed";
import prisma from "@/lib/prisma";
import { createEulogyPreview } from "@/lib/eulogy";
import type { FeedItem } from "@/lib/validation";
import { getCurrentUser } from "@/lib/auth";

interface UserProfilePageProps {
  params: { userId: string };
  searchParams: { view?: 'grid' | 'cemetery'; [key: string]: string | string[] | undefined };
}

interface UserProfileData {
  user: {
    id: string;
    name: string | null;
    picture: string | null;
    email: string;
    createdAt: Date;
    isModerator: boolean;
  };
  memorials: FeedItem[];
  stats: {
    totalMemorials: number;
    totalReactions: number;
    totalSympathies: number;
    joinedAt: string;
    popularCategories: Array<{ category: string; count: number }>;
  };
}

async function fetchUserProfile(userId: string): Promise<UserProfileData | null> {
  try {
    // Find user by ID (exact match only for UUIDs)
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        picture: true,
        email: true,
        createdAt: true,
        isModerator: true,
        deviceHash: true,
      },
    });

    if (!user) {
      return null;
    }

    // Get user's memorials
    const memorials = await prisma.grave.findMany({
      where: {
        creatorDeviceHash: user.deviceHash,
        status: "APPROVED",
      },
      orderBy: { createdAt: "desc" },
      take: 50, // Reasonable limit for public profiles
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
      },
    });

    // Get sympathies count for this user's memorials
    const sympathyCount = await prisma.sympathy.count({
      where: {
        grave: {
          creatorDeviceHash: user.deviceHash,
          status: "APPROVED",
        },
      },
    });

    // Calculate stats
    const totalReactions = memorials.reduce(
      (sum, memorial) =>
        sum +
        memorial.heartCount +
        memorial.candleCount +
        memorial.roseCount +
        memorial.lolCount,
      0
    );

    // Popular categories
    const categoryStats = memorials.reduce((acc, memorial) => {
      acc[memorial.category] = (acc[memorial.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const popularCategories = Object.entries(categoryStats)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Transform memorials to FeedItem format
    const feedItems: FeedItem[] = memorials.map((memorial) => ({
      id: memorial.id,
      slug: memorial.slug,
      title: memorial.title,
      category: memorial.category,
      eulogyPreview: createEulogyPreview(memorial.eulogyText),
      photoUrl: memorial.photoUrl ?? null,
      reactions: {
        heart: memorial.heartCount,
        candle: memorial.candleCount,
        rose: memorial.roseCount,
        lol: memorial.lolCount,
      },
      createdAt: memorial.createdAt.toISOString(),
      featured: memorial.featured,
      creatorInfo: {
        name: user.name,
        picture: user.picture,
      },
    }));

    return {
      user: {
        id: user.id,
        name: user.name,
        picture: user.picture,
        email: user.email,
        createdAt: user.createdAt,
        isModerator: user.isModerator,
      },
      memorials: feedItems,
      stats: {
        totalMemorials: memorials.length,
        totalReactions,
        totalSympathies: sympathyCount,
        joinedAt: user.createdAt.toISOString(),
        popularCategories,
      },
    };
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    return null;
  }
}

export async function generateMetadata({ params }: UserProfilePageProps): Promise<Metadata> {
  const profileData = await fetchUserProfile(params.userId);
  
  if (!profileData) {
    return {
      title: "User Profile Not Found - Virtual Graveyard",
      description: "The requested user profile could not be found.",
    };
  }

  const { user, stats } = profileData;
  const displayName = user.name || "Anonymous User";

  return {
    title: `${displayName}'s Profile - Virtual Graveyard`,
    description: `${displayName} has created ${stats.totalMemorials} memorial${stats.totalMemorials !== 1 ? 's' : ''} with ${stats.totalReactions} total reactions. Explore their collection of memorials on Virtual Graveyard.`,
    openGraph: {
      title: `${displayName}'s Memorial Collection`,
      description: `${displayName} has memorialized ${stats.totalMemorials} departed items. See their virtual graveyard collection.`,
      images: user.picture ? [{ url: user.picture }] : undefined,
    },
    twitter: {
      card: "summary",
      title: `${displayName}'s Memorial Collection`,
      description: `${displayName} has memorialized ${stats.totalMemorials} departed items on Virtual Graveyard.`,
      images: user.picture ? [user.picture] : undefined,
    },
  };
}

export default async function UserProfilePage({ params, searchParams }: UserProfilePageProps) {
  const profileData = await fetchUserProfile(params.userId);

  if (!profileData) {
    notFound();
  }

  const { user, memorials, stats } = profileData;
  const viewMode = (searchParams.view as 'grid' | 'cemetery') || 'grid';
  
  // Check if this is the current user's own profile
  const currentUser = await getCurrentUser();
  const isOwnProfile = currentUser?.id === user.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-6 space-y-8">
        {/* User Profile Header */}
        <UserProfileHeader user={user} stats={stats} isOwnProfile={isOwnProfile} />

        {/* Stats Overview */}
        <UserMemorialStats stats={stats} />

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-white">
            Memorial Collection ({memorials.length})
          </div>
          
          <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] p-1">
            <button
              className={`rounded-md px-3 py-1 text-sm transition-colors ${
                viewMode === "grid" 
                  ? "bg-[rgba(255,255,255,0.08)] text-white" 
                  : "text-[var(--muted)] hover:text-white"
              }`}
            >
              <a href={`/user/${params.userId}?view=grid`}>📋 Grid View</a>
            </button>
            <button
              className={`rounded-md px-3 py-1 text-sm transition-colors ${
                viewMode === "cemetery" 
                  ? "bg-[rgba(255,255,255,0.08)] text-white" 
                  : "text-[var(--muted)] hover:text-white"
              }`}
            >
              <a href={`/user/${params.userId}?view=cemetery`}>🪦 Cemetery View</a>
            </button>
          </div>
        </div>

        {/* Memorial Collection */}
        {memorials.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)]">
            <div className="text-4xl mb-4">💀</div>
            <h3 className="text-lg font-medium text-white mb-2">No memorials yet</h3>
            <p className="text-sm text-[var(--muted)]">
              {user.name || "This user"} hasn't created any public memorials yet.
            </p>
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <SearchableUserFeed 
                initialItems={memorials}
                userId={params.userId}
                className="w-full"
              />
            ) : (
              <CemeteryCanvas>
                <div className="grid grid-cols-3 gap-5 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
                  {memorials.map((memorial, i) => (
                    <div
                      key={memorial.id}
                      style={{ transform: `rotate(${((i % 7) - 3) * 0.5}deg)` }}
                      className="scale-[1.08] transition-transform duration-200 hover:scale-[1.15]"
                    >
                      <HeadstoneCard grave={memorial} />
                    </div>
                  ))}
                </div>
              </CemeteryCanvas>
            )}
          </>
        )}
      </div>
    </div>
  );
}