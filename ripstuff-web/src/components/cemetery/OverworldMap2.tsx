"use client";
import { useState, useEffect } from "react";
import { CemeteryCanvas } from "./CemeteryCanvas2";
import TombstoneIcon from "./icons/TombstoneIcon";

type Item = {
  id?: string;
  name?: string;
  description?: string;
  yardId?: string;
  count?: number;
  samplePhotoUrl?: string | null;
};

export function OverworldMap({ items, focusYardId, intensity = "normal" }: { 
  items: Item[];
  focusYardId?: string;
  intensity?: "normal" | "high";
}) {
  const [view, setView] = useState<{ scale: number; tx: number; ty: number }>({ scale: 1, tx: 0, ty: 0 });
  const worldSize = 10000;
  // Zelda-style overworld: 3x3 regions, each region is a tile grid
  const regionsX = 3;
  const regionsY = 3;
  const regionW = worldSize / regionsX;
  const regionH = worldSize / regionsY;
  const tilesPerRegion = 8;
  const tileW = regionW / tilesPerRegion;
  const tileH = regionH / tilesPerRegion;

  // Placeholder: assign each item to a random tile in a random region
  const placedItems = (items ?? []).map((item, i) => {
    const regionCol = Math.floor(i % (regionsX * regionsY) / regionsY);
    const regionRow = i % regionsY;
    const tileCol = Math.floor(Math.random() * tilesPerRegion);
    const tileRow = Math.floor(Math.random() * tilesPerRegion);
    const x = regionCol * regionW + tileCol * tileW + tileW / 2;
    const y = regionRow * regionH + tileRow * tileH + tileH / 2;
    return { ...item, x, y };
  });

  // Map rendering and scaling state
  const [initialScale, setInitialScale] = useState(0.1);
  const [minScale, setMinScale] = useState(0.1);
  const [initialCenter, setInitialCenter] = useState<{ x: number; y: number }>({ x: worldSize / 2, y: worldSize / 2 });
  const [mapReady, setMapReady] = useState(false);
  
  // Fix for ensuring the map fills the viewport
  useEffect(() => {
    // Wait for DOM to be ready
    const timeout = setTimeout(() => {
      function fitMapToViewport() {
        const canvas = document.querySelector('.overflow-hidden.rounded-3xl');
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        // Make sure we have dimensions
        if (rect.width <= 10 || rect.height <= 10) return;
        
        // Calculate the scale needed for perfect fit in both dimensions
        const scaleX = rect.width / worldSize;
        const scaleY = rect.height / worldSize;
        
        // Using the LARGER scale ensures the map completely fills the viewport
        // with no black edges at minimum zoom
        const minScaleValue = Math.max(scaleX, scaleY) * 1.01; // slight buffer
        
        // Initial scale slightly larger to ensure full coverage
        const initialScaleValue = minScaleValue;
        
        // Update state with calculated values
        setInitialScale(initialScaleValue);
        setMinScale(minScaleValue);
        setInitialCenter({ x: worldSize / 2, y: worldSize / 2 });
        setMapReady(true);
        
        console.log(`Display box: ${rect.width}x${rect.height}, Scale: ${initialScaleValue}`);
      }
      
      fitMapToViewport();
      window.addEventListener('resize', fitMapToViewport);
      return () => window.removeEventListener('resize', fitMapToViewport);
    }, 300); // Longer delay to ensure DOM is fully ready
    
    return () => clearTimeout(timeout);
  }, []);

  return (
    <CemeteryCanvas
      onViewChange={setView}
      minScale={minScale}
      initialScale={initialScale}
      initialCenter={initialCenter}
      variant="overworld"
      intensity={intensity}
      maxScale={3.0}
    >
      <div
        className="relative"
        style={{
          width: `${worldSize}px`,
          height: `${worldSize}px`,
          boxSizing: 'border-box',
          transformOrigin: 'center center',
          position: 'relative',
        }}
      >
        {/* Full-size background image that fills the entire container */}
        {/* Background image container */}
        <div 
          className="absolute inset-0" 
          style={{
            width: '100%',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          {/* The actual background image - set as img for more reliable sizing */}
          <img
            src="/backgrounds/fantasy_world_1.jpeg"
            alt="Map background"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              pointerEvents: 'none', // Prevents image from interfering with interactions
            }}
          />
        </div>
      
        {/* Draw region boundaries - now on top of the background */}
        {[...Array(regionsX + 1)].map((_, rx) =>
          <div key={rx} className="absolute" style={{
            left: rx * regionW,
            top: 0,
            width: 2,
            height: worldSize,
            background: '#4a5a2c',
            opacity: 0.7,
            zIndex: 10
          }} />
        )}
        {[...Array(regionsY + 1)].map((_, ry) =>
          <div key={ry} className="absolute" style={{
            left: 0,
            top: ry * regionH,
            width: worldSize,
            height: 2,
            background: '#4a5a2c',
            opacity: 0.7,
            zIndex: 10
          }} />
        )}
        
        {/* Draw tiles (optional, for debug/visual) - now with better visibility */}
        {[...Array(regionsX * regionsY * tilesPerRegion * tilesPerRegion)].map((_, idx) => {
          const regionCol = Math.floor(idx / (tilesPerRegion * tilesPerRegion * regionsY));
          const regionRow = Math.floor(idx / (tilesPerRegion * tilesPerRegion)) % regionsY;
          const tileIdx = idx % (tilesPerRegion * tilesPerRegion);
          const tileCol = tileIdx % tilesPerRegion;
          const tileRow = Math.floor(tileIdx / tilesPerRegion);
          const x = regionCol * regionW + tileCol * tileW;
          const y = regionRow * regionH + tileRow * tileH;
          return (
            <div key={idx} className="absolute border border-green-200" style={{
              left: x,
              top: y,
              width: tileW,
              height: tileH,
              opacity: 0.25,
              zIndex: 5
            }} />
          );
        })}
        
        {/* Render tombstones at placed locations */}
        {placedItems.map((item, index) => {
          // Handle both item types (id-based and yardId-based)
          const id = item.id || item.yardId;
          const name = item.name || (item.count ? `${item.count} items` : 'Cemetery');
          
          if (!id) return null;
          
          return (
            <div
              key={id}
              className={`absolute -translate-x-1/2 -translate-y-1/2 ${
                focusYardId === item.yardId ? 'scale-125' : ''
              }`}
              style={{ 
                left: item.x, 
                top: item.y, 
                zIndex: focusYardId === item.yardId ? 30 : 20
              }}
            >
              <a
                href={item.id ? `/grave/${item.id}` : `/yard/${item.yardId}`}
                className="block text-center"
                style={{
                  pointerEvents: 'auto',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  padding: '5px'
                }}
                title={name}
              >
                <TombstoneIcon size={48} />
                <div className="mt-1 text-center text-xs bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                  {name}
                </div>
              </a>
            </div>
          );
        })}
      </div>
    </CemeteryCanvas>
  );
}