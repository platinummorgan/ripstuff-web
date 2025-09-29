"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { GraveCard } from "@/components/GraveCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import type { FeedItem } from "@/lib/validation";

interface FeedResponse {
  items: FeedItem[];
  nextCursor: string | null;
}

interface LoadMoreFeedButtonProps {
  cursor: string;
  featured?: boolean;
  initialItems: FeedItem[];
}

export function LoadMoreFeedButton({ cursor, featured, initialItems }: LoadMoreFeedButtonProps) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(cursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMore = async () => {
    if (!nextCursor) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ 
        limit: "8",
        cursor: nextCursor,
      });
      
      if (featured !== undefined) {
        params.set("featured", featured.toString());
      }

      const url = `/api/feed?${params.toString()}`;
      const res = await fetch(url);
      const data = await res.json() as FeedResponse;

      if (!res.ok) {
        throw new Error("Unable to load more graves");
      }

      setItems(prev => [...prev, ...data.items]);
      setNextCursor(data.nextCursor);
    } catch (err) {
      console.error('[LoadMoreFeedButton] Error:', err);
      setError(err instanceof Error ? err.message : "Something went wrong loading graves.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {items.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2">
          {items.map((item) => (
            <GraveCard key={`${item.id}-${item.slug}`} grave={item} />
          ))}
        </div>
      )}
      
      {error && (
        <p className="text-sm text-[#ff8097]">{error}</p>
      )}
      
      {nextCursor && (
        <div className="flex justify-center">
          <Button disabled={loading} onClick={loadMore}>
            {loading ? <LoadingSpinner label="Loading more" /> : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}