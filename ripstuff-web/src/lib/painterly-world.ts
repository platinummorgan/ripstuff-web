export type Island = { x: number; y: number; w: number; h: number; rot: number };

function hash32(n: number) {
  n |= 0; n = n + 0x6D2B79F5 | 0; let t = Math.imul(n ^ (n >>> 15), 1 | n);
  t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
  return (t ^ (t >>> 14)) >>> 0;
}

function rnd(seed: number) { return (hash32(seed) % 1000000) / 1000000; }

export const DEFAULT_PAINTERLY_SEED = 7;

export function generateIslands(worldSize: number, seed = DEFAULT_PAINTERLY_SEED, count = 6): Island[] {
  const list: Island[] = [];
  for (let i = 0; i < count; i += 1) {
    const s1 = rnd(seed + i * 11);
    const s2 = rnd(seed + i * 13);
    const s3 = rnd(seed + i * 17);
    const x = Math.floor((0.05 + 0.9 * s1) * worldSize);
    const y = Math.floor((0.05 + 0.9 * s2) * worldSize);
    const w = Math.floor((0.18 + 0.22 * s3) * worldSize);
    const h = Math.floor((0.12 + 0.2 * rnd(seed + i * 19)) * worldSize);
    const rot = (rnd(seed + i * 23) - 0.5) * Math.PI;
    list.push({ x, y, w, h, rot });
  }
  return list;
}

export function generateLandmasses(worldSize: number, seed = DEFAULT_PAINTERLY_SEED, count = 4): Island[] {
  const list: Island[] = [];
  for (let i = 0; i < count; i += 1) {
    const s1 = rnd(seed + i * 31);
    const s2 = rnd(seed + i * 37);
    const s3 = rnd(seed + i * 41);
    const x = Math.floor((0.15 + 0.7 * s1) * worldSize);
    const y = Math.floor((0.15 + 0.7 * s2) * worldSize);
    const w = Math.floor((0.45 + 0.25 * s3) * worldSize);
    const h = Math.floor((0.35 + 0.25 * rnd(seed + i * 43)) * worldSize);
    const rot = (rnd(seed + i * 47) - 0.5) * Math.PI;
    list.push({ x, y, w, h, rot });
  }
  return list;
}

function pointToLocal(px: number, py: number, cx: number, cy: number, rot: number) {
  const dx = px - cx;
  const dy = py - cy;
  const cos = Math.cos(-rot);
  const sin = Math.sin(-rot);
  return { x: dx * cos - dy * sin, y: dx * sin + dy * cos };
}

function localToWorld(lx: number, ly: number, cx: number, cy: number, rot: number) {
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);
  return { x: lx * cos - ly * sin + cx, y: lx * sin + ly * cos + cy };
}

export function clampToLand(pt: { x: number; y: number }, islands: Island[]): { x: number; y: number } {
  if (islands.length === 0) return pt;
  let bestIsland: Island | null = null;
  let bestS = Infinity;
  let bestLocal = { x: 0, y: 0 };

  for (const isl of islands) {
    const a = isl.w / 2;
    const b = isl.h / 2;
    const p = pointToLocal(pt.x, pt.y, isl.x, isl.y, isl.rot);
    const s = Math.sqrt((p.x * p.x) / (a * a) + (p.y * p.y) / (b * b));
    if (s < bestS) {
      bestS = s;
      bestIsland = isl;
      bestLocal = p;
    }
    if (s <= 1) {
      // already inside an island, keep as is
      return pt;
    }
  }
  if (!bestIsland) return pt;
  // Project to island boundary (inside edge)
  const a = bestIsland.w / 2;
  const b = bestIsland.h / 2;
  const p = bestLocal;
  const s = Math.sqrt((p.x * p.x) / (a * a) + (p.y * p.y) / (b * b));
  if (s === 0) return { x: bestIsland.x, y: bestIsland.y };
  const lx = p.x / s * (a * 0.98); // slightly inside
  const ly = p.y / s * (b * 0.98);
  const w = localToWorld(lx, ly, bestIsland.x, bestIsland.y, bestIsland.rot);
  return w;
}
