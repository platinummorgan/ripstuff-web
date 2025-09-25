"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { InteractiveGraveMap } from "@/components/cemetery/InteractiveGraveMap";

interface District {
  x: number;
  y: number;
  graveCount: number;
  samplePhotoUrl: string | null;
}

export default function OverworldPage() {
  const searchParams = useSearchParams();
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialFocus, setInitialFocus] = useState<{x: number, y: number} | null>(null);

  useEffect(() => {
    async function fetchDistricts() {
      try {
        const response = await fetch('/api/map/districts');
        if (response.ok) {
          const data = await response.json();
          setDistricts(data.districts || []);
        } else {
          setError('Failed to load map data');
        }
      } catch (err) {
        setError('Error loading map data');
        console.error('Map data fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDistricts();
    
    // Parse focus coordinates from URL parameters
    const focusParam = searchParams.get('focus');
    if (focusParam) {
      const [x, y] = focusParam.split(',').map(Number);
      if (!isNaN(x) && !isNaN(y)) {
        setInitialFocus({ x, y });
      }
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-8">
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--accent)]"></div>
            <span>Loading map data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Map Error</h1>
          <p className="text-[var(--muted)]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-8">
      <InteractiveGraveMap 
        districts={districts}
        initialFocus={initialFocus}
      />
    </div>
  );
}
