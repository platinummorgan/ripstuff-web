import { Button } from "@/components/Button";
import { PageHero } from "@/components/PageHero";
import { SectionHeader } from "@/components/SectionHeader";
import { GraveCard } from "@/components/GraveCard";
import type { FeedItem } from "@/lib/validation";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

async function fetchFeaturedGraves(): Promise<FeedItem[]> {
  try {
    const response = await fetch(`${baseUrl}/api/feed?featured=true&limit=4`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Error fetching featured graves:", error);
    return [];
  }
}

async function fetchRecentGraves(): Promise<FeedItem[]> {
  try {
    const response = await fetch(`${baseUrl}/api/feed?limit=6`, {
      next: { revalidate: 60 }, // Cache for 1 minute
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Error fetching recent graves:", error);
    return [];
  }
}

export default async function HomePage() {
  // Fetch data server-side in parallel
  const [featuredGraves, recentGraves] = await Promise.all([
    fetchFeaturedGraves(),
    fetchRecentGraves(),
  ]);

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
        {featuredGraves.length > 0 ? (
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
        {recentGraves.length > 0 ? (
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
