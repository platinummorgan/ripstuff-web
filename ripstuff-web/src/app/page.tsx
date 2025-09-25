"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/Button";
import { PageHero } from "@/components/PageHero";
import { SectionHeader } from "@/components/SectionHeader";
import { GraveCard } from "@/components/GraveCard";
import type { FeedItem } from "@/lib/validation";

export default function HomePage() {
  const [featuredGraves, setFeaturedGraves] = useState<FeedItem[]>([]);
  const [recentGraves, setRecentGraves] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured graves
        const featuredResponse = await fetch("/api/feed?featured=true&limit=4");
        if (featuredResponse.ok) {
          const featuredData = await featuredResponse.json();
          setFeaturedGraves(featuredData.items || []);
        }

        // Fetch recent graves
        const recentResponse = await fetch("/api/feed?limit=6");
        if (recentResponse.ok) {
          const recentData = await recentResponse.json();
          setRecentGraves(recentData.items || []);
        }
      } catch (error) {
        console.error("Error fetching homepage data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-20 pb-16">
      <PageHero
        eyebrow="Virtual Graveyard"
        title="Bury your fallen stuff. Get an instant eulogy."
        description="When gadgets, garments, or gadgets meet their match, lay them to rest with a somber-but-sly farewell. Generate a eulogy, share the memorial card, and invite sympathies."
        primaryCta={{ href: "/bury", label: "Bury an Item" }}
        secondaryCta={{ href: "/feed", label: "Browse the Feed" }}
      />

      <section className="space-y-8">
        <SectionHeader eyebrow="Featured" title="Editor's picks" description="Hand-picked memorials that set the tone for the graveyard." />
        {loading ? (
          <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-6 text-center">
            <p className="text-sm text-[var(--muted)]">Loading featured graves...</p>
          </div>
        ) : featuredGraves.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredGraves.map((grave) => (
              <GraveCard key={grave.id} grave={grave} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-6 text-center">
            <p className="text-sm text-[var(--muted)]">No featured graves yet.</p>
            <p className="mt-2 text-xs text-[var(--muted)]">Check back later for hand-picked memorials.</p>
          </div>
        )}
      </section>

      <section className="space-y-8">
        <SectionHeader
          eyebrow="Newest"
          title="Fresh burials"
          description="See what the community has laid to rest in the last few hours."
        />
        {loading ? (
          <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-6 text-center">
            <p className="text-sm text-[var(--muted)]">Loading recent graves...</p>
          </div>
        ) : recentGraves.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentGraves.map((grave) => (
              <GraveCard key={grave.id} grave={grave} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-6 text-center">
            <p className="text-sm text-[var(--muted)]">No graves yet.</p>
            <p className="mt-2 text-xs text-[var(--muted)]">Be the first to create a memorial.</p>
          </div>
        )}
        <div className="flex justify-center">
          <Button asChild>
            <a href="/feed">View Full Feed</a>
          </Button>
        </div>
      </section>
    </div>
  );
}
