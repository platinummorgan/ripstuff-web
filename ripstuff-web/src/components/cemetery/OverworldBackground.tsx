import React from "react";


// Biome config: add your own images for each biome and world X range
type Biome = {
  name: string;
  xStart: number; // inclusive
  xEnd: number;   // exclusive
  imageUrl?: string; // leave undefined for painterly fallback
};

// Example biome config (replace URLs with your own art later)
const BIOMES: Biome[] = [
  { name: "snow", xStart: 0, xEnd: 2500, imageUrl: "/backgrounds/snowy.jpg" },
  { name: "beach", xStart: 2500, xEnd: 5000, imageUrl: undefined },
  { name: "forest", xStart: 5000, xEnd: 7500, imageUrl: undefined },
  { name: "marsh", xStart: 7500, xEnd: 10000, imageUrl: undefined },
];

export function OverworldBackground({ worldSize, mode, view }: { worldSize: number; mode: "day" | "night"; view: { tx: number; ty: number; scale: number } }) {
  // Use the camera X position to pick biome
  const x = (view?.tx ?? 0) + worldSize / 2;
  const biome = BIOMES.find(b => x >= b.xStart && x < b.xEnd) ?? BIOMES[0];
  if (!biome.imageUrl) return null;
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          zIndex: 0,
          backgroundImage: `url(${biome.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: mode === 'night' ? 'brightness(0.7) grayscale(0.15)' : 'brightness(0.95)',
          opacity: 1,
          border: '4px solid red', // debug border
          transition: 'filter 0.4s',
          pointerEvents: 'none',
        }}
        aria-hidden
      />
      {/* Debug overlay: biome and image path */}
      <div
        style={{
          position: 'absolute',
          left: 12,
          top: 12,
          zIndex: 50,
          background: 'rgba(0,0,0,0.6)',
          color: '#fff',
          fontSize: 12,
          padding: '4px 10px',
          borderRadius: 6,
          pointerEvents: 'none',
        }}
      >
        biome: <b>{biome.name}</b><br />
        image: <b>{biome.imageUrl}</b>
      </div>
    </>
  );
}

export default OverworldBackground;
