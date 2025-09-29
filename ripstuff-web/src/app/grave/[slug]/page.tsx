import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SafeImage } from "@/components/SafeImage";

import { Button } from "@/components/Button";
import { ReactionsBar } from "@/components/ReactionsBar";
import { ReportButton } from "@/components/ReportButton";
import { SectionHeader } from "@/components/SectionHeader";
import { SocialShare } from "@/components/SocialShare";
import { SympathySection } from "@/components/SympathySection";
import { MemorialBadges, calculateBadges } from "@/components/MemorialBadges";
import { DeathCertificate } from "@/components/DeathCertificate";
import { MemorialShareCard } from "@/components/MemorialShareCard";
import { TikTokBurialTemplate } from "@/components/TikTokBurialTemplate";
import { InstagramStoryTemplate } from "@/components/InstagramStoryTemplate";
import { GraveViewTracker } from "@/components/GraveViewTracker";
import { RoastEulogyVoting } from "@/components/RoastEulogyVoting";
import { VotingProvider } from "@/components/VotingContext";
import type { GraveDetailResponse } from "@/lib/validation";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

async function fetchGrave(slug: string): Promise<GraveDetailResponse> {
  const res = await fetch(`${baseUrl}/api/graves/${slug}`, {
    next: { revalidate: 30 },
  });

  if (res.status === 404) {
    notFound();
  }

  if (!res.ok) {
    throw new Error("Failed to fetch grave");
  }

  return (await res.json()) as GraveDetailResponse;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const grave = await fetchGrave(params.slug);
    const title = `In Memory of ${grave.title}`;
    const description = grave.eulogyText 
      ? grave.eulogyText.substring(0, 160) + "..."
      : `A memorial for ${grave.title} on Virtual Graveyard. Honor their memory and share your condolences.`;
    
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        siteName: "Virtual Graveyard",
        type: "article",
        url: `${baseUrl}/grave/${params.slug}`,
        images: grave.photoUrl ? [{
          url: grave.photoUrl,
          width: 400,
          height: 600,
          alt: `Memorial photo for ${grave.title}`,
        }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: grave.photoUrl ? [grave.photoUrl] : undefined,
      },
    };
  } catch {
    return {
      title: "Memorial - Virtual Graveyard",
      description: "A place to remember and honor those we've lost.",
    };
  }
}

export default async function GravePage({ params }: { params: { slug: string } }) {
  const grave = await fetchGrave(params.slug);

  // Calculate badges for this memorial
  const totalReactions = Object.values(grave.reactions).reduce((sum, count) => sum + count, 0);
  const totalSympathies = grave.sympathies.length;
  const mockViews = (totalReactions + totalSympathies) * 20; // Estimate views
  const mockShares = Math.floor(totalReactions / 2); // Estimate shares
  
  const badges = calculateBadges({
    views: mockViews,
    shares: mockShares,
    sympathies: totalSympathies,
    reactions: totalReactions,
    createdAt: grave.createdAt,
    isTrending: totalReactions > 20, // High recent engagement
    isTopPerformer: totalReactions > 50 || totalSympathies > 10,
  });

  return (
    <div className="space-y-12 pb-16">
      {/* Track grave view for analytics */}
      <GraveViewTracker 
        graveId={grave.id} 
        graveTitle={grave.title}
        graveCategory={grave.category}
      />
      
      <header className="grid gap-6 rounded-3xl border border-[rgba(255,255,255,0.05)] bg-[rgba(10,14,25,0.82)] p-6 sm:grid-cols-[2fr,1fr] sm:p-10">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
            {grave.category.replace(/_/g, " ")}
          </p>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">{grave.title}</h1>
          {grave.datesText && <p className="text-sm text-[var(--muted)]">{grave.datesText}</p>}
          {badges.length > 0 && (
            <MemorialBadges badges={badges} size="md" />
          )}
          {grave.backstory && (
            <p className="text-sm text-[var(--muted)] leading-6">{grave.backstory}</p>
          )}

          <ReactionsBar graveId={grave.id} initialCounts={grave.reactions} />

          <div className="flex flex-wrap gap-3 pt-4">
            <SocialShare
              url={`${baseUrl}/grave/${grave.slug}`}
              title={`Mourn with me for ${grave.title} 💔`}
              description={grave.eulogyText.slice(0, 160)}
              hashtags={["RIP", "VirtualGraveyard", grave.category]}
              className="bg-[var(--accent)] text-black px-4 py-2 rounded-lg font-medium hover:bg-[var(--accent)]/90 transition-colors"
            />
            <Button variant="ghost" asChild>
              <a href="/bury">Bury another</a>
            </Button>
            <ReportButton graveSlug={grave.slug} />
          </div>
        </div>
        {grave.photoUrl ? (
          <div className="relative h-full w-full">
            <SafeImage
              src={grave.photoUrl}
              alt={grave.title}
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="rounded-2xl object-cover"
              unoptimized={grave.photoUrl.includes('.blob.vercel-storage.com')}
              fallback={
                <div className="fallback-tombstone flex h-full w-full items-center justify-center rounded-2xl bg-[rgba(255,255,255,0.03)] text-4xl">
                  🪦
                </div>
              }
            />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-2xl bg-[rgba(255,255,255,0.03)] text-4xl">
            🪦
          </div>
        )}
      </header>

      <section className="rounded-3xl border border-[rgba(255,255,255,0.05)] bg-[rgba(10,14,25,0.82)] p-6 sm:p-10">
        <SectionHeader title="Epitaph" description="Memorial words honoring a departed item." />
        <article className="mt-6 space-y-4 whitespace-pre-line text-base leading-7 text-[var(--foreground)]">
          {grave.eulogyText}
        </article>
        <div className="mt-4 text-sm text-gray-400 italic flex items-center gap-2">
          <span>Epitaph by</span>
          {grave.creatorInfo ? (
            <div className="flex items-center gap-2">
              {grave.creatorInfo.picture && (
                <img 
                  src={grave.creatorInfo.picture} 
                  alt={grave.creatorInfo.name || 'Creator'} 
                  className="w-5 h-5 rounded-full"
                />
              )}
              <span className="text-[var(--accent)] font-medium">
                {grave.creatorInfo.name || 'Anonymous Mourner'}
              </span>
            </div>
          ) : (
            <span>Anonymous Mourner</span>
          )}
        </div>
        
      </section>

      <VotingProvider 
        initialRoastCount={grave.roastCount || 0}
        initialEulogyCount={grave.eulogyCount || 0}
      >
        <section className="rounded-3xl border border-[rgba(255,255,255,0.05)] bg-[rgba(10,14,25,0.82)] p-6 sm:p-10">
          {/* Community Response Voting */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-white mb-1">Community Response</h3>
            <p className="text-sm text-gray-400">How does this epitaph make you feel?</p>
          </div>
          <RoastEulogyVoting graveId={grave.id} graveSlug={grave.slug} />
        </section>

        <section className="space-y-6 rounded-3xl border border-[rgba(255,255,255,0.05)] bg-[rgba(10,14,25,0.82)] p-6 sm:p-10">
          <SectionHeader title="Death Certificate" description="Official documentation of this memorial's legacy and controversy rating." />
          <DeathCertificate 
            grave={{
              title: grave.title,
              category: grave.category,
              eulogyText: grave.eulogyText,
              createdAt: grave.createdAt,
              roastCount: grave.roastCount || 0,
              eulogyCount: grave.eulogyCount || 0,
              candleCount: grave.reactions.candle || 0,
              datesText: grave.datesText || undefined,
            }}
            graveUrl={`${baseUrl}/grave/${grave.slug}`}
          />
        </section>
      </VotingProvider>

      <section className="space-y-6 rounded-3xl border border-[rgba(255,255,255,0.05)] bg-[rgba(10,14,25,0.82)] p-6 sm:p-10">
        <SectionHeader title="Memorial Cards" description="Share beautiful memorial cards on social media." />
        <MemorialShareCard 
          grave={{
            id: grave.id,
            title: grave.title,
            category: grave.category,
            eulogyText: grave.eulogyText,
            createdAt: grave.createdAt,
            photoUrl: grave.photoUrl,
            reactions: grave.reactions,
          }}
          graveUrl={`${baseUrl}/grave/${grave.slug}`}
        />
      </section>

      <section className="space-y-6 rounded-3xl border border-[rgba(255,255,255,0.05)] bg-[rgba(10,14,25,0.82)] p-6 sm:p-10">
        <SectionHeader title="TikTok Burial Ceremonies" description="Create viral TikTok videos with these burial ceremony templates." />
        <TikTokBurialTemplate 
          grave={{
            title: grave.title,
            category: grave.category,
            eulogyText: grave.eulogyText,
            createdAt: grave.createdAt,
          }}
          graveUrl={`${baseUrl}/grave/${grave.slug}`}
        />
      </section>

      <section className="space-y-6 rounded-3xl border border-[rgba(255,255,255,0.05)] bg-[rgba(10,14,25,0.82)] p-6 sm:p-10">
        <SectionHeader title="Instagram Stories" description="Create engaging Instagram Stories that drive traffic to your memorial." />
        <InstagramStoryTemplate 
          grave={{
            id: grave.id,
            title: grave.title,
            category: grave.category,
            eulogyText: grave.eulogyText,
            createdAt: grave.createdAt,
            photoUrl: grave.photoUrl,
            reactions: grave.reactions,
          }}
          graveUrl={`${baseUrl}/grave/${grave.slug}`}
        />
      </section>

      <section className="space-y-6 rounded-3xl border border-[rgba(255,255,255,0.05)] bg-[rgba(10,14,25,0.82)] p-6 sm:p-10">
        <SectionHeader title="Sympathies" description="Leave a kind note for fellow mourners." />
        <SympathySection graveId={grave.id} initialSympathies={grave.sympathies} />
      </section>
    </div>
  );
}
