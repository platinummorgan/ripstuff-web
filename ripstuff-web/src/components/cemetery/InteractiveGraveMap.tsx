"use client";

import { useState, useEffect, useRef } from "react";
import { getBiomeForCoordinate } from '@/lib/biome-config';
import { getCemeteryBackground } from '@/lib/biome-detector';

interface District {
  x: number;
  y: number;
  graveCount: number;
  samplePhotoUrl: string | null;
}

interface InteractiveGraveMapProps {
  districts: District[];
  gridSize?: number;
  onDistrictClick?: (x: number, y: number) => void;
  initialFocus?: { x: number; y: number } | null;
}

export function InteractiveGraveMap({ 
  districts, 
  gridSize = 16, 
  onDistrictClick,
  initialFocus
}: InteractiveGraveMapProps) {
  const [showGrid, setShowGrid] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [currentGridSize, setCurrentGridSize] = useState(gridSize);
  const [zoomedCell, setZoomedCell] = useState<{ x: number; y: number } | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<{ x: number; y: number; data: any } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [transformOrigin, setTransformOrigin] = useState('50% 50%');
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, startPanX: 0, startPanY: 0 });
  const mapStageRef = useRef<HTMLDivElement>(null);
  
  // Double-click detection state
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isWaitingForDoubleClick, setIsWaitingForDoubleClick] = useState(false);

  // Create a lookup for districts by coordinates
  const districtLookup = districts.reduce((acc, district) => {
    acc[`${district.x}_${district.y}`] = district;
    return acc;
  }, {} as Record<string, District>);

  // Handle initial focus from URL parameters
  useEffect(() => {
    if (initialFocus) {
      const { x, y } = initialFocus;
      // Auto-focus on the specified coordinates (bypass double-click detection for initial focus)
      const percentX = ((x + 0.5) / currentGridSize) * 100;
      const percentY = ((y + 0.5) / currentGridSize) * 100;
      setTransformOrigin(`${percentX}% ${percentY}%`);
      setPanPosition({ x: 0, y: 0 });
      setZoom(2.2);
      setZoomedCell({ x, y });
    }
  }, [initialFocus, currentGridSize]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeout) {
        clearTimeout(clickTimeout);
      }
    };
  }, [clickTimeout]);

  const handleCellClick = (x: number, y: number) => {
    // If we're already waiting for a potential double-click, this is the second click
    if (isWaitingForDoubleClick) {
      // Clear the timeout and handle as double-click
      if (clickTimeout) {
        clearTimeout(clickTimeout);
        setClickTimeout(null);
      }
      setIsWaitingForDoubleClick(false);
      handleCellDoubleClick(x, y);
      return;
    }

    // This is the first click - wait to see if there's a second one
    setIsWaitingForDoubleClick(true);
    const timeout = setTimeout(() => {
      // No second click detected, handle as single click
      setIsWaitingForDoubleClick(false);
      setClickTimeout(null);
      
      // Calculate transform origin for zoom
      const percentX = ((x + 0.5) / currentGridSize) * 100;
      const percentY = ((y + 0.5) / currentGridSize) * 100;
      setTransformOrigin(`${percentX}% ${percentY}%`);
      setPanPosition({ x: 0, y: 0 }); // Reset pan when zooming to a cell
      setZoom(2.2);
      setZoomedCell({ x, y });
    }, 300); // 300ms timeout for double-click detection
    
    setClickTimeout(timeout);
  };

  const handleCellDoubleClick = (x: number, y: number) => {
    // Get district data and open modal on double-click
    const districtData = districtLookup[`${x}_${y}`];
    setSelectedDistrict({ x, y, data: districtData });
  };

  const handleResetZoom = () => {
    setZoom(1);
    setTransformOrigin('50% 50%');
    setPanPosition({ x: 0, y: 0 });
    setZoomedCell(null);
  };

  // Constrain pan position to keep map edges within container bounds
  const constrainPanPosition = (panX: number, panY: number, currentZoom: number) => {
    if (currentZoom <= 1.1) return { x: 0, y: 0 };
    
    if (!mapStageRef.current) return { x: panX, y: panY };
    
    // Get the container dimensions
    const container = mapStageRef.current.parentElement;
    if (!container) return { x: panX, y: panY };
    
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // When scaled, the visible area changes
    // At zoom level 2, we can pan by half the container size before hitting edges
    // At zoom level 4, we can pan by 3/4 of the container size before hitting edges
    const maxPanX = (containerWidth * (currentZoom - 1)) / (2 * currentZoom);
    const maxPanY = (containerHeight * (currentZoom - 1)) / (2 * currentZoom);
    
    // Constrain pan position to prevent going beyond map edges
    const constrainedPanX = Math.max(-maxPanX, Math.min(maxPanX, panX));
    const constrainedPanY = Math.max(-maxPanY, Math.min(maxPanY, panY));
    
    return { x: constrainedPanX, y: constrainedPanY };
  };

  // Helper function to set constrained pan position
  const setConstrainedPanPosition = (panX: number, panY: number) => {
    const constrained = constrainPanPosition(panX, panY, zoom);
    setPanPosition(constrained);
  };

  // Mouse event handlers for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1.1) return; // Only allow panning when zoomed in
    
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      startPanX: panPosition.x,
      startPanY: panPosition.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1.1) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    const newPanX = dragStart.startPanX + deltaX;
    const newPanY = dragStart.startPanY + deltaY;
    
    // Apply constraints to prevent dragging edges past container
    setConstrainedPanPosition(newPanX, newPanY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const renderGrid = () => {
    const cells = [];
    for (let y = 0; y < currentGridSize; y++) {
      for (let x = 0; x < currentGridSize; x++) {
        const districtData = districtLookup[`${x}_${y}`];
        const hasGraves = districtData && districtData.graveCount > 0;
        
        cells.push(
          <button
            key={`${x}-${y}`}
            className={`relative bg-transparent border-0 p-0 cursor-pointer outline-none group
              after:content-[''] after:absolute after:inset-0 after:border after:border-[rgba(255,255,255,0.06)]
              hover:after:border-[rgba(154,230,180,0.55)] hover:after:shadow-[inset_0_0_0_1px_rgba(154,230,180,0.35)]
              focus-visible:after:border-[var(--accent)] focus-visible:after:shadow-[inset_0_0_0_2px_var(--accent)]
              ${hasGraves ? 'after:bg-[rgba(154,230,180,0.1)]' : ''}
            `}
            onClick={() => handleCellClick(x, y)}
            aria-label={`District ${x},${y}${hasGraves ? ` (${districtData.graveCount} graves)` : ''}`}
          >
            {showLabels && (
              <span className="absolute left-1.5 bottom-1.5 text-[11px] opacity-65 bg-[rgba(0,0,0,0.35)] px-1.5 py-0.5 rounded-md">
                {x},{y}
              </span>
            )}
            {hasGraves && (
              <span className="absolute right-1 top-1 text-[10px] bg-[rgba(154,230,180,0.2)] text-[var(--accent)] px-1 py-0.5 rounded">
                {districtData.graveCount}
              </span>
            )}
          </button>
        );
      }
    }
    return cells;
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      {/* Title and Description */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-1 tracking-wide">
          Virtual Graveyard — Interactive Map
        </h2>
        <p className="text-[var(--muted)] text-sm">
          <strong>Single click</strong> to zoom into a district. <strong>Double click</strong> to view graves in that district. Squares with graves are highlighted.
        </p>
      </div>

      {/* Map Stage */}
      <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.45),inset_0_0_0_1px_rgba(255,255,255,0.08)] bg-[#0c1428]">
        <div
          ref={mapStageRef}
          className="w-full h-full relative"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            cursor: zoom > 1.1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
            overflow: 'hidden',
            transition: isDragging ? 'none' : 'transform 380ms cubic-bezier(0.4,0,0.2,1)',
            transform: zoom === 1 
              ? 'scale(1)' 
              : (() => {
                  // Apply constraints in render to ensure we never exceed bounds
                  const constrainedPos = constrainPanPosition(panPosition.x, panPosition.y, zoom);
                  return `scale(${zoom}) translate(${constrainedPos.x / zoom}px, ${constrainedPos.y / zoom}px)`;
                })(),
            transformOrigin: transformOrigin,
            willChange: 'transform',
          }}
        >
          {/* Base Map Image */}
          <img
            src="/backgrounds/fantasy_world_1.jpeg"
            alt="Overworld map"
            className="w-full h-full select-none pointer-events-none"
            style={{ 
              imageRendering: 'auto', 
              objectFit: 'fill',
              display: 'block'
            }}
            draggable={false}
          />
          {/* Grid Overlay */}
          {showGrid && (
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                zIndex: 2,
                pointerEvents: 'none',
              }}
            >
              {Array.from({ length: currentGridSize }, (_, y) => 
                Array.from({ length: currentGridSize }, (_, x) => {
                  const districtData = districtLookup[`${x}_${y}`];
                  const hasGraves = districtData && districtData.graveCount > 0;
                  
                  return (
                    <button
                      key={`${x}-${y}`}
                      className={`absolute cursor-pointer outline-none group
                        border border-[rgba(255,255,255,0.06)]
                        hover:border-[rgba(154,230,180,0.55)] hover:shadow-[inset_0_0_0_1px_rgba(154,230,180,0.35)]
                        focus-visible:border-[var(--accent)] focus-visible:shadow-[inset_0_0_0_2px_var(--accent)]
                        ${hasGraves ? 'bg-[rgba(255,215,0,0.3)] border-yellow-400' : 'bg-transparent'}
                      `}
                      style={{
                        left: `${(x / currentGridSize) * 100}%`,
                        top: `${(y / currentGridSize) * 100}%`,
                        width: `${(1 / currentGridSize) * 100}%`,
                        height: `${(1 / currentGridSize) * 100}%`,
                        pointerEvents: 'auto',
                      }}
                      onClick={() => handleCellClick(x, y)}
                    >
                      {showLabels && (
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white/80 font-mono select-none pointer-events-none">
                          {x},{y}
                        </span>
                      )}
                      {hasGraves && (
                        <>
                          {/* Smaller, proportional tombstone icon */}
                          <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none">
                            <div className="relative">
                              {/* Tombstone background */}
                              <div className="w-3 h-4 bg-white border border-black rounded-sm shadow-md relative">
                                {/* Cross */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-1.5 h-0.5 bg-black absolute"></div>
                                  <div className="w-0.5 h-2 bg-black absolute"></div>
                                </div>
                              </div>
                              {/* Smaller grave count badge */}
                              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 border border-white rounded-full flex items-center justify-center text-[8px] font-bold text-white shadow-md">
                                {districtData.graveCount}
                              </div>
                            </div>
                          </div>
                          {/* Subtle glow effect */}
                          <div className="absolute inset-0 bg-yellow-400 opacity-15 rounded pointer-events-none"></div>
                        </>
                      )}
                    </button>
                  );
                })
              ).flat()}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 flex-wrap items-center">
        <button
          className="bg-[#111a30] text-[var(--foreground)] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 cursor-pointer hover:bg-[#152041] text-sm"
          onClick={() => setShowGrid(!showGrid)}
        >
          {showGrid ? 'Hide Grid' : 'Show Grid'}
        </button>
        
        <label className="text-sm text-[var(--muted)]">Zoom:</label>
        <input
          type="range"
          min="1"
          max="4"
          step="0.1"
          value={zoom}
          onChange={(e) => {
            const newZoom = Number(e.target.value);
            setZoom(newZoom);
            if (newZoom === 1) {
              setTransformOrigin('50% 50%');
              setPanPosition({ x: 0, y: 0 });
              setZoomedCell(null);
            } else {
              // When manually zooming, constrain current pan position to new zoom level
              const constrainedPosition = constrainPanPosition(panPosition.x, panPosition.y, newZoom);
              setPanPosition(constrainedPosition);
            }
          }}
          className="w-48 accent-[var(--accent)]"
        />
        
        <button
          className="bg-[#111a30] text-[var(--foreground)] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 cursor-pointer hover:bg-[#152041] text-sm"
          onClick={() => setShowLabels(!showLabels)}
        >
          {showLabels ? 'Hide Labels' : 'Show Labels'}
        </button>
        
        <button
          className="bg-[#111a30] text-[var(--foreground)] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 cursor-pointer hover:bg-[#152041] text-sm"
          onClick={handleResetZoom}
        >
          Reset Zoom
        </button>

        <div className="flex-1" />
        
        <span className="text-xs text-[var(--muted)]">
          {districts.reduce((sum, d) => sum + d.graveCount, 0)} total graves across {districts.filter(d => d.graveCount > 0).length} districts
        </span>
      </div>

      {/* District Modal */}
      {selectedDistrict && (
        <DistrictModal
          district={selectedDistrict}
          onClose={() => setSelectedDistrict(null)}
        />
      )}
    </div>
  );
}

interface DistrictModalProps {
  district: { x: number; y: number; data: District | undefined };
  onClose: () => void;
}

function DistrictModal({ district, onClose }: DistrictModalProps) {
  const { x, y, data } = district;
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-[#0B1123] border border-[rgba(255,255,255,0.08)] rounded-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 p-3 border-b border-[rgba(255,255,255,0.08)]">
          <div>
            <h3 className="text-lg">District {x}, {y}</h3>
            <p className="text-sm text-[var(--muted)] capitalize">
              {getBiomeForCoordinate(x, y)} Graveyard
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <button className="hover:bg-[rgba(255,255,255,0.05)] text-[var(--foreground)] rounded px-2 py-1 cursor-pointer text-sm">
              Share
            </button>
            <button 
              className="hover:bg-[rgba(255,255,255,0.05)] text-[var(--foreground)] rounded px-2 py-1 cursor-pointer"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-[#0b1428]">
            <DistrictGraveView x={x} y={y} graveCount={data?.graveCount || 0} />
          </div>
          
          <div className="mt-3 flex justify-between items-center text-[var(--muted)] text-sm">
            <span>Seed: {(x * 73856093 ^ y * 19349663) >>> 0}</span>
            {data && data.graveCount > 0 && (
              <span>{data.graveCount} tombstone{data.graveCount !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface DistrictGraveViewProps {
  x: number;
  y: number;
  graveCount: number;
}

function DistrictGraveView({ x, y, graveCount }: DistrictGraveViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [graves, setGraves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Get biome information for this coordinate
  const biome = getBiomeForCoordinate(x, y);
  const backgroundImage = getCemeteryBackground(biome as any);
  
  // Biome system working! Console logs removed for production

  useEffect(() => {
    async function fetchGraves() {
      try {
        const response = await fetch(`/api/map/districts/${x}/${y}`);
        if (response.ok) {
          const data = await response.json();
          setGraves(data.graves || []);
        }
      } catch (error) {
        console.warn(`Failed to fetch graves for district ${x},${y}:`, error);
      } finally {
        setLoading(false);
      }
    }

    fetchGraves();
  }, [x, y]);

  // Tombstone asset selection function
  const getRandomTombstone = (graveId: string): string => {
    // Available tombstone assets (crosses and headstones)
    const tombstoneAssets = [
      'cross_1.jpeg',
      'cross_2.jpeg', 
      'cross_3.jpeg',
      'cross_4.jpeg',
      'headstone_1.jpeg',
      'headstone_2.jpeg',
      'headstone_3.jpeg',
      'headstone_4.jpeg'
    ];
    
    // Use grave ID to seed randomization for consistent tombstone per grave
    let seed = 0;
    for (let i = 0; i < graveId.length; i++) {
      seed += graveId.charCodeAt(i);
    }
    
    const tombstoneIndex = seed % tombstoneAssets.length;
    const selectedAsset = tombstoneAssets[tombstoneIndex];
    
    // Temporary: Force alternating between crosses and headstones for testing
    const isEven = seed % 2 === 0;
    const testAsset = isEven ? tombstoneAssets[4 + (seed % 4)] : tombstoneAssets[seed % 4]; // Force headstones vs crosses
    
    return `/backgrounds/${testAsset}`;
  };

  useEffect(() => {
    if (loading) return;
    
    // 3D Perspective Tombstone System
    const containerElement = svgRef.current?.parentElement;
    if (!containerElement) return;

    // Clear any existing tombstone overlays
    const existingTombstones = containerElement.querySelectorAll('.perspective-tombstone');
    existingTombstones.forEach(tomb => tomb.remove());

    // Seeded random number generator for consistent layouts
    let seed = (x * 73856093 ^ y * 19349663) >>> 0;
    const rand = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };

    // Generate tombstones based on actual graves
    const displayGraves = graves.slice(0, 50); // Cap display at 50 tombstones for performance
    
    // 3D Perspective placement system
    displayGraves.forEach((grave, index) => {
      // Random placement keeping tombstones on ground plane only
      const tx = rand() * 85 + 7.5; // X: 7.5% to 92.5% (avoid edges)
      const ty = rand() * 50 + 40;  // Y: 40% to 90% (ground plane only, avoid horizon)
      
      // Calculate depth-based scale (further = smaller)
      // Objects higher in image (lower ty value) appear further away
      // Normalize depth within ground plane range (40% to 90%)
      const depthFactor = (90 - ty) / 50; // 0 to 1.0 within ground plane
      const scale = 1.0 - (depthFactor * 0.5); // Scale from 1.0 (closest) to 0.5 (furthest)
      
      // Create perspective tombstone element
      const tombstoneEl = document.createElement('div');
      tombstoneEl.className = 'perspective-tombstone';
      tombstoneEl.style.position = 'absolute';
      tombstoneEl.style.left = `${tx}%`;
      tombstoneEl.style.top = `${ty}%`;
      tombstoneEl.style.transform = `translate(-50%, -50%) scale(${scale})`;
      tombstoneEl.style.zIndex = String(Math.floor(ty * 10)); // Higher Y = higher z-index (closer)
      tombstoneEl.style.cursor = 'pointer';
      tombstoneEl.style.transition = 'transform 0.2s ease';
      
      // Create the tombstone image
      const tombImg = document.createElement('img');
      tombImg.src = getRandomTombstone(grave.id);
      tombImg.alt = grave.title;
      tombImg.style.width = '40px'; // Base size - will be scaled by perspective
      tombImg.style.height = 'auto';
      tombImg.style.filter = `brightness(${0.8 + (scale * 0.4)})`; // Darker = further away
      tombImg.style.opacity = String(0.7 + (scale * 0.3)); // More transparent = further away
      
      // Add hover effects
      tombstoneEl.addEventListener('mouseenter', () => {
        tombstoneEl.style.transform = `translate(-50%, -50%) scale(${scale * 1.1})`;
        tombImg.style.filter = 'brightness(1.2) drop-shadow(0 0 10px rgba(255,255,255,0.8))';
      });
      
      tombstoneEl.addEventListener('mouseleave', () => {
        tombstoneEl.style.transform = `translate(-50%, -50%) scale(${scale})`;
        tombImg.style.filter = `brightness(${0.8 + (scale * 0.4)})`;
      });

      // Add click handler to navigate to grave
      tombstoneEl.addEventListener('click', () => {
        window.open(`/grave/${grave.slug}`, '_blank');
      });

      // Add tooltip
      tombstoneEl.title = grave.title;
      
      tombstoneEl.appendChild(tombImg);
      containerElement.appendChild(tombstoneEl);
    });
  }, [x, y, graveCount, graves, loading]);

  if (loading) {
    return (
      <div 
        className="flex items-center justify-center h-full relative rounded-lg overflow-hidden"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--accent)]"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      {/* Biome Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundColor: '#1a1a2e', // Subtle dark fallback
          filter: 'brightness(0.9) contrast(1.05)', // Restored subtle filters
          minHeight: '100%'
        }}
      />
      
      {/* Debug removed - biome backgrounds working! */}
      
      {/* Semi-transparent overlay for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30" />
      
      {/* Biome Info Badge */}
      <div className="absolute top-3 left-3 z-10 px-3 py-1 bg-black/60 text-white text-xs rounded-full backdrop-blur-sm border border-white/20">
        📍 {biome.charAt(0).toUpperCase() + biome.slice(1)} Graveyard ({x},{y})
      </div>
      
      {/* No graves message */}
      {graves.length === 0 && !loading && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center text-white bg-black/60 rounded-lg px-6 py-4 backdrop-blur-sm border border-white/20">
            <p className="text-lg mb-2">No graves in this district yet</p>
            <p className="text-sm opacity-80">Be the first to bury something here!</p>
          </div>
        </div>
      )}
      
      {/* SVG Overlay for tombstones */}
      <svg
        ref={svgRef}
        viewBox="0 0 1000 625"
        width="100%"
        height="100%"
        className="absolute inset-0 w-full h-full"
        style={{ background: 'transparent' }}
      />
    </div>
  );
}