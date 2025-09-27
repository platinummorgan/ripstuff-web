"use client";

import { useState } from "react";
import { analytics } from "@/lib/analytics";

import type { FeedItem } from "@/lib/validation";

interface ReactionsBarProps {
  graveId: string;
  initialCounts: FeedItem["reactions"];
}

type ReactionType = "HEART" | "CANDLE" | "ROSE" | "LOL";

const reactionKeyMap: Record<ReactionType, keyof FeedItem["reactions"]> = {
  HEART: "heart",
  CANDLE: "candle",
  ROSE: "rose",
  LOL: "lol",
};

const reactionMeta: Array<{
  type: ReactionType;
  emoji: string;
  label: string;
}> = [
  { type: "HEART", emoji: "❤️", label: "Hearts" },
  { type: "CANDLE", emoji: "🕯️", label: "Candles" },
  { type: "ROSE", emoji: "🌹", label: "Roses" },
  { type: "LOL", emoji: "😂", label: "Laughs" },
];

interface ReactionResponse {
  reactions: FeedItem["reactions"];
  code?: string;
  message?: string;
}

export function ReactionsBar({ graveId, initialCounts }: ReactionsBarProps) {
  const [counts, setCounts] = useState(initialCounts);
  const [active, setActive] = useState<Set<ReactionType>>(new Set());
  const [pending, setPending] = useState<ReactionType | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggle(type: ReactionType) {
    const isActive = active.has(type);
    const action = isActive ? "REMOVE" : "ADD";

    setPending(type);
    setError(null);

    try {
      const res = await fetch(`/api/graves/${graveId}/reactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type, action }),
      });

      const payload = (await res.json()) as ReactionResponse;

      if (!res.ok) {
        throw new Error(payload.message ?? payload.code ?? "Unable to update reaction");
      }

      setCounts(payload.reactions);
      setActive((prev) => {
        const next = new Set(prev);
        if (action === "ADD") {
          next.add(type);
          // Track reaction addition
          analytics.trackReaction(graveId, type.toLowerCase());
        } else {
          next.delete(type);
        }
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update reactions.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-3 text-sm">
      <div className="flex flex-wrap gap-3">
        {reactionMeta.map((meta) => {
          const isActive = active.has(meta.type);
          const key = reactionKeyMap[meta.type];
          const count = counts[key];

          return (
            <button
              key={meta.type}
              type="button"
              onClick={() => toggle(meta.type)}
              disabled={pending === meta.type}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 transition ${isActive ? "border-[var(--accent)] bg-[rgba(142,123,255,0.15)] text-white" : "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[var(--muted)] hover:border-[var(--accent)]"}`}
            >
              <span>{meta.emoji}</span>
              <span className="font-medium text-white">{count}</span>
              <span className="uppercase tracking-[0.2em] text-[var(--muted)]">{meta.label}</span>
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-[#ff8097]">{error}</p>}
    </div>
  );
}
