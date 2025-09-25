"use client";

import { useState } from "react";

import { Button } from "@/components/Button";

interface ReportButtonProps {
  graveId: string;
}

export function ReportButton({ graveId }: ReportButtonProps) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasReported, setHasReported] = useState(false);

  async function handleReport() {
    if (hasReported) return;

    setPending(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch(`/api/graves/${graveId}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload?.message ?? payload?.code ?? "Unable to submit report");
      }

      setMessage("Report received. We'll review this grave shortly.");
      setHasReported(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit report.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2 text-sm text-[var(--muted)]">
      <Button variant="ghost" disabled={pending || hasReported} onClick={handleReport}>
        {pending ? "Sending..." : hasReported ? "Report received" : "Report grave"}
      </Button>
      {message && <p className="text-xs text-[var(--foreground)]">{message}</p>}
      {error && <p className="text-xs text-[#ff8097]">{error}</p>}
    </div>
  );
}
