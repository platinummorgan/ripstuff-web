"use client";

import { useState, useEffect } from "react";

export type Sympathy = {
  id: string;
  body: string;
  createdAt: string;
  creatorInfo?: {
    name: string | null;
    picture: string | null;
  } | null;
};

interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  isModerator?: boolean;
}

interface SympathyListProps {
  sympathies: Sympathy[];
  onSympathyDeleted?: (sympathyId: string) => void;
}

export function SympathyList({ sympathies, onSympathyDeleted }: SympathyListProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  // Fetch current user to check moderator status
  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.user);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      } finally {
        setLoadingUser(false);
      }
    }

    fetchCurrentUser();
  }, []);

  async function deleteSympathy(sympathyId: string) {
    if (!currentUser?.isModerator) return;
    
    setDeletingIds(prev => new Set(prev).add(sympathyId));

    try {
      const response = await fetch(`/api/sympathies/${sympathyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Call the callback to remove from parent state
        onSympathyDeleted?.(sympathyId);
      } else {
        const error = await response.json();
        alert(`Failed to delete sympathy: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting sympathy:', error);
      alert('Failed to delete sympathy');
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(sympathyId);
        return newSet;
      });
    }
  }

  if (!sympathies.length) {
    return <p className="text-sm text-[var(--muted)]">No sympathies yet. Share the grave to invite a few.</p>;
  }

  return (
    <ul className="space-y-4">
      {sympathies.map((entry) => (
        <li key={entry.id} className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(10,14,25,0.8)] px-4 py-3 text-sm text-[var(--foreground)]">
          <p className="leading-6">{entry.body}</p>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {entry.creatorInfo?.picture && (
                <img
                  src={entry.creatorInfo.picture}
                  alt=""
                  className="h-4 w-4 rounded-full"
                />
              )}
              <span className="text-xs text-[var(--muted)]">
                {entry.creatorInfo?.name ? `by ${entry.creatorInfo.name}` : 'by Anonymous Mourner'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--muted)]">
                {new Date(entry.createdAt).toLocaleString()}
              </span>
              {!loadingUser && currentUser?.isModerator && (
                <button
                  onClick={() => deleteSympathy(entry.id)}
                  disabled={deletingIds.has(entry.id)}
                  className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed ml-2 px-2 py-1 rounded-md hover:bg-red-400/10 transition-colors"
                  title="Delete sympathy (Moderator)"
                >
                  {deletingIds.has(entry.id) ? '...' : '🗑️ Delete'}
                </button>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
