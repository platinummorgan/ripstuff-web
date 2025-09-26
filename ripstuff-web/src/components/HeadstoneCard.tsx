"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { FeedItem } from "@/lib/validation";

function isVideoUrl(url?: string | null) {
  if (!url) return false;
  return /\.(mp4|webm|mov)(\?|#|$)/i.test(url);
}

export function HeadstoneCard({ grave }: { grave: FeedItem }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
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
    <Link href={`/grave/${grave.slug}`} className="group relative block">
      <div className="relative mx-auto w-[120px] sm:w-[140px]">
        {/* Stone shadow glow */}
        <div className="absolute inset-0 rounded-t-[26px] bg-[rgba(255,255,255,0.06)] blur-[2px]" />
        {/* Stone body */}
        <div className="relative rounded-t-[26px] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(200,203,210,0.35),rgba(120,130,150,0.35))] p-2 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]">
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
  );
}
