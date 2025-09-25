"use client";

import { useMemo } from "react";

type Biome = "marsh" | "deadwood" | "wasteland" | "tundra";

type Region = {
  id: string;
  biome: Biome;
  x: number; // center
  y: number; // center
  w: number; // size
  h: number; // size
  rot: number; // radians
};

function hash32(n: number) {
  // xorshift32
  n |= 0; n = n + 0x6D2B79F5 | 0; let t = Math.imul(n ^ n >>> 15, 1 | n);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return (t ^ t >>> 14) >>> 0;
}

function seeded(n: number) {
  return (hash32(n) % 1000000) / 1000000;
}

function pick<T>(arr: T[], s: number) {
  return arr[Math.floor(s * arr.length) % arr.length];
}

export function BiomeLayer({ worldSize, seed = 1337, mode = "day" }: { worldSize: number; seed?: number; mode?: "day" | "night" }) {
  const regions = useMemo<Region[]>(() => {
    // Build multiple dreary regions that tile the world with variety
    const pool: Biome[] = ["marsh", "deadwood", "wasteland", "tundra"];
    const count = 7;
    const list: Region[] = [];
    for (let i = 0; i < count; i += 1) {
      const biome = pick(pool, seeded(seed + i * 3));
      const s1 = seeded(seed + i * 101);
      const s2 = seeded(seed + i * 103);
      const x = Math.floor((0.15 + 0.7 * s1) * worldSize);
      const y = Math.floor((0.15 + 0.7 * s2) * worldSize);
      const w = Math.floor((0.28 + 0.22 * seeded(seed + i * 107)) * worldSize);
      const h = Math.floor((0.22 + 0.20 * seeded(seed + i * 109)) * worldSize);
      const rot = (seeded(seed + i * 113) - 0.5) * Math.PI / 2;
      list.push({ id: `${biome}-${i}`, biome, x, y, w, h, rot });
    }
    return list;
  }, [worldSize, seed]);

  return (
    <div className="absolute inset-0" aria-hidden>
      {/* Day overcast tint (dreary) */}
      {mode === "day" && (
        <div className="pointer-events-none absolute inset-0" style={{
          backgroundImage: `linear-gradient(180deg, rgba(80,100,120,0.25), rgba(90,110,125,0.18) 40%, rgba(200,210,220,0.04))`
        }} />
      )}

      {regions.map((r) => (
        <div key={r.id}
          className="absolute -translate-x-1/2 -translate-y-1/2 overflow-hidden"
          style={{ left: r.x, top: r.y, width: r.w, height: r.h, transform: `translate(-50%, -50%) rotate(${r.rot}rad)` }}
        >
          {r.biome === "marsh" && (
            <div className="absolute inset-0" style={{
              backgroundImage: `linear-gradient(180deg, rgba(40,70,55,0.25), transparent 55%)`
            }}>
              {/* reeds silhouettes + low fog */}
              <div className="absolute inset-0 opacity-50" style={{
                backgroundImage: `repeating-linear-gradient(90deg, rgba(0,0,0,0.18) 0 2px, transparent 2px 14px)`,
                filter: "blur(0.2px)"
              }} />
              <div className="absolute bottom-0 left-0 right-0 h-[35%] opacity-35" style={{
                background: "radial-gradient(60% 50% at 50% 100%, rgba(180,200,190,0.08), transparent 70%)"
              }} />
            </div>
          )}

          {r.biome === "deadwood" && (
            <div className="absolute inset-0" style={{
              backgroundImage: `linear-gradient(180deg, rgba(60,60,70,0.18), transparent 50%)`
            }}>
              {/* barren tree silhouettes */}
              <div className="absolute bottom-0 left-0 right-0 h-[40%] opacity-60" style={{
                backgroundImage: `repeating-linear-gradient(90deg, rgba(20,25,30,0.45) 0 3px, transparent 3px 22px)`,
              }} />
              <div className="absolute inset-0 opacity-25" style={{
                backgroundImage: `repeating-linear-gradient(60deg, rgba(20,25,30,0.2) 0 8px, transparent 8px 24px)`
              }} />
            </div>
          )}

          {r.biome === "wasteland" && (
            <div className="absolute inset-0" style={{
              backgroundImage: `linear-gradient(180deg, rgba(80,70,50,0.18), transparent 55%)`
            }}>
              {/* cracked earth pattern */}
              <div className="absolute inset-0 opacity-35" style={{
                backgroundImage: `
                  repeating-linear-gradient(45deg, rgba(0,0,0,0.18) 0 1px, transparent 1px 12px),
                  repeating-linear-gradient(-45deg, rgba(0,0,0,0.18) 0 1px, transparent 1px 14px)
                `
              }} />
            </div>
          )}

          {r.biome === "tundra" && (
            <div className="absolute inset-0" style={{
              backgroundImage: `linear-gradient(180deg, rgba(150,170,185,0.18), transparent 55%)`
            }}>
              {/* drifting snow streaks */}
              <div className="absolute inset-0 opacity-35" style={{
                backgroundImage: `repeating-linear-gradient(15deg, rgba(230,240,255,0.08) 0 6px, transparent 6px 20px)`
              }} />
              <div className="absolute bottom-0 left-0 right-0 h-[35%]" style={{
                backgroundImage: `radial-gradient(70% 50% at 50% 110%, rgba(220,230,240,0.18), transparent 60%)`
              }} />
            </div>
          )}
        </div>
      ))}

  {/* Night: stars + fog overlay */}
      {mode === "night" && (
        <>
          <div className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)`,
              backgroundSize: "2px 2px",
              opacity: 0.15
            }}
          />
          <div className="pointer-events-none absolute inset-0" style={{
            backgroundImage: `
              radial-gradient(1200px_800px_at_20%_10%, rgba(200,220,255,0.05), transparent 60%),
              radial-gradient(1000px_600px_at_80%_20%, rgba(200,220,255,0.05), transparent 60%)
            `,
            filter: "blur(0.2px)"
          }} />
        </>
      )}
    </div>
  );
}
