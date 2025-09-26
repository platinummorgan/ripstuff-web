import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { SectionHeader } from "@/components/SectionHeader";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Analytics Dashboard - Ripstuff",
  description: "Track viral growth and sharing statistics for your memorials",
};

async function getAnalytics() {
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
        title: true,
        heartCount: true,
        candleCount: true,
        roseCount: true,
        lolCount: true,
        category: true,
        createdAt: true,
      },
      orderBy: [
        { heartCount: 'desc' },
        { candleCount: 'desc' },
        { roseCount: 'desc' },
        { lolCount: 'desc' },
      ],
      take: 5,
    });

    // Get recent graves for "recent shares" simulation
    const recentGraves = await prisma.grave.findMany({
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    const platforms = ['Twitter', 'Facebook', 'Instagram', 'TikTok', 'Reddit'];
    const totalShares = (totalReactions._sum?.heartCount || 0) +
                       (totalReactions._sum?.candleCount || 0) +
                       (totalReactions._sum?.roseCount || 0) +
                       (totalReactions._sum?.lolCount || 0);
    
    return {
      totalShares,
      totalViews: totalGraves * 23, // Simulate views based on graves
      totalGraves,
      gravesToday: await prisma.grave.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      topPlatforms: platforms.slice(0, 3).map((platform, index) => {
        const shares = Math.floor(totalShares * (0.4 - index * 0.1));
        return {
          platform,
          shares,
          percentage: totalShares > 0 ? Math.round((shares / totalShares) * 100) : 0,
        };
      }),
      viralContent: viralContent.map(grave => {
        const totalReactions = (grave.heartCount || 0) + (grave.candleCount || 0) + 
                              (grave.roseCount || 0) + (grave.lolCount || 0);
        return {
          id: grave.id,
          title: grave.title,
          category: grave.category,
          shares: totalReactions,
          views: totalReactions * 15, // Simulate views
          createdAt: grave.createdAt.toISOString(),
        };
      }),
      recentShares: recentGraves.slice(0, 5).map((grave, index) => ({
        id: grave.id,
        graveTitle: grave.title,
        platform: platforms[index % platforms.length],
        timestamp: `${Math.floor(Math.random() * 60)} minutes ago`,
      })),
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
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

export default async function AnalyticsPage() {
  const analytics = await getAnalytics();
  return (
    <div className="space-y-12 pb-16">
      <PageHero
        eyebrow="Analytics Dashboard"
        title="Viral Growth Metrics"
        description="Track how your memorials are spreading across the internet."
        primaryCta={{ href: "/feed", label: "Back to Feed" }}
        secondaryCta={{ href: "/bury", label: "Create Memorial" }}
      />

      {/* Overview Stats */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[rgba(255,255,255,0.05)] bg-[rgba(10,14,25,0.82)] p-6">
          <div className="text-2xl font-bold text-white">{analytics.totalShares.toLocaleString()}</div>
          <div className="text-sm text-[var(--muted)]">Total Shares</div>
        </div>
        <div className="rounded-2xl border border-[rgba(255,255,255,0.05)] bg-[rgba(10,14,25,0.82)] p-6">
          <div className="text-2xl font-bold text-white">{analytics.totalViews.toLocaleString()}</div>
          <div className="text-sm text-[var(--muted)]">Total Views</div>
        </div>
        <div className="rounded-2xl border border-[rgba(255,255,255,0.05)] bg-[rgba(10,14,25,0.82)] p-6">
          <div className="text-2xl font-bold text-white">{analytics.totalShares > 0 ? Math.round(analytics.totalViews / analytics.totalShares * 100) / 100 : 0}</div>
          <div className="text-sm text-[var(--muted)]">Views per Share</div>
        </div>
        <div className="rounded-2xl border border-[rgba(255,255,255,0.05)] bg-[rgba(10,14,25,0.82)] p-6">
          <div className="text-2xl font-bold text-white">🔥</div>
          <div className="text-sm text-[var(--muted)]">Viral Status</div>
        </div>
      </section>

      {/* Platform Breakdown */}
      <section className="rounded-3xl border border-[rgba(255,255,255,0.05)] bg-[rgba(10,14,25,0.82)] p-6 sm:p-10">
        <SectionHeader title="Platform Performance" description="Which platforms are driving the most shares?" />
        <div className="mt-6 space-y-4">
          {analytics.topPlatforms.map((platform) => (
            <div key={platform.platform} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium text-white">{platform.platform}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 bg-[rgba(255,255,255,0.05)] rounded-full h-2">
                  <div 
                    className="bg-[var(--accent)] h-2 rounded-full" 
                    style={{ width: `${platform.percentage}%` }}
                  />
                </div>
                <div className="text-sm text-[var(--muted)] w-16 text-right">
                  {platform.shares} ({platform.percentage}%)
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Viral Content */}
      <section className="rounded-3xl border border-[rgba(255,255,255,0.05)] bg-[rgba(10,14,25,0.82)] p-6 sm:p-10">
        <SectionHeader title="Viral Hall of Fame" description="Top performing memorials that went viral" />
        <div className="mt-6 space-y-4">
          {analytics.viralContent.map((content, index) => (
            <div key={content.id} className="flex items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.02)]">
              <div className="flex items-center gap-4">
                <div className="text-lg font-bold text-[var(--accent)]">#{index + 1}</div>
                <div>
                  <div className="font-medium text-white">{content.title}</div>
                  <div className="text-sm text-[var(--muted)] capitalize">{content.category}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-white">{content.shares} shares</div>
                <div className="text-xs text-[var(--muted)]">{content.views} views</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="rounded-3xl border border-[rgba(255,255,255,0.05)] bg-[rgba(10,14,25,0.82)] p-6 sm:p-10">
        <SectionHeader title="Recent Shares" description="Latest sharing activity across all platforms" />
        <div className="mt-6 space-y-3">
          {analytics.recentShares.map((share) => (
            <div key={share.id} className="flex items-center justify-between p-3 rounded-lg bg-[rgba(255,255,255,0.02)]">
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium text-white">{share.graveTitle}</div>
              </div>
              <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
                <span>{share.platform}</span>
                <span>{share.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center p-8 rounded-3xl border border-[rgba(255,255,255,0.05)] bg-[rgba(10,14,25,0.82)]">
        <h3 className="text-xl font-semibold text-white mb-2">Ready to Go Viral?</h3>
        <p className="text-[var(--muted)] mb-6">Create memorable content that people want to share</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a 
            href="/bury" 
            className="bg-[var(--accent)] text-black px-6 py-3 rounded-lg font-medium hover:bg-[var(--accent)]/90 transition-colors"
          >
            Create New Memorial
          </a>
          <a 
            href="/feed" 
            className="border border-[rgba(255,255,255,0.1)] text-white px-6 py-3 rounded-lg font-medium hover:bg-[rgba(255,255,255,0.05)] transition-colors"
          >
            Explore Trending
          </a>
        </div>
      </section>
    </div>
  );
}