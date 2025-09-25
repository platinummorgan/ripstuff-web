export function hashString32(input: string): number {
  let h = 2166136261 >>> 0; // FNV-1a basis
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

export function coordForYard(yardId: string, worldSize = 10000) {
  const h1 = hashString32(yardId);
  const h2 = hashString32(yardId.split("").reverse().join(""));
  const x = (h1 % worldSize);
  const y = (h2 % worldSize);
  return { x, y };
}

export function keeperShortLabel(id: string) {
  return `Keeper ${id.slice(0, 8)}`;
}
