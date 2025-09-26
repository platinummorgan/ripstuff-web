"use client";

import { useState, useTransition } from "react";

import { performModerationAction } from "@/actions/moderation";
import { Button } from "@/components/Button";
import { GraveStatus } from "@prisma/client";

type ModerationAction = "APPROVE" | "HIDE" | "FEATURE" | "UNHIDE" | "NOTE" | "DELETE";

interface Props {
  graveId: string;
  initialStatus: GraveStatus;
  initialFeatured: boolean;
  initialReports: number;
  onChange?: (next: { status: GraveStatus; featured: boolean; reports: number; action: ModerationAction; reason?: string }) => void;
}

export function ModerationRowActions({ graveId, initialStatus, initialFeatured, initialReports, onChange }: Props) {
  const [pendingAction, setPendingAction] = useState<ModerationAction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [currentStatus, setCurrentStatus] = useState<GraveStatus>(initialStatus);
  const [featured, setFeatured] = useState(initialFeatured);
  const [reports, setReports] = useState(initialReports);
  const [isDeleted, setIsDeleted] = useState(false);

  function run(actionType: ModerationAction, reason?: string) {
    startTransition(async () => {
      setPendingAction(actionType);
      setError(null);
      setMessage(null);
      
      try {
        const result = await performModerationAction({ 
          graveId, 
          action: actionType, 
          reason: reason?.trim() || undefined 
        });
        
        if (actionType === "DELETE") {
          setIsDeleted(true);
          setMessage("Grave deleted successfully");
          onChange?.({ 
            status: currentStatus, 
            featured, 
            reports: 0, 
            action: actionType, 
            reason 
          });
        } else {
          if (result.status) setCurrentStatus(result.status as GraveStatus);
          if (result.featured !== undefined) setFeatured(result.featured);
          if (result.remainingReports !== undefined) setReports(result.remainingReports);
          
          setMessage(`${actionType} complete${result.status ? `. Status: ${result.status}` : ''}${result.remainingReports !== undefined ? `. Remaining reports: ${result.remainingReports}` : ''}`);
          
          onChange?.({ 
            status: (result.status as GraveStatus) || currentStatus, 
            featured: result.featured ?? featured, 
            reports: result.remainingReports ?? reports, 
            action: actionType, 
            reason 
          });
        }
        
        if (actionType === "NOTE") {
          setNote("");
          setIsNoteOpen(false);
        }
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Action failed");
      } finally {
        setPendingAction(null);
      }
    });
  }

  const noteDisabled = !note.trim() || isPending;

  if (isDeleted) {
    return (
      <div className="space-y-2 text-xs text-[var(--muted)]">
        <div className="text-[#ff8097] font-semibold">DELETED</div>
        <div>This grave has been permanently deleted.</div>
      </div>
    );
  }

  return (
    <div className="space-y-2 text-xs text-[var(--muted)]">
      <div className="flex flex-wrap gap-1">
        {currentStatus === "PENDING" && (
          <>
            <Button 
              variant="ghost" 
              disabled={isPending} 
              onClick={() => run("APPROVE")}
              className="text-green-400 hover:text-green-300 text-xs px-2 py-1 h-auto"
            >
              {pendingAction === "APPROVE" ? "Approving..." : "Approve"}
            </Button>
            <Button 
              variant="ghost" 
              disabled={isPending} 
              onClick={() => run("HIDE")}
              className="text-orange-400 hover:text-orange-300 text-xs px-2 py-1 h-auto"
            >
              {pendingAction === "HIDE" ? "Hiding..." : "Hide"}
            </Button>
          </>
        )}
        
        {currentStatus === "HIDDEN" && (
          <Button 
            variant="ghost" 
            disabled={isPending} 
            onClick={() => run("UNHIDE")}
            className="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 h-auto"
          >
            {pendingAction === "UNHIDE" ? "Unhiding..." : "Unhide"}
          </Button>
        )}
        
        {(currentStatus === "APPROVED" || currentStatus === "PENDING") && !featured && (
          <Button 
            variant="ghost" 
            disabled={isPending} 
            onClick={() => run("FEATURE")}
            className="text-yellow-400 hover:text-yellow-300 text-xs px-2 py-1 h-auto"
          >
            {pendingAction === "FEATURE" ? "Featuring..." : "Feature"}
          </Button>
        )}
        
        <Button 
          variant="ghost" 
          disabled={isPending} 
          onClick={() => setIsNoteOpen((prev) => !prev)}
          className="text-xs px-2 py-1 h-auto"
        >
          {isNoteOpen ? "Cancel" : "Note"}
        </Button>
        
        <Button 
          variant="ghost" 
          disabled={isPending} 
          onClick={() => {
            if (confirm("Are you sure you want to permanently delete this grave? This action cannot be undone.")) {
              run("DELETE");
            }
          }}
          className="text-red-400 hover:text-red-300 text-xs px-2 py-1 h-auto"
        >
          {pendingAction === "DELETE" ? "Deleting..." : "Delete"}
        </Button>
      </div>
      
      <div>
        <span className="mr-3">Reports: {reports}</span>
        <span>Status: {currentStatus}</span>
        {featured && <span className="ml-3 text-yellow-400">Featured</span>}
      </div>
      
      {isNoteOpen && (
        <div className="space-y-2 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-3">
          <textarea
            value={note}
            maxLength={280}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Leave a moderator note (visible in audit trail)"
            className="h-20 w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(10,14,25,0.8)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
          />
          <div className="flex justify-end">
            <Button 
              variant="primary" 
              disabled={noteDisabled} 
              onClick={() => run("NOTE", note)}
            >
              {pendingAction === "NOTE" ? "Saving..." : "Save note"}
            </Button>
          </div>
        </div>
      )}
      
      {message && <p className="text-[var(--foreground)]">{message}</p>}
      {error && <p className="text-[#ff8097]">{error}</p>}
    </div>
  );
}
