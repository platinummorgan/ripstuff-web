"use client";

import { useState } from "react";

import { Button } from "@/components/Button";

interface ReportButtonProps {
  graveSlug: string;
  className?: string;
}

export function ReportButton({ graveSlug, className = "" }: ReportButtonProps) {
  const [showReasonForm, setShowReasonForm] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasReported, setHasReported] = useState(false);

  async function handleReport() {
    if (hasReported) return;

    // If no reason provided yet, show the form
    if (!showReasonForm && !reason.trim()) {
      setShowReasonForm(true);
      return;
    }

    // Validate reason length
    if (reason.trim().length < 10) {
      setError("Please provide a reason with at least 10 characters.");
      return;
    }

    setPending(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch(`/api/graves/${graveSlug}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: reason.trim() }),
      });

      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload?.message ?? payload?.code ?? "Unable to submit report");
      }

      setMessage(payload.message || "Report received. Thank you for helping keep our community safe.");
      setHasReported(true);
      setShowReasonForm(false);
      
      // If already reported, show that message
      if (payload.alreadyReported) {
        setHasReported(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit report.");
    } finally {
      setPending(false);
    }
  }

  function handleCancel() {
    setShowReasonForm(false);
    setReason("");
    setError(null);
  }

  if (hasReported) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="text-xs text-green-400 bg-green-400/10 px-3 py-2 rounded-lg border border-green-400/20">
          ✓ Report submitted
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {!showReasonForm ? (
        <Button 
          variant="ghost" 
          disabled={pending} 
          onClick={handleReport}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-2 text-xs"
        >
          🚩 Report memorial
        </Button>
      ) : (
        <div className="space-y-3 p-4 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)]">
          <div className="text-sm font-medium text-white">Report this memorial</div>
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Please explain why this memorial should be reviewed (minimum 10 characters)..."
            className="w-full h-20 px-3 py-2 bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-lg text-sm text-white placeholder-[var(--muted)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
            maxLength={280}
          />
          <div className="flex items-center justify-between text-xs text-[var(--muted)]">
            <span>{reason.length}/280 characters</span>
            <span className={reason.length < 10 ? "text-red-400" : "text-green-400"}>
              {reason.length < 10 ? `${10 - reason.length} more needed` : "✓"}
            </span>
          </div>
          <div className="flex gap-2">
            <Button 
              disabled={pending || reason.trim().length < 10}
              onClick={handleReport}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-sm"
            >
              {pending ? "Submitting..." : "Submit Report"}
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleCancel}
              disabled={pending}
              className="text-[var(--muted)] hover:text-white px-4 py-2 text-sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
      
      {message && (
        <div className="text-xs text-green-400 bg-green-400/10 px-3 py-2 rounded-lg border border-green-400/20">
          {message}
        </div>
      )}
      
      {error && (
        <div className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
          {error}
        </div>
      )}
    </div>
  );
}
