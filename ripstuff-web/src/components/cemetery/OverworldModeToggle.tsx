"use client";

import { useEffect, useState } from "react";

export function OverworldModeToggle() {
  const [mode, setMode] = useState<"day" | "night">(() => {
    if (typeof window === "undefined") return "night";
    try { return (localStorage.getItem("overworld:mode") as any) === "day" ? "day" : "night"; } catch { return "night"; }
  });

  useEffect(() => {
    try { localStorage.setItem("overworld:mode", mode); } catch {}
    try { window.dispatchEvent(new Event("overworld:modechange")); } catch {}
  }, [mode]);

  return (
    <div className="flex select-none items-center gap-1 rounded bg-[rgba(255,255,255,0.08)] p-0.5 text-[10px] text-[var(--muted)]">
      <button
        className={`rounded px-2 py-1 ${mode === "day" ? "bg-[rgba(255,255,255,0.12)] text-white" : ""}`}
        onClick={(e) => { e.preventDefault(); setMode("day"); }}
      >
        Day
      </button>
      <button
        className={`rounded px-2 py-1 ${mode === "night" ? "bg-[rgba(255,255,255,0.12)] text-white" : ""}`}
        onClick={(e) => { e.preventDefault(); setMode("night"); }}
      >
        Night
      </button>
    </div>
  );
}
