"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SectionHeader } from "@/components/SectionHeader";
import { MyGraveyardList } from "@/components/feed/MyGraveyardList";
import { HeadstoneCard } from "@/components/HeadstoneCard";
import { CemeteryCanvas } from "@/components/cemetery/CemeteryCanvas";
import type { FeedItem } from "@/lib/validation";

export default function MyGraveyardPage() {
  const [mode, setMode] = useState<"list" | "cemetery">("list");
  const [yardId, setYardId] = useState<string | null>(null);
  const [items, setItems] = useState<FeedItem[] | null>(null);

  useEffect(() => {
    fetch("/api/yard/me").then((r) => r.json()).then((d) => setYardId(d.yardId)).catch(() => {});
  }, []);

  useEffect(() => {
    if (mode !== "cemetery") return;
    // Load your graves in one shot for cemetery view
    fetch(`/api/graves?mine=1&limit=24`).then(async (r) => {
      const d = await r.json();
      if (r.ok) setItems(d.items as FeedItem[]);
    });
  }, [mode]);

  return (
    <div className="space-y-8">
      <SectionHeader
        title="My Graveyard"
        description="Your memorials from this device. Explore your place on the Overworld."
      />
      <div className="flex items-center justify-between">
        <div className="inline-flex gap-2 rounded-lg border border-[var(--border)] p-1">
          <button
            onClick={() => setMode("list")}
            className={`rounded-md px-3 py-1 text-sm ${mode === "list" ? "bg-[rgba(255,255,255,0.08)]" : ""}`}
          >
            List
          </button>
          <button
            onClick={() => setMode("cemetery")}
            className={`rounded-md px-3 py-1 text-sm ${mode === "cemetery" ? "bg-[rgba(255,255,255,0.08)]" : ""}`}
          >
            Cemetery
          </button>
        </div>
        <div className="flex gap-4">
          <Link href={`/overworld`} className="text-sm text-[var(--accent)] hover:underline">
            See on Overworld →
          </Link>
        </div>
      </div>

      {mode === "list" ? (
        <MyGraveyardList />
      ) : (
        <div className="space-y-6">
          {!items || items.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-[var(--muted)] mb-2">No graves yet.</p>
              <p className="text-sm text-[var(--muted)] opacity-60">Create your first memorial to see it on the map.</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2">Your Personal Cemetery</h3>
                <p className="text-sm text-[var(--muted)]">Click any grave to view its memorial page</p>
              </div>
              <div className="bg-[#0B1123] border border-[rgba(255,255,255,0.08)] rounded-xl p-8">
                <CemeteryCanvas variant="cemetery" intensity="normal">
                  <div className="cemetery-layout" style={{ width: '1400px', height: '1000px', position: 'relative' }}>
                    {items.map((grave, index) => {
                      // Create a nice grid layout for personal cemetery
                      const cols = Math.ceil(Math.sqrt(items.length));
                      const row = Math.floor(index / cols);
                      const col = index % cols;
                      const x = 120 + col * 240; // Appropriate spacing for moderately sized graves
                      const y = 120 + row * 220; // Appropriate spacing for moderately sized graves
                      
                      return (
                        <div
                          key={grave.id}
                          style={{
                            position: 'absolute',
                            left: `${x}px`,
                            top: `${y}px`,
                            transform: 'scale(1.6)', // Appropriate size - not too big, not too small
                            transformOrigin: 'center',
                            zIndex: 10,
                            cursor: 'pointer'
                          }}
                          className="hover:scale-125 transition-all duration-300 hover:z-20"
                        >
                          <HeadstoneCard grave={grave} />
                        </div>
                      );
                    })}
                    
                    {/* Cemetery background elements */}
                    <div 
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: 'url(/backgrounds/fantasy_world_1.jpeg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'sepia(30%) hue-rotate(200deg) brightness(0.3)'
                      }}
                    />
                  </div>
                </CemeteryCanvas>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

interface GraveLocationCardProps {
  grave: FeedItem;
}

function GraveLocationCard({ grave }: GraveLocationCardProps) {
  // Use the real coordinates stored in the database
  const x = grave.mapX ?? 0;
  const y = grave.mapY ?? 0;

  const handleLocationClick = () => {
    // Navigate to overworld map focused on this district
    window.location.href = `/overworld?focus=${x},${y}`;
  };

  return (
    <div className="bg-[#0B1123] border border-[rgba(255,255,255,0.08)] rounded-xl overflow-hidden hover:border-[rgba(154,230,180,0.3)] transition-all duration-300 group">
      {/* Mini Map View */}
      <div 
        className="relative aspect-[16/10] bg-[#0c1428] cursor-pointer overflow-hidden"
        onClick={handleLocationClick}
      >
        {/* Background Map - cropped to show the specific district area */}
        <img
          src="/backgrounds/fantasy_world_1.jpeg"
          alt="Overworld section"
          className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity"
          style={{
            transform: `scale(4) translate(${-12.5 + (x / 16) * 100}%, ${-12.5 + (y / 16) * 100}%)`,
            transformOrigin: '0 0'
          }}
        />
        
        {/* Grid Overlay showing the specific district */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-16 h-10 border-2 border-[var(--accent)] bg-[rgba(154,230,180,0.15)] rounded shadow-lg">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-[var(--accent)] font-mono font-semibold bg-black/50 px-2 py-1 rounded">
              {x},{y}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-[var(--accent)] rounded-full animate-pulse shadow-lg" />
            </div>
          </div>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-2 left-2 text-white text-sm font-medium">
            Click to explore district →
          </div>
        </div>
      </div>

      {/* Grave Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-white truncate flex-1">
            {grave.title}
          </h4>
          <span className="text-xs text-[var(--muted)] ml-2 font-mono bg-[rgba(154,230,180,0.1)] px-2 py-1 rounded">
            {x},{y}
          </span>
        </div>
        
        <p className="text-sm text-[var(--muted)] line-clamp-2 mb-3">
          {grave.eulogyPreview}
        </p>

        <div className="flex items-center justify-between text-xs">
          <div className="text-[var(--muted)]">
            {new Date(grave.createdAt).toLocaleDateString()}
          </div>
          <Link 
            href={`/grave/${grave.slug}`}
            className="text-[var(--accent)] hover:underline font-medium"
          >
            View Memorial →
          </Link>
        </div>
      </div>
    </div>
  );
}
