"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { SocialShare } from "@/components/SocialShare";
import { MemorialBadges, calculateBadges } from "@/components/MemorialBadges";
import type { FeedItem } from "@/lib/validation";

// Use window.location.origin for client-side URL construction to avoid env issues
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://ripstuff.net";
};
const baseUrl = getBaseUrl();

export interface GraveCardProps {
  grave: FeedItem;
}

export function GraveCard({ grave }: GraveCardProps) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageErrored, setImageErrored] = useState(false);

  useEffect(() => {
    setImageErrored(false);
  }, [grave.photoUrl, grave.slug]);

  useEffect(() => {
    const node = imageRef.current;
    if (!node) return;

    const handleError = (event: Event) => {
      console.error('Image failed to load:', grave.photoUrl, event);
      setImageErrored(true);
    };

    node.addEventListener('error', handleError);

    return () => {
      node.removeEventListener('error', handleError);
    };
  }, [grave.photoUrl, grave.slug]);

  // Calculate mock badges for demo - in production, this data would come from analytics
  const totalReactions = Object.values(grave.reactions).reduce((sum, count) => sum + count, 0);
  const mockViews = totalReactions * 15; // Estimate views from reactions
  const mockShares = Math.floor(totalReactions / 3); // Estimate shares
  
  const badges = calculateBadges({
    views: mockViews,
    shares: mockShares,
    sympathies: totalReactions,
    reactions: totalReactions,
    createdAt: grave.createdAt,
    isTrending: grave.featured, // Use featured as trending proxy
    isTopPerformer: totalReactions > 50, // High engagement as top performer
  });

  return (
    <div className="group rounded-3xl frosted border border-[var(--border)] p-5 transition hover:-translate-y-1 hover:border-[var(--accent)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
            {grave.category.replace(/_/g, " ")}
          </p>
          <Link href={`/grave/${grave.slug}`}>
            <h3 className="mt-2 text-lg font-semibold text-white hover:text-[var(--accent)] transition-colors break-words overflow-hidden">
              {grave.title}
            </h3>
          </Link>
          {badges.length > 0 && (
            <MemorialBadges badges={badges} size="sm" className="mt-2" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[rgba(255,255,255,0.08)] px-3 py-1 text-xs text-[var(--muted)]">
            {new Date(grave.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
          <SocialShare
            url={`${baseUrl}/grave/${grave.slug}`}
            title={`Check out this memorial for ${grave.title} 💔`}
            description={grave.eulogyPreview}
            hashtags={["RIP", "VirtualGraveyard", grave.category]}
            className="opacity-60 hover:opacity-100 transition-opacity"
          />
        </div>
      </div>
      <Link href={`/grave/${grave.slug}`} className="block">
        {grave.photoUrl && !imageErrored && (
          <div className="mt-4 overflow-hidden rounded-2xl">
            <div className="relative h-40 w-full">
              <Image
                ref={imageRef}
                src={grave.photoUrl}
                alt={grave.title}
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover transition duration-500 group-hover:scale-105"
                unoptimized={grave.photoUrl.includes('.blob.vercel-storage.com')}
              />
            </div>
          </div>
        )}
        <p className="mt-4 text-sm leading-6 text-[var(--muted)] break-words overflow-hidden">{grave.eulogyPreview}</p>
      </Link>
      
      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
          <ReactionBadge emoji="❤️" count={grave.reactions.heart} />
          <ReactionBadge emoji="🕯️" count={grave.reactions.candle} />
          <ReactionBadge emoji="🌹" count={grave.reactions.rose} />
          <ReactionBadge emoji="😂" count={grave.reactions.lol} />
        </div>
      </div>
    </div>
  );
}

function ReactionBadge({ emoji, count }: { emoji: string; count: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(255,255,255,0.05)] px-3 py-1">
      <span>{emoji}</span>
      <span>{count}</span>
    </span>
  );
}
