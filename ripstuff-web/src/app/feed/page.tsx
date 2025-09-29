import { Suspense } from "react";
import type { Metadata } from "next";

import { PageHero } from "@/components/PageHero";
import { SectionHeader } from "@/components/SectionHeader";
import { FeedList } from "@/components/feed/FeedList";
import { FeaturedFeedList } from "@/components/feed/FeaturedFeedList";
import { TrendingFeedList } from "@/components/feed/TrendingFeedList";
import { SearchableFeedList } from "@/components/feed/SearchableFeedList";
import type { FeedItem } from "@/lib/validation";

// Fetch initial feed data server-side
async function fetchInitialFeed(): Promise<FeedItem[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/feed?limit=12`, {
      cache: 'no-store' // Always get fresh data
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch feed');
    }
    
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Failed to fetch initial feed:', error);
    return [];
  }
}

export const metadata: Metadata = {
  title: "Community Feed - Virtual Graveyard",
  description: "Explore the latest burials and featured memorials in our virtual graveyard. Share memories, honor the departed, and join a community of mourners.",
  openGraph: {
    title: "Community Feed - Virtual Graveyard",
    description: "Explore the latest burials and featured memorials in our virtual graveyard. Share memories, honor the departed, and join a community of mourners.",
    siteName: "Virtual Graveyard",
    type: "website",
    url: "https://virtualgraveyard.com/feed",
  },
  twitter: {
    card: "summary_large_image",
    title: "Community Feed - Virtual Graveyard",
    description: "Explore the latest burials and featured memorials in our virtual graveyard. Share memories, honor the departed, and join a community of mourners.",
  },
};

export default async function FeedPage() {
  const initialFeedItems = await fetchInitialFeed();
  
  return (
    <div className="space-y-12 pb-16">
      <PageHero
        eyebrow="Community Feed"
        title="Browse the virtual graveyard"
        description="Search, filter, and explore memorials from the RipStuff community."
        primaryCta={{ href: "/bury", label: "Bury an Item" }}
        secondaryCta={{ href: "/", label: "Back to Home" }}
      />
      
      <div className="space-y-12">
        <section>
          <SectionHeader 
            title="🔥 Trending Memorials" 
            description="Most viral content that's spreading across the internet" 
          />
          <div className="mt-6">
            <Suspense fallback={<div className="text-sm text-[var(--muted)]">Loading trending graves…</div>}>
              <TrendingFeedList />
            </Suspense>
          </div>
        </section>
        
        <section>
          <SectionHeader title="Featured Stories" description="Special graves curated by our graveyard keepers" />
          <div className="mt-6">
            <Suspense fallback={<div className="text-sm text-[var(--muted)]">Loading featured graves…</div>}>
              <FeaturedFeedList />
            </Suspense>
          </div>
        </section>
        
        <section>
          <SectionHeader 
            title="Explore All Memorials" 
            description="Search and filter through the entire virtual graveyard" 
          />
          <div className="mt-6">
            <SearchableFeedList initialItems={initialFeedItems} />
          </div>
        </section>
      </div>
    </div>
  );
}
