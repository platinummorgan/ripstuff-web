import { Suspense } from "react";
import type { Metadata } from "next";

import { PageHero } from "@/components/PageHero";
import { SectionHeader } from "@/components/SectionHeader";
import { FeedList } from "@/components/feed/FeedList";
import { FeaturedFeedList } from "@/components/feed/FeaturedFeedList";
import { TrendingFeedList } from "@/components/feed/TrendingFeedList";

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

export default function FeedPage() {
  return (
    <div className="space-y-12 pb-16">
      <PageHero
        eyebrow="Community Feed"
        title="Browse the virtual graveyard"
        description="Newest burials and featured highlights curated by the RipStuff team."
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
          <SectionHeader title="Recent Burials" description="Latest additions to the virtual graveyard" />
          <div className="mt-6">
            <Suspense fallback={<div className="text-sm text-[var(--muted)]">Loading graves…</div>}>
              <FeedList />
            </Suspense>
          </div>
        </section>
      </div>
    </div>
  );
}
