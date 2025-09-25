"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { SimplePanZoom, SimplePanZoomHandle } from "./SimplePanZoom2";

type Props = {
  children: React.ReactNode;
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
  onViewChange?: (v: { scale: number; tx: number; ty: number }) => void;
  initialCenter?: { x: number; y: number };
  variant?: "cemetery" | "overworld";
  intensity?: "normal" | "high";
};

export type CemeteryCanvasHandle = {
  centerOn: (pt: { x: number; y: number }, opts?: { scale?: number; animateMs?: number }) => void;
  setView: (v: { scale: number; tx: number; ty: number }) => void;
  fitToBounds: (b: { minX: number; minY: number; maxX: number; maxY: number }, paddingPx?: number, animateMs?: number) => void;
};

/**
 * Cemetery canvas component that provides zoom and pan functionality.
 */
export const CemeteryCanvas = forwardRef<CemeteryCanvasHandle, Props>(function CemeteryCanvas(
  { 
    children, 
    minScale = 0.6, 
    maxScale = 2.5, 
    initialScale = 1, 
    onViewChange, 
    initialCenter, 
    variant = "cemetery", 
    intensity = "normal" 
  }: Props,
  ref
) {
  // Reference to the SimplePanZoom component
  const containerRef = useRef<HTMLDivElement>(null);
  const panZoomRef = useRef<SimplePanZoomHandle>(null);
  
  // Handle view changes 
  const handleViewChange = (view: { scale: number; x: number; y: number }) => {
    if (onViewChange) {
      onViewChange({
        scale: view.scale,
        tx: view.x,
        ty: view.y
      });
    }
  };
  
  // Reset view using the proper ref
  const resetView = () => {
    panZoomRef.current?.reset();
  };
  
  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    centerOn: (pt, opts) => {
      resetView();
    },
    setView: (v) => {
      if (onViewChange) {
        onViewChange(v);
      }
    },
    fitToBounds: () => {
      resetView();
    }
  }));
  
  return (
    <div ref={containerRef}>
      <SimplePanZoom
        ref={panZoomRef}
        minScale={minScale}
        maxScale={maxScale}
        initialScale={initialScale}
        onViewChange={handleViewChange}
        variant={variant}
        intensity={intensity}
      >
        {children}
      </SimplePanZoom>
    </div>
  );
});