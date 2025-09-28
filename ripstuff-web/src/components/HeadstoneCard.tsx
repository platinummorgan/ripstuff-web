"use client";

import { useRef, useState } from "react";

import { SafeImage } from "@/components/SafeImage";
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

function getTombstoneVariation(grave: FeedItem): {
  shape: 'classic' | 'ornate' | 'modern' | 'weathered';
  material: 'marble' | 'granite' | 'stone' | 'aged';
  decoration: 'none' | 'flowers' | 'candles' | 'wreath';
} {
  // Create deterministic variations based on grave properties
  let seed = grave.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Age-based variations using a fixed reference date to avoid SSR hydration issues
  const referenceDate = new Date('2025-09-27').getTime(); // Fixed reference date
  const ageInDays = (referenceDate - new Date(grave.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  
  // Popular graves get more ornate styles
  const totalReactions = grave.reactions.heart + grave.reactions.candle + grave.reactions.rose;
  
  // Determine shape based on reactions and age
  let shape: 'classic' | 'ornate' | 'modern' | 'weathered';
  if (totalReactions > 10) {
    shape = 'ornate';
  } else if (ageInDays < 7) {
    shape = 'modern';
  } else if (ageInDays > 30) {
    shape = 'weathered';
  } else {
    shape = 'classic';
  }
  
  // Material based on category and age
  let material: 'marble' | 'granite' | 'stone' | 'aged';
  if (grave.category === 'TECH_GADGETS' && ageInDays < 14) {
    material = 'granite';
  } else if (totalReactions > 5) {
    material = 'marble';
  } else if (ageInDays > 21) {
    material = 'aged';
  } else {
    material = 'stone';
  }
  
  // Decorations based on reactions
  let decoration: 'none' | 'flowers' | 'candles' | 'wreath';
  if (grave.reactions.rose > 2) {
    decoration = 'flowers';
  } else if (grave.reactions.candle > 3) {
    decoration = 'candles';
  } else if (totalReactions > 8) {
    decoration = 'wreath';
  } else {
    decoration = 'none';
  }
  
  return { shape, material, decoration };
}

export function HeadstoneCard({ grave }: { grave: FeedItem }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const video = isVideoUrl(grave.photoUrl);
  
  // Get tombstone variation based on grave characteristics
  const variation = getTombstoneVariation(grave);

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
          <div className={`absolute inset-0 blur-[2px] transition-all duration-300 group-hover:blur-[4px] group-hover:scale-110 ${
            variation.shape === 'ornate' ? 'rounded-t-[30px] bg-[rgba(255,215,0,0.08)]' :
            variation.shape === 'modern' ? 'rounded-t-[16px] bg-[rgba(200,200,255,0.06)]' :
            variation.shape === 'weathered' ? 'rounded-t-[24px] bg-[rgba(139,125,107,0.08)]' :
            'rounded-t-[26px] bg-[rgba(255,255,255,0.06)]'
          } group-hover:bg-[rgba(154,230,180,0.15)]`} />
          
          {/* Stone body with material variations */}
          <div className={`relative border p-2 transition-all duration-300 group-hover:border-[rgba(154,230,180,0.4)] ${
            variation.shape === 'ornate' ? 'rounded-t-[30px]' :
            variation.shape === 'modern' ? 'rounded-t-[16px]' :
            variation.shape === 'weathered' ? 'rounded-t-[24px]' :
            'rounded-t-[26px]'
          } ${
            variation.material === 'marble' ? 'border-slate-300/20 bg-[linear-gradient(180deg,rgba(240,240,250,0.4),rgba(200,200,220,0.35))] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]' :
            variation.material === 'granite' ? 'border-slate-400/25 bg-[linear-gradient(180deg,rgba(100,120,140,0.45),rgba(80,100,120,0.4))] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]' :
            variation.material === 'aged' ? 'border-yellow-900/30 bg-[linear-gradient(180deg,rgba(139,125,107,0.4),rgba(101,87,74,0.45))] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]' :
            'border-[var(--border)] bg-[linear-gradient(180deg,rgba(200,203,210,0.35),rgba(120,130,150,0.35))] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]'
          } group-hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_4px_12px_rgba(0,0,0,0.3)]`}>
            {/* Cap ridge */}
            <div className="mx-auto h-[6px] w-[70%] rounded-t-full bg-white/10" />
            {/* Face window for media */}
            <div className="mt-2 h-[72px] w-full overflow-hidden rounded-[10px] bg-black/25">
              {grave.photoUrl && !video ? (
                <SafeImage
                  src={grave.photoUrl}
                  alt={grave.title}
                  width={220}
                  height={140}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  unoptimized={grave.photoUrl.includes('.blob.vercel-storage.com')}
                  fallback={
                    <div className="headstone-fallback flex h-full w-full items-center justify-center text-2xl">
                      ??
                    </div>
                  }
                  onImageError={(event) => {
                    console.error('Headstone image failed to load:', grave.photoUrl, event);
                  }}
                />
              ) : (
                !video && (
                  <div className="headstone-fallback flex h-full w-full items-center justify-center text-2xl">
                    ??
                  </div>
                )
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
          {/* Pedestal and mound with material variations */}
          <div className={`mx-auto h-2 w-[88%] rounded-b-[10px] ${
            variation.material === 'marble' ? 'bg-[rgba(200,200,220,0.7)]' :
            variation.material === 'granite' ? 'bg-[rgba(90,110,130,0.8)]' :
            variation.material === 'aged' ? 'bg-[rgba(101,87,74,0.7)]' :
            'bg-[rgba(110,120,135,0.6)]'
          }`} />
          <div className="mx-auto mt-0.5 h-1.5 w-[92%] rounded-full bg-[rgba(60,160,90,0.55)]" />
          
          {/* Decorative elements based on grave popularity/reactions */}
          {variation.decoration !== 'none' && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              {variation.decoration === 'flowers' && (
                <div className="flex gap-1">
                  <span className="text-xs">🌹</span>
                  <span className="text-xs">🌸</span>
                </div>
              )}
              {variation.decoration === 'candles' && (
                <div className="flex gap-1">
                  <span className="text-xs animate-pulse">🕯️</span>
                  <span className="text-xs animate-pulse" style={{ animationDelay: '0.5s' }}>🕯️</span>
                </div>
              )}
              {variation.decoration === 'wreath' && (
                <span className="text-sm">🎄</span>
              )}
            </div>
          )}
        </div>
      </Link>

      {/* Rich Hover Preview Tooltip */}
      {showPreview && (
        <div className="absolute left-1/2 z-50 w-80 -translate-x-1/2 transform animate-in fade-in-0 zoom-in-95 duration-200 pointer-events-none" 
             style={{ 
               bottom: '100%',
               marginBottom: '12px'
             }}>
          <div className="rounded-lg border border-[rgba(255,255,255,0.2)] bg-[#0B1123] bg-opacity-95 p-4 shadow-xl backdrop-blur-sm ring-1 ring-[rgba(154,230,180,0.2)]">
            {/* Arrow pointing down to grave */}
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
