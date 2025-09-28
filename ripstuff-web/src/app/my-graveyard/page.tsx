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
              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                {/* Atmospheric Cemetery Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
                  {/* Background cemetery image with overlay */}
                  <div 
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage: 'url(/backgrounds/fantasy_world_1.jpeg)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      filter: 'sepia(20%) hue-rotate(200deg) brightness(0.4) contrast(1.2)'
                    }}
                  />
                  
                  {/* Atmospheric fog layers */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-slate-800/40" />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-900/30 via-transparent to-slate-900/30" />
                  
                  {/* Subtle noise texture for depth */}
                  <div 
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                      backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)',
                      backgroundSize: '50px 50px'
                    }}
                  />
                </div>

                <CemeteryCanvas variant="cemetery" intensity="normal">
                  <div className="cemetery-layout relative" style={{ width: '1400px', height: '1000px', position: 'relative' }}>
                    {/* Cemetery ground elements */}
                    <div className="absolute inset-0">
                      {/* Misty ground fog */}
                      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/5 to-transparent opacity-40" />
                      
                      {/* Scattered cemetery pathways */}
                      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
                        <defs>
                          <pattern id="cobblestone" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                            <rect width="20" height="20" fill="rgba(100,100,120,0.1)" />
                            <circle cx="10" cy="10" r="2" fill="rgba(150,150,170,0.15)" />
                          </pattern>
                        </defs>
                        
                        {/* Curved cemetery path */}
                        <path 
                          d="M 100 800 Q 400 600 700 750 T 1300 650" 
                          stroke="url(#cobblestone)" 
                          strokeWidth="80" 
                          fill="none"
                          opacity="0.3"
                        />
                        
                        {/* Secondary pathways */}
                        <path 
                          d="M 200 200 Q 500 400 800 300 T 1200 400" 
                          stroke="rgba(120,130,150,0.1)" 
                          strokeWidth="40" 
                          fill="none"
                        />
                      </svg>
                    </div>
                    {items.map((grave, index) => {
                      // Create organic cemetery layout following paths
                      const totalGraves = items.length;
                      const gravesPerRow = Math.ceil(Math.sqrt(totalGraves));
                      const row = Math.floor(index / gravesPerRow);
                      const col = index % gravesPerRow;
                      
                      // Add organic offset and spacing variation
                      let seed = grave.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                      const randomOffset = (seed % 40) - 20; // -20 to +20 offset
                      const randomYOffset = ((seed * 7) % 30) - 15; // -15 to +15 offset
                      
                      // Follow curved cemetery paths with organic spacing
                      const baseX = 150 + col * 220;
                      const baseY = 160 + row * 200;
                      
                      // Add curve following the cemetery path
                      const pathCurve = Math.sin((col / gravesPerRow) * Math.PI) * 30;
                      
                      const x = baseX + randomOffset + pathCurve;
                      const y = baseY + randomYOffset + (row % 2 === 0 ? 0 : 30); // Stagger alternate rows
                      
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
                          {/* Ambient grave lighting */}
                          <div className="absolute -inset-8 -z-10">
                            {/* Soft glow around each grave */}
                            <div 
                              className="absolute inset-0 rounded-full opacity-20 blur-xl"
                              style={{
                                background: `radial-gradient(circle, rgba(154,230,180,0.2) 0%, transparent 70%)`
                              }}
                            />
                            
                            {/* Subtle ground shadow */}
                            <div 
                              className="absolute bottom-2 left-1/2 w-16 h-6 -translate-x-1/2 blur-md opacity-30"
                              style={{
                                background: 'radial-gradient(ellipse, rgba(0,0,0,0.6) 0%, transparent 100%)'
                              }}
                            />
                          </div>
                          
                          <HeadstoneCard grave={grave} />
                        </div>
                      );
                    })}
                    
                    {/* Floating ambient particles */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
                          style={{
                            left: `${20 + (i * 7) % 80}%`,
                            top: `${30 + (i * 11) % 60}%`,
                            animationDelay: `${i * 0.5}s`,
                            animationDuration: `${3 + (i % 3)}s`
                          }}
                        />
                      ))}
                    </div>
                    
                    {/* Distant cemetery elements for depth */}
                    <div className="absolute inset-0 opacity-15 pointer-events-none">
                      {/* Distant trees silhouettes */}
                      <div className="absolute top-10 left-10 w-8 h-16 bg-gradient-to-t from-slate-800 to-slate-700 opacity-60" 
                           style={{ clipPath: 'polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)' }} />
                      <div className="absolute top-20 right-20 w-6 h-12 bg-gradient-to-t from-slate-800 to-slate-700 opacity-40"
                           style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)' }} />
                      
                      {/* Distant mausoleums */}
                      <div className="absolute top-32 left-1/4 w-12 h-8 bg-slate-700/30 opacity-50" />
                      <div className="absolute top-28 right-1/3 w-8 h-6 bg-slate-700/25 opacity-40" />
                    </div>
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
