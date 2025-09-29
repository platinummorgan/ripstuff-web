"use client";

import { useState } from "react";

import { Button } from "@/components/Button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { SympathyList, type Sympathy } from "@/components/SympathyList";

interface SympathySectionProps {
  graveId: string;
  initialSympathies: Sympathy[];
}

interface SympathyResponse extends Sympathy {
  code?: string;
  message?: string;
}

export function SympathySection({ graveId, initialSympathies }: SympathySectionProps) {
  const [sympathies, setSympathies] = useState<Sympathy[]>(initialSympathies);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function submitSympathy() {
    if (!body.trim()) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/graves/${graveId}/sympathies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body: body.trim() }),
      });

      const payload = (await res.json()) as SympathyResponse;

      if (!res.ok) {
        throw new Error(payload.message ?? payload.code ?? "Unable to post sympathy");
      }

      setSympathies((prev) => [payload, ...prev].slice(0, 50));
      setBody("");
      setSuccess("Sympathy received. Thanks for keeping it kind.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post your sympathy.");
    } finally {
      setSubmitting(false);
    }
  }

  const handleSympathyDeleted = (sympathyId: string) => {
    setSympathies(prev => prev.filter(s => s.id !== sympathyId));
  };

  return (
    <div className="space-y-6">
      <SympathyList 
        sympathies={sympathies} 
        onSympathyDeleted={handleSympathyDeleted}
      />
      <div className="space-y-3 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Leave a sympathy</p>
        <textarea
          value={body}
          maxLength={140}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Offer a gentle condolence (max 140 characters)"
          className="h-28 w-full rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(10,14,25,0.8)] px-4 py-3 text-sm text-white focus:border-[var(--accent)] focus:outline-none break-words resize-none"
          style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
        />
        <div className="flex items-center gap-3">
          <Button type="button" disabled={submitting || !body.trim()} onClick={submitSympathy}>
            {submitting ? <LoadingSpinner label="Sending" /> : "Post sympathy"}
          </Button>
          <span className="text-xs text-[var(--muted)]">1 sympathy per minute so we keep the chapel serene.</span>
        </div>
        {error && <p className="text-xs text-[#ff8097]">{error}</p>}
        {success && <p className="text-xs text-[var(--foreground)]">{success}</p>}
      </div>
    </div>
  );
}
