"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/Button";
import { GraveCard } from "@/components/GraveCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import type { FeedItem } from "@/lib/validation";

interface FeedResponse {
  items: FeedItem[];
  nextCursor: string | null;
}

// Use relative URLs for API calls to avoid client-side env variable issues

interface FeedListProps {
  featured?: boolean;
}

export function FeedList({ featured }: FeedListProps = {}) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const loadPage = useCallback(async (initial = false) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ limit: "8" });
      if (!initial && cursor) {
        params.set("cursor", cursor);
      }
      if (featured !== undefined) {
        params.set("featured", featured.toString());
      }

      const url = `/api/feed?${params.toString()}`;
      console.log('[FeedList] Fetching:', url);
      const res = await fetch(url);
      const data = (await res.json()) as FeedResponse;
      console.log('[FeedList] Data:', data);

      if (!res.ok) {
        throw new Error(data?.items ? "Unable to load more graves" : "Unable to load graves");
      }

      setItems((prev) => (initial ? data.items : [...prev, ...data.items]));
      setCursor(data.nextCursor);
      setInitialized(true);
    } catch (err) {
      console.error('[FeedList] Error:', err);
      setError(err instanceof Error ? err.message : "Something went wrong loading graves.");
    } finally {
      setLoading(false);
    }
  }, [cursor]);

  useEffect(() => {
    // initial load
    void loadPage(true);
  }, [loadPage]);

  if (loading && !initialized) {
    return <LoadingSpinner label="Waking undertakers" />;
  }

  if (error && !items.length) {
    return <p className="text-sm text-[#ff8097]">{error}</p>;
  }

  if (!items.length && initialized && !loading) {
    return <p className="text-sm text-[var(--muted)]">No graves here yet. Be the first to bury something memorable.</p>;
  }

  return (
    <div className="space-y-10">
      <div className="grid gap-6 sm:grid-cols-2">
        {items.map((item) => (
          <GraveCard key={`${item.id}-${item.slug}`} grave={item} />
        ))}
      </div>
      {error && (
        <p className="text-sm text-[#ff8097]">{error}</p>
      )}
      {cursor && (
        <div className="flex justify-center">
          <Button disabled={loading} onClick={() => loadPage(false)}>
            {loading ? <LoadingSpinner label="Loading more" /> : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}
