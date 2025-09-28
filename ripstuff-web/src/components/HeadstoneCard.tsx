"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { FeedItem } from "@/lib/validation";

function isVideoUrl(url?: string | null) {
  if (!url) return false;
  return /\.(mp4|webm|mov)(\?|#|$)/i.test(url);
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(diff / (1000 * 60));
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

function getCauseIcon(title: string, eulogy: string): string {
  const text = `${title} ${eulogy}`.toLowerCase();
  
  // Gaming consoles and devices
  if (/(playstation|xbox|nintendo|ps[0-9]|switch|gaming|console)/i.test(text)) return '🎮';
  // Audio equipment
  if (/(speaker|headphone|audio|sound|music|amp)/i.test(text)) return '🎵';
  // Water damage
  if (/(water|wet|flood|rain|spill|liquid)/i.test(text)) return '💧';
  // Fire/overheating
  if (/(fire|burn|heat|overheat|hot|flame)/i.test(text)) return '🔥';
  // Electrical
  if (/(electric|shock|power|volt|wire|short)/i.test(text)) return '⚡';
  // Battery
  if (/(battery|charge|power|dead)/i.test(text)) return '🔋';
  
  return '💀'; // Default death icon
}

export function HeadstoneCard({ grave }: { grave: FeedItem }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const video = isVideoUrl(grave.photoUrl);

  function togglePlay(e: React.MouseEvent) {
    if (!videoRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current.paused) {
      void videoRef.current.play().catch(() => {});
      setPlaying(true);
    } else {
      videoRef.current.pause();
      setPlaying(false);
    }
  }

  return (
    <div 
      className="group relative"
      onMouseEnter={() => setShowPreview(true)}
      onMouseLeave={() => setShowPreview(false)}
    >
      <Link href={`/grave/${grave.slug}`} className="block transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-xl">
        <div className="relative mx-auto w-[120px] sm:w-[140px]">
          {/* Stone shadow glow - enhanced on hover */}
          <div className="absolute inset-0 rounded-t-[26px] bg-[rgba(255,255,255,0.06)] blur-[2px] transition-all duration-300 group-hover:bg-[rgba(154,230,180,0.15)] group-hover:blur-[4px] group-hover:scale-110" />
          {/* Stone body */}
          <div className="relative rounded-t-[26px] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(200,203,210,0.35),rgba(120,130,150,0.35))] p-2 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] transition-all duration-300 group-hover:border-[rgba(154,230,180,0.4)] group-hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_4px_12px_rgba(0,0,0,0.3)]">
            {/* Cap ridge */}
            <div className="mx-auto h-[6px] w-[70%] rounded-t-full bg-white/10" />
            {/* Face window for media */}
            <div className="mt-2 h-[72px] w-full overflow-hidden rounded-[10px] bg-black/25">
              {grave.photoUrl && !video && (
                <Image
                  src={grave.photoUrl}
                  alt={grave.title}
                  width={220}
                  height={140}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  onError={(e) => {
                    console.error('Headstone image failed to load:', grave.photoUrl, e);
                    // Hide the image and show a fallback
                    const img = e.currentTarget;
                    img.style.display = 'none';
                    const container = img.parentElement;
                    if (container && !container.querySelector('.headstone-fallback')) {
                      const fallback = document.createElement('div');
                      fallback.className = 'headstone-fallback flex h-full w-full items-center justify-center text-2xl';
                      fallback.textContent = '🪦';
                      container.appendChild(fallback);
                    }
                  }}
                  unoptimized={grave.photoUrl.includes('.blob.vercel-storage.com')}
                />
              )}
              {grave.photoUrl && video && (
                <div className="relative h-full w-full">
                  <video
                    ref={videoRef}
                    src={grave.photoUrl}
                    className="h-full w-full object-cover"
                    playsInline
                    muted
                    preload="metadata"
                  />
                  <button
                    onClick={togglePlay}
                    className="absolute inset-0 grid place-items-center bg-black/20 opacity-0 transition group-hover:opacity-100"
                    aria-label={playing ? "Pause preview" : "Play preview"}
                  >
                    <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-black">
                      {playing ? "Pause" : "Play"}
                    </span>
                  </button>
                </div>
              )}
            </div>
            {/* Etched title */}
            <h3 className="mt-2 line-clamp-1 text-center text-[11px] font-semibold tracking-wide text-black/70 mix-blend-luminosity">
              {grave.title}
            </h3>
          </div>
          {/* Pedestal and mound */}
          <div className="mx-auto h-2 w-[88%] rounded-b-[10px] bg-[rgba(110,120,135,0.6)]" />
          <div className="mx-auto mt-0.5 h-1.5 w-[92%] rounded-full bg-[rgba(60,160,90,0.55)]" />
        </div>
      </Link>

      {/* Rich Hover Preview Tooltip */}
      {showPreview && (
        <div className="absolute -top-2 left-1/2 z-50 w-80 -translate-x-1/2 -translate-y-full transform animate-in fade-in-0 zoom-in-95 duration-200 pointer-events-none">
          <div className="rounded-lg border border-[rgba(255,255,255,0.2)] bg-[#0B1123] bg-opacity-95 p-4 shadow-xl backdrop-blur-sm ring-1 ring-[rgba(154,230,180,0.2)]">
            {/* Arrow pointing to grave */}
            <div className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 transform border-b border-r border-[rgba(255,255,255,0.2)] bg-[#0B1123]"></div>
            
            {/* Header with title and cause icon */}
            <div className="mb-3 flex items-start gap-3">
              <span className="text-2xl" title="Cause of death">
                {getCauseIcon(grave.title, grave.eulogyPreview || '')}
              </span>
              <div className="flex-1">
                <h4 className="font-semibold text-white text-sm leading-tight">
                  {grave.title}
                </h4>
                <p className="text-xs text-[var(--muted)] mt-1">
                  {formatTimeAgo(grave.createdAt)}
                </p>
              </div>
            </div>

            {/* Epitaph Preview */}
            {grave.eulogyPreview && (
              <div className="mb-3">
                <p className="text-xs text-[var(--muted)] mb-1 font-medium">Epitaph:</p>
                <p className="text-sm text-white/90 leading-relaxed line-clamp-3">
                  "{grave.eulogyPreview}"
                </p>
              </div>
            )}

            {/* Stats Row */}
            <div className="flex items-center justify-between text-xs border-t border-[rgba(255,255,255,0.1)] pt-3">
              <div className="flex gap-4">
                <span className="flex items-center gap-1 text-[var(--muted)]">
                  ❤️ {grave.reactions.heart}
                </span>
                <span className="flex items-center gap-1 text-[var(--muted)]">
                  🕯️ {grave.reactions.candle}
                </span>
                <span className="flex items-center gap-1 text-[var(--muted)]">
                  🌹 {grave.reactions.rose}
                </span>
              </div>
              <span className="text-[var(--accent)] font-medium">
                Click to view →
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
