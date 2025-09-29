"use client";

import { useEffect, useState } from "react";

interface GraveDateDisplayProps {
  createdAt: string;
  datesText?: string | null;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(diff / (1000 * 60));
  
  if (days > 7) {
    // Show formatted date for older items
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    });
  } else if (days > 0) {
    return `${days} day${days === 1 ? '' : 's'} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }
  return 'Just now';
}

export function GraveDateDisplay({ createdAt, datesText }: GraveDateDisplayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Show static date during SSR to prevent hydration mismatch
    const date = new Date(createdAt);
    return (
      <p className="text-sm text-[var(--muted)]">
        {date.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })}
      </p>
    );
  }

  return (
    <div className="text-sm text-[var(--muted)]">
      {/* Show custom datesText if provided (like "3 years" or "2019-2024") */}
      {datesText && (
        <p>{datesText}</p>
      )}
      {/* Always show the creation time */}
      <p>Created {formatTimeAgo(createdAt)}</p>
    </div>
  );
}