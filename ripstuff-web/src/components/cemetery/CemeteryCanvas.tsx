"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { SimplePanZoom } from "./SimplePanZoom";

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
 * Uses SimplePanZoom internally for the core functionality.
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
  // Reference to the SimplePanZoom component's container
  const panZoomContainerRef = useRef<HTMLDivElement>(null);
  
  // View state for external references
  const [scale, setScale] = useState(initialScale);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  // Handle view changes from SimplePanZoom
  const handleViewChange = (view: { scale: number; x: number; y: number }) => {
    setScale(view.scale);
    setPosition({ x: view.x, y: view.y });
    
    if (onViewChange) {
      onViewChange({
        scale: view.scale,
        tx: view.x,
        ty: view.y
      });
    }
  };
  
  // Find the reset button in the SimplePanZoom component
  const triggerReset = () => {
    if (!panZoomContainerRef.current) return;
    const resetButton = panZoomContainerRef.current.querySelector('button');
    if (resetButton) {
      resetButton.click();
    }
  };
  
  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    centerOn: (pt, opts) => {
      triggerReset();
    },
    setView: (v) => {
      if (onViewChange) {
        onViewChange(v);
      }
    },
    fitToBounds: (b, paddingPx = 40, animateMs = 0) => {
      triggerReset();
    },
  }));
  
  return (
    <div ref={panZoomContainerRef}>
      <SimplePanZoom
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
