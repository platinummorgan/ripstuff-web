import { GraveCard } from "@/components/GraveCard";
import type { FeedItem } from "@/lib/validation";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

async function fetchTrendingGraves(): Promise<FeedItem[]> {
  try {
    // Fetch all graves and sort by engagement for true trending
    const response = await fetch(`${baseUrl}/api/feed?limit=20`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });
    if (!response.ok) return [];
    
    const data = await response.json();
    
    // Sort by total reactions to find truly trending content
    const sortedByEngagement = data.items.sort((a: FeedItem, b: FeedItem) => {
      const aTotal = Object.values(a.reactions).reduce((sum, count) => sum + count, 0);
      const bTotal = Object.values(b.reactions).reduce((sum, count) => sum + count, 0);
      return bTotal - aTotal;
    });
    
    // Only show items that have at least 1 reaction to be considered "trending"
    const actuallyTrending = sortedByEngagement.filter((item: FeedItem) => {
      const totalReactions = Object.values(item.reactions).reduce((sum: number, count: number) => sum + count, 0);
      return totalReactions > 0;
    });
    
    // Return top 6 trending items
    return actuallyTrending.slice(0, 6);
  } catch (error) {
    console.error('Error fetching trending graves:', error);
    return [];
  }
}

export async function TrendingFeedList() {
  const trendingGraves = await fetchTrendingGraves();

  if (!trendingGraves.length) {
    return (
      <div className="text-center p-8 rounded-3xl border border-[rgba(255,255,255,0.05)] bg-[rgba(10,14,25,0.82)]">
        <p className="text-[var(--muted)]">No trending content yet.</p>
        <p className="text-sm text-[var(--muted)] mt-2">Be the first to create something viral!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Trending Content Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {trendingGraves.map((grave, index) => (
          <div key={grave.id} className="relative">
            {/* Trending Rank */}
            <div className="absolute -top-2 -left-2 z-10 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
              #{index + 1}
            </div>
            <GraveCard grave={grave} />
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="mt-8 text-center p-6 rounded-2xl border border-[rgba(255,255,255,0.05)] bg-[rgba(10,14,25,0.82)]">
        <h4 className="font-semibold text-white mb-2">Want to trend?</h4>
        <p className="text-sm text-[var(--muted)] mb-4">
          Create engaging content that people want to share and react to.
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          <a 
            href="/bury" 
            className="bg-[var(--accent)] text-black px-4 py-2 rounded-lg font-medium hover:bg-[var(--accent)]/90 transition-colors text-sm"
          >
            Create Memorial
          </a>
          <a 
            href="/analytics" 
            className="border border-[rgba(255,255,255,0.1)] text-white px-4 py-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors text-sm"
          >
            View Analytics
          </a>
        </div>
      </div>
    </div>
  );
}