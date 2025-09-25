"use client";

import { useMemo } from "react";
import { DEFAULT_PAINTERLY_SEED, generateIslands, generateLandmasses } from "@/lib/painterly-world";

export function PainterlyWorld({ worldSize, seed = DEFAULT_PAINTERLY_SEED, mode = "day" }: { worldSize: number; seed?: number; mode?: "day" | "night" }) {
  const land = useMemo(() => generateLandmasses(worldSize, seed, 4), [worldSize, seed]);
  const ponds = useMemo(() => generateIslands(worldSize, seed + 101, 3), [worldSize, seed]);

  return (
    <div className="absolute inset-0" aria-hidden>
      {/* Land base */}
      <div className="absolute inset-0" style={{
        background: mode === "day" ? "#4c5c52" : "#2e3a33"
      }} />
      {/* Landmasses (painterly) */}
      {land.map((b, idx) => (
        <div key={idx} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: b.x, top: b.y, width: b.w, height: b.h, transform: `translate(-50%, -50%) rotate(${b.rot}rad)` }}>
          {/* inner body */}
          <div className="absolute inset-0 rounded-[40%]"
            style={{
              background: mode === "day" ? "#5f7469" : "#44564b",
              boxShadow: "0 0 0 10px rgba(0,0,0,0.12) inset, 0 20px 40px rgba(0,0,0,0.25)",
              filter: "saturate(0.9)"
            }}
          />
          {/* sandy outline */}
          <div className="absolute inset-0 rounded-[40%]" style={{
            padding: 12,
            background: "conic-gradient(from 0deg, rgba(230,210,140,0.8), rgba(230,210,140,0) 40%)",
            mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor" as any, maskComposite: "exclude",
          }} />
          {/* shoreline AO */}
          <div className="absolute -inset-3 rounded-[42%]"
            style={{
              boxShadow: "0 0 0 3px rgba(0,0,0,0.2) inset",
              opacity: 0.5
            }}
          />
          {/* contour lines */}
          <div className="absolute inset-0 rounded-[40%] opacity-25"
            style={{
              backgroundImage: "repeating-radial-gradient(circle at 50% 60%, rgba(0,0,0,0.08) 0 6px, transparent 6px 14px)"
            }}
          />
          {/* painterly streaks */}
          <div className="absolute inset-0 opacity-35" style={{
            backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0 8px, transparent 8px 16px)"
          }} />
        </div>
      ))}
      {/* Ponds/creeks on land */}
      {ponds.map((p, i) => (
        <div key={`pond-${i}`} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: p.x, top: p.y, width: p.w * 0.35, height: p.h * 0.35, transform: `translate(-50%, -50%) rotate(${p.rot}rad)` }}>
          <div className="absolute inset-0 rounded-[50%]"
            style={{
              background: mode === "day" ? "#2f4a63" : "#162232",
              boxShadow: "0 0 0 6px rgba(0,0,0,0.3) inset, 0 0 16px rgba(0,0,0,0.18) inset"
            }}
          />
          <div className="absolute inset-0 rounded-[50%] opacity-30" style={{ backgroundImage: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent 60%)" }} />
        </div>
      ))}
      {/* Subtle creeks between some landmasses */}
      <svg className="pointer-events-none absolute inset-0" width={worldSize} height={worldSize} viewBox={`0 0 ${worldSize} ${worldSize}`}>
        {land.slice(0, Math.max(0, land.length - 2)).map((b, i) => {
          const n = land[i + 1];
          if (!n) return null;
          const path = `M ${b.x} ${b.y} C ${(b.x + n.x) / 2} ${b.y - 120}, ${(b.x + n.x) / 2} ${n.y + 120}, ${n.x} ${n.y}`;
          return (
            <path key={`creek-${i}`} d={path} fill="none" stroke={mode === "day" ? "rgba(75,119,181,0.35)" : "rgba(32,50,78,0.4)"} strokeWidth={4} strokeLinecap="round" />
          );
        })}
      </svg>
      {/* Roads between landmasses */}
      <svg className="pointer-events-none absolute inset-0" width={worldSize} height={worldSize} viewBox={`0 0 ${worldSize} ${worldSize}`}>
        {land.slice(0, land.length - 1).map((b, i) => {
          const n = land[i + 1];
          const path = `M ${b.x} ${b.y} C ${(b.x + n.x) / 2} ${b.y - 200}, ${(b.x + n.x) / 2} ${n.y + 200}, ${n.x} ${n.y}`;
          return (
            <path key={i} d={path} fill="none" stroke={mode === "day" ? "rgba(230,220,200,0.45)" : "rgba(200,200,220,0.35)"} strokeWidth={10} strokeLinecap="round" strokeOpacity={0.4} />
          );
        })}
      </svg>
    </div>
  );
}
