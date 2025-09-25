export type OverworldItem = { yardId: string; count: number; samplePhotoUrl: string | null };

const SAMPLE_PHOTOS = [
  "/next.svg",
  "/vercel.svg",
  "/window.svg",
  "/globe.svg",
  "/textures/mist.svg",
];

export function generateOverworldPlaceholders(count: number): OverworldItem[] {
  const n = Math.max(0, Math.floor(count));
  const items: OverworldItem[] = [];
  for (let i = 0; i < n; i += 1) {
    const yardId = `placeholder-${String(i + 1).padStart(2, "0")}`;
    const photo = SAMPLE_PHOTOS[i % SAMPLE_PHOTOS.length] ?? null;
    const c = 1 + ((i * 7) % 25); // some variety
    items.push({ yardId, count: c, samplePhotoUrl: photo });
  }
  return items;
}
