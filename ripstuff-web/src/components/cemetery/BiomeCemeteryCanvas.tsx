"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { SimplePanZoom } from "./SimplePanZoom";
import { getBiomeForCoordinate } from "@/lib/biome-config";
import { getCemeteryBackground } from "@/lib/biome-detector";

type Props = {
  children: React.ReactNode;
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
  onViewChange?: (v: { scale: number; tx: number; ty: number }) => void;
  initialCenter?: { x: number; y: number };
  variant?: "cemetery" | "overworld";
  intensity?: "normal" | "high";
  // New biome-specific props
  coordinateX?: number;
  coordinateY?: number;
  forceBiome?: string; // Override biome detection
};

export type BiomeCemeteryCanvasHandle = {
  centerOn: (pt: { x: number; y: number }, opts?: { scale?: number; animateMs?: number }) => void;
  setView: (v: { scale: number; tx: number; ty: number }) => void;
  fitToBounds: (b: { minX: number; minY: number; maxX: number; maxY: number }, paddingPx?: number, animateMs?: number) => void;
};

/**
 * Biome-aware cemetery canvas component that provides zoom and pan functionality
 * with biome-specific backgrounds based on coordinates.
 */
export const BiomeCemeteryCanvas = forwardRef<BiomeCemeteryCanvasHandle, Props>(function BiomeCemeteryCanvas(
  { 
    children, 
    minScale = 0.6, 
    maxScale = 2.5, 
    initialScale = 1.0, 
    onViewChange,
    initialCenter,
    variant = "cemetery",
    intensity = "normal",
    coordinateX = 8,
    coordinateY = 8,
    forceBiome
  }: Props, 
  ref
) {
  const panZoomContainerRef = useRef<HTMLDivElement>(null);

  // Find the reset button in the SimplePanZoom component (similar to CemeteryCanvas)
  const triggerReset = () => {
    if (!panZoomContainerRef.current) return;
    const resetButton = panZoomContainerRef.current.querySelector('button');
    if (resetButton) {
      resetButton.click();
    }
  };

  useImperativeHandle(ref, () => ({
    centerOn: (pt: { x: number; y: number }, opts?: { scale?: number; animateMs?: number }) => {
      triggerReset();
    },
    setView: (v: { scale: number; tx: number; ty: number }) => {
      triggerReset();
    },
    fitToBounds: (b: { minX: number; minY: number; maxX: number; maxY: number }, paddingPx?: number, animateMs?: number) => {
      triggerReset();
    },
  }), []);

  // Determine the biome for this coordinate
  const biome = forceBiome || getBiomeForCoordinate(coordinateX, coordinateY);
  const backgroundImage = getCemeteryBackground(biome as any);

  // Biome-specific styling
  const getBiomeStyles = () => {
    const baseStyles = {
      filter: intensity === "high" ? "contrast(1.1) saturate(1.2)" : "none",
    };

    switch (biome) {
      case 'snow':
        return {
          ...baseStyles,
          filter: `${baseStyles.filter} brightness(1.1) hue-rotate(-10deg)`,
        };
      case 'water':
      case 'deepblue':
      case 'coastal':
      case 'underwater':
        return {
          ...baseStyles,
          filter: `${baseStyles.filter} hue-rotate(10deg) saturate(1.3)`,
        };
      case 'desert':
        return {
          ...baseStyles,
          filter: `${baseStyles.filter} sepia(0.2) saturate(1.1)`,
        };
      case 'forest':
        return {
          ...baseStyles,
          filter: `${baseStyles.filter} hue-rotate(5deg) saturate(1.2)`,
        };
      default:
        return baseStyles;
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl bg-[var(--bg-secondary)]">
      {/* Biome Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          opacity: 0.7,
          ...getBiomeStyles()
        }}
      />
      
      {/* Overlay for better contrast */}
      <div 
        className="absolute inset-0"
        style={{
          background: variant === "overworld" 
            ? "linear-gradient(45deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 100%)"
            : "linear-gradient(135deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 100%)",
        }}
      />

      {/* Pan/Zoom Container */}
      <div ref={panZoomContainerRef}>
        <SimplePanZoom
          minScale={minScale}
          maxScale={maxScale}
          initialScale={initialScale}
          onViewChange={onViewChange ? (view) => onViewChange({ scale: view.scale, tx: view.x, ty: view.y }) : undefined}
          variant={variant}
          intensity={intensity}
        >
          <div className="relative">
            {/* Biome Info Badge */}
            <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black/50 text-white text-sm rounded-full backdrop-blur-sm">
              📍 {biome.charAt(0).toUpperCase() + biome.slice(1)} ({coordinateX},{coordinateY})
            </div>
            
            {children}
          </div>
        </SimplePanZoom>
      </div>
    </div>
  );
});