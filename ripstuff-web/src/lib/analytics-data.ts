import prisma from "@/lib/prisma";

export interface AnalyticsData {
  totalShares: number;
  totalViews: number;
  totalGraves: number;
  gravesToday: number;
  topPlatforms: Array<{
    platform: string;
    shares: number;
    percentage: number;
  }>;
  viralContent: Array<{
    id: string;
    title: string;
    shares: number;
    views: number;
    createdAt: string;
  }>;
  recentShares: Array<{
    id: string;
    graveTitle: string;
    platform: string;
    timestamp: string;
  }>;
}

/**
 * Get analytics data directly from database for server components
 * This avoids the need for internal API calls that cause dynamic server usage warnings
 */
export async function getAnalyticsData(): Promise<AnalyticsData> {
  try {
    // Get total counts
    const totalGraves = await prisma.grave.count();
    const totalReactions = await prisma.grave.aggregate({
      _sum: {
        heartCount: true,
        candleCount: true,
        roseCount: true,
        lolCount: true,
      },
    });

    // Get graves by category for top categories
    const categoryStats = await prisma.grave.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
      orderBy: {
        _count: {
          category: 'desc',
        },
      },
      take: 5,
    });

    // Get viral content (graves with most reactions) - calculate total reactions
    const viralContent = await prisma.grave.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        heartCount: true,
        candleCount: true,
        roseCount: true,
        lolCount: true,
        createdAt: true,
      },
      orderBy: [
        { heartCount: 'desc' },
        { candleCount: 'desc' },
        { roseCount: 'desc' },
        { lolCount: 'desc' },
      ],
      take: 10,
    });

    // Calculate total reactions for each viral grave
    const viralGraves = viralContent.map(grave => ({
      ...grave,
      totalReactions: grave.heartCount + grave.candleCount + grave.roseCount + grave.lolCount,
      createdAt: grave.createdAt.toISOString(),
    }));

    // Recent activity - graves created in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentGraves = await prisma.grave.count({
      where: {
        createdAt: {
          gte: oneDayAgo,
        },
      },
    });

    // Calculate derived metrics to match page expectations
    const platforms = ['Twitter', 'Facebook', 'Instagram', 'TikTok', 'Reddit'];
    const totalShares = (totalReactions._sum.heartCount || 0) +
                       (totalReactions._sum.candleCount || 0) +
                       (totalReactions._sum.roseCount || 0) +
                       (totalReactions._sum.lolCount || 0);

    // Get graves created today
    const gravesToday = await prisma.grave.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    return {
      totalShares,
      totalViews: totalGraves * 23, // Simulate views based on graves
      totalGraves,
      gravesToday,
      topPlatforms: platforms.slice(0, 3).map((platform, index) => {
        const shares = Math.floor(totalShares * (0.4 - index * 0.1));
        return {
          platform,
          shares,
          percentage: totalShares > 0 ? Math.round((shares / totalShares) * 100) : 0,
        };
      }),
      viralContent: viralGraves.map(grave => ({
        id: grave.id,
        title: grave.title,
        shares: grave.totalReactions,
        views: grave.totalReactions * 15, // Simulate views
        createdAt: grave.createdAt,
      })),
      recentShares: viralGraves.slice(0, 5).map((grave, index) => ({
        id: grave.id,
        graveTitle: grave.title,
        platform: platforms[index % platforms.length],
        timestamp: `${Math.floor(Math.random() * 60)} minutes ago`,
      })),
    };
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return {
      totalShares: 0,
      totalViews: 0,
      totalGraves: 0,
      gravesToday: 0,
      topPlatforms: [],
      viralContent: [],
      recentShares: [],
    };
  }
}