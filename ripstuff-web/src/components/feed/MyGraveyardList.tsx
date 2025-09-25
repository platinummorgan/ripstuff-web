"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/Button";
import { GraveCard } from "@/components/GraveCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import type { FeedItem } from "@/lib/validation";

interface ListResponse {
  items: FeedItem[];
  nextCursor: string | null;
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";

export function MyGraveyardList() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const loadPage = useCallback(
    async (initial = false) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ limit: "8", mine: "1" });
        if (!initial && cursor) params.set("cursor", cursor);
        const res = await fetch(`${baseUrl}/api/graves?${params.toString()}`);
        const data = (await res.json()) as ListResponse;
        if (!res.ok) throw new Error("Unable to load your graves");

        setItems((prev) => (initial ? data.items : [...prev, ...data.items]));
        setCursor(data.nextCursor);
        setInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong loading your graves.");
      } finally {
        setLoading(false);
      }
    },
    [cursor],
  );

  useEffect(() => {
    void loadPage(true);
  }, [loadPage]);

  if (loading && !initialized) {
    return <LoadingSpinner label="Fetching your graves" />;
  }
  if (error && !items.length) {
    return <p className="text-sm text-[#ff8097]">{error}</p>;
  }
  if (!items.length) {
    return (
      <p className="text-sm text-[var(--muted)]">You haven’t buried anything on this device yet.</p>
    );
  }

  return (
    <div className="space-y-10">
      <div className="grid gap-6 sm:grid-cols-2">
        {items.map((item) => (
          <GraveCard key={`${item.id}-${item.slug}`} grave={item} />
        ))}
      </div>
      {error && <p className="text-sm text-[#ff8097]">{error}</p>}
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
