import { Suspense } from "react";
import type { Metadata } from "next";

import { PageHero } from "@/components/PageHero";
import { SectionHeader } from "@/components/SectionHeader";
import { TrendingFeedList } from "@/components/feed/TrendingFeedList";

export const metadata: Metadata = {
  title: "Trending Memorials - Virtual Graveyard",
  description: "Discover the most viral and popular memorials that are spreading across the internet. See what's trending now.",
  openGraph: {
    title: "🔥 Trending Memorials - Virtual Graveyard",
    description: "Discover the most viral and popular memorials that are spreading across the internet. See what's trending now.",
    siteName: "Virtual Graveyard",
    type: "website",
    url: "https://virtualgraveyard.com/trending",
  },
  twitter: {
    card: "summary_large_image",
    title: "🔥 Trending Memorials - Virtual Graveyard",
    description: "Discover the most viral and popular memorials that are spreading across the internet.",
  },
};

export default function TrendingPage() {
  return (
    <div className="space-y-12 pb-16">
      <PageHero
        eyebrow="Viral Content"
        title="🔥 Trending Memorials"
        description="The most shared, reacted to, and talked about memorials right now."
        primaryCta={{ href: "/bury", label: "Create Viral Content" }}
        secondaryCta={{ href: "/analytics", label: "View Analytics" }}
      />

      <section>
        <div className="mb-6 text-center">
          <p className="text-[var(--muted)] max-w-2xl mx-auto">
            These memorials are going viral across social media platforms. 
            Join the conversation or create your own memorable content.
          </p>
        </div>
        
        <Suspense fallback={
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="rounded-3xl bg-[rgba(255,255,255,0.05)] p-6 h-48"></div>
              </div>
            ))}
          </div>
        }>
          <TrendingFeedList />
        </Suspense>
      </section>

      {/* Viral Growth Tips */}
      <section className="rounded-3xl border border-[rgba(255,255,255,0.05)] bg-[rgba(10,14,25,0.82)] p-6 sm:p-10">
        <SectionHeader 
          title="How to Go Viral" 
          description="Tips for creating content that spreads like wildfire" 
        />
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">😂</div>
              <div>
                <h4 className="font-semibold text-white">Be Relatable & Funny</h4>
                <p className="text-sm text-[var(--muted)] mt-1">
                  The most shared memorials are ones people connect with. Make it personal but universally funny.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="text-2xl">📸</div>
              <div>
                <h4 className="font-semibold text-white">Add Great Photos</h4>
                <p className="text-sm text-[var(--muted)] mt-1">
                  Visual content gets shared 40x more. Add photos that tell the story of your item's demise.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">⏰</div>
              <div>
                <h4 className="font-semibold text-white">Time It Right</h4>
                <p className="text-sm text-[var(--muted)] mt-1">
                  Post when people are online. Peak times are evenings and weekends when people scroll social media.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="text-2xl">💬</div>
              <div>
                <h4 className="font-semibold text-white">Encourage Sharing</h4>
                <p className="text-sm text-[var(--muted)] mt-1">
                  Ask questions, share relatable struggles. Content that sparks conversation gets shared more.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}