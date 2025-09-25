"use client";

import { useState, useEffect } from "react";
import { GraveCard } from "@/components/GraveCard";
import type { FeedItem } from "@/lib/validation";

interface TrendingFeedListProps {
  timeframe?: '24h' | '7d' | '30d';
}

export function TrendingFeedList({ timeframe = '24h' }: TrendingFeedListProps) {
  const [trendingGraves, setTrendingGraves] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);

  useEffect(() => {
    const fetchTrendingGraves = async () => {
      try {
        // For now, fetch regular graves and sort by reactions to simulate trending
        const response = await fetch(`/api/graves?limit=6&featured=true`);
        if (!response.ok) throw new Error('Failed to fetch');
        
        const data = await response.json();
        
        // Sort by total reactions to simulate "trending"
        const sortedByEngagement = data.items.sort((a: FeedItem, b: FeedItem) => {
          const aTotal = Object.values(a.reactions).reduce((sum, count) => sum + count, 0);
          const bTotal = Object.values(b.reactions).reduce((sum, count) => sum + count, 0);
          return bTotal - aTotal;
        });
        
        setTrendingGraves(sortedByEngagement.slice(0, 6));
      } catch (error) {
        console.error('Failed to fetch trending graves:', error);
        setTrendingGraves([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingGraves();
  }, [selectedTimeframe]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="rounded-3xl bg-[rgba(255,255,255,0.05)] p-6 h-48"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!trendingGraves.length) {
    return (
      <div className="text-center p-8 rounded-3xl border border-[rgba(255,255,255,0.05)] bg-[rgba(10,14,25,0.82)]">
        <p className="text-[var(--muted)]">No trending content found for this timeframe.</p>
        <p className="text-sm text-[var(--muted)] mt-2">Be the first to create something viral!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Timeframe Selector */}
      <div className="flex gap-2 mb-6">
        {[
          { key: '24h', label: 'Last 24 Hours' },
          { key: '7d', label: 'This Week' },
          { key: '30d', label: 'This Month' },
        ].map((option) => (
          <button
            key={option.key}
            onClick={() => setSelectedTimeframe(option.key as '24h' | '7d' | '30d')}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              selectedTimeframe === option.key
                ? 'bg-[var(--accent)] text-black font-medium'
                : 'bg-[rgba(255,255,255,0.05)] text-[var(--muted)] hover:bg-[rgba(255,255,255,0.08)] hover:text-white'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

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