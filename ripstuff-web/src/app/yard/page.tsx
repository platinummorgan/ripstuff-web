"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function YardLandingPage() {
  const [value, setValue] = useState("");
  const router = useRouter();

  function go(e: React.FormEvent) {
    e.preventDefault();
    const id = value.trim();
    if (!id) return;
    router.push(`/yard/${id}`);
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-white">Explore Graveyards</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Enter a yard ID to view someone’s public cemetery</p>
      </div>
      <form onSubmit={go} className="flex items-center gap-3">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Paste a yard ID"
          className="w-full rounded-lg border border-[var(--border)] bg-[rgba(10,14,25,0.8)] px-4 py-3 text-white placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
        />
        <button type="submit" className="rounded-lg bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-black">
          View
        </button>
      </form>
      <p className="text-xs text-[var(--muted)]">
        Tip: Find your yard ID on <span className="font-mono bg-black/30 px-1 py-0.5 rounded">/my-graveyard</span> and also see your place on the Overworld.
      </p>
    </div>
  );
}
