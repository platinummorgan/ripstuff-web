import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { SectionHeader } from "@/components/SectionHeader";

export const metadata: Metadata = {
  title: "Analytics Dashboard - Virtual Graveyard",
  description: "Track sharing metrics and viral content performance.",
};

// Mock data for demonstration
const mockAnalytics = {
  totalShares: 1247,
  totalViews: 8493,
  topPlatforms: [
    { platform: "Twitter", shares: 623, percentage: 50 },
    { platform: "Facebook", shares: 374, percentage: 30 },
    { platform: "Reddit", shares: 250, percentage: 20 },
  ],
  recentShares: [
    { id: "1", graveTitle: "My Broken iPhone 📱", platform: "Twitter", timestamp: "2 hours ago" },
    { id: "2", graveTitle: "RIP Toyota Camry 🚗", platform: "Facebook", timestamp: "4 hours ago" },
    { id: "3", graveTitle: "Farewell, Coffee Maker ☕", platform: "Reddit", timestamp: "6 hours ago" },
    { id: "4", graveTitle: "Dead Laptop Battery 🔋", platform: "Twitter", timestamp: "8 hours ago" },
  ],
  viralContent: [
    { id: "viral-1", title: "My Wedding Ring (Lost in Divorce)", shares: 342, views: 2156, category: "relationship" },
    { id: "viral-2", title: "Expired Milk That Became Cheese", shares: 287, views: 1893, category: "food" },
    { id: "viral-3", title: "My Will to Live (Age 25)", shares: 203, views: 1654, category: "abstract" },
  ],
};

export default function AnalyticsPage() {
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
          <div className="text-2xl font-bold text-white">{mockAnalytics.totalShares.toLocaleString()}</div>
          <div className="text-sm text-[var(--muted)]">Total Shares</div>
        </div>
        <div className="rounded-2xl border border-[rgba(255,255,255,0.05)] bg-[rgba(10,14,25,0.82)] p-6">
          <div className="text-2xl font-bold text-white">{mockAnalytics.totalViews.toLocaleString()}</div>
          <div className="text-sm text-[var(--muted)]">Total Views</div>
        </div>
        <div className="rounded-2xl border border-[rgba(255,255,255,0.05)] bg-[rgba(10,14,25,0.82)] p-6">
          <div className="text-2xl font-bold text-white">{Math.round(mockAnalytics.totalViews / mockAnalytics.totalShares * 100) / 100}</div>
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
          {mockAnalytics.topPlatforms.map((platform) => (
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
          {mockAnalytics.viralContent.map((content, index) => (
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
          {mockAnalytics.recentShares.map((share) => (
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