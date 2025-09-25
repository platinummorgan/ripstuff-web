"use client";

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";

type Props = {
  children: React.ReactNode;
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
  onViewChange?: (view: { scale: number; x: number; y: number }) => void;
  variant?: "cemetery" | "overworld";
  intensity?: "normal" | "high";
};

export type SimplePanZoomHandle = {
  reset: () => void;
};

/**
 * A simplified pan-zoom component focusing on basic functionality.
 */
export const SimplePanZoom = forwardRef<SimplePanZoomHandle, Props>(function SimplePanZoom({ 
  children, 
  minScale = 0.5, 
  maxScale = 3.0, 
  initialScale = 1.0,
  onViewChange,
  variant = "cemetery",
  intensity = "normal"
}: Props, ref) {
  // References to DOM elements
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // State
  const [scale, setScale] = useState(initialScale);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  
  // Initialize view
  useEffect(() => {
    if (isInitialized) return; // Don't reinitialize if already done
    
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;
    
    // Wait a bit for DOM to be ready
    const timeout = setTimeout(() => {
      const viewportRect = viewport.getBoundingClientRect();
      
      // For overworld, use the provided initialScale to fill viewport
      if (variant === "overworld") {
        // For overworld maps, we want the map to completely fill the viewport
        // The scale is calculated to ensure this, so we position at (0,0) to show top-left
        // This ensures no black areas are visible since the map is scaled to cover the entire viewport
        
        setScale(initialScale);
        setPosition({ x: 0, y: 0 });
        setIsInitialized(true);
        
        if (onViewChange) {
          onViewChange({ scale: initialScale, x: 0, y: 0 });
        }
      } else {
        // Original centering logic for cemetery variant
        const contentRect = content.getBoundingClientRect();
        const centerX = (viewportRect.width - contentRect.width * initialScale) / 2;
        const centerY = (viewportRect.height - contentRect.height * initialScale) / 2;
        
        setPosition({ x: centerX, y: centerY });
        setIsInitialized(true); // Mark as initialized
      }
    }, 100);
    
    return () => clearTimeout(timeout);
  }, [initialScale, variant, onViewChange, isInitialized]);

  // Constrain position to ensure map always completely fills viewport
  const constrainPosition = (pos: { x: number; y: number }, currentScale: number) => {
    const viewport = viewportRef.current;
    if (!viewport || variant !== "overworld") return pos;
    
    const viewportRect = viewport.getBoundingClientRect();
    
    // Use known world dimensions for overworld
    const worldSize = 10000;
    const scaledContentWidth = worldSize * currentScale;
    const scaledContentHeight = worldSize * currentScale;
    
    // If content is smaller than viewport, center it (this should not happen with proper min scale)
    if (scaledContentWidth <= viewportRect.width || scaledContentHeight <= viewportRect.height) {
      const centerX = (viewportRect.width - scaledContentWidth) / 2;
      const centerY = (viewportRect.height - scaledContentHeight) / 2;
      return { x: centerX, y: centerY };
    }
    
    // Calculate bounds to ensure viewport is ALWAYS completely covered by map
    // No black background should ever be visible
    const minX = viewportRect.width - scaledContentWidth;  // Rightmost position 
    const minY = viewportRect.height - scaledContentHeight; // Bottommost position
    const maxX = 0;  // Leftmost position
    const maxY = 0;  // Topmost position
    
    return {
      x: Math.min(maxX, Math.max(minX, pos.x)),
      y: Math.min(maxY, Math.max(minY, pos.y))
    };
  };

  // Set up event handlers
  useEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;

    // Handle zooming with mouse wheel
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      // Calculate zoom factor based on wheel delta
      const zoomFactor = 1 - e.deltaY * 0.001;
      const newScale = Math.min(maxScale, Math.max(minScale, scale * zoomFactor));
      
      // Get mouse position relative to the viewport
      const viewportRect = viewport.getBoundingClientRect();
      const mouseX = e.clientX - viewportRect.left;
      const mouseY = e.clientY - viewportRect.top;
      
      // Get the position on the content where the mouse is pointing
      const pointOnContentX = (mouseX - position.x) / scale;
      const pointOnContentY = (mouseY - position.y) / scale;
      
      // Calculate new position to keep the same point under the mouse cursor
      const newPosX = mouseX - pointOnContentX * newScale;
      const newPosY = mouseY - pointOnContentY * newScale;
      
      // Apply constraints to prevent black background from showing
      const constrainedPos = constrainPosition({ x: newPosX, y: newPosY }, newScale);
      
      // Update state
      setScale(newScale);
      setPosition(constrainedPos);
      
      if (onViewChange) {
        onViewChange({ scale: newScale, x: constrainedPos.x, y: constrainedPos.y });
      }
    };
    
    // Handle mouse down for panning
    const handleMouseDown = (e: MouseEvent) => {
      // Skip if clicking on a link or button
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' || target.tagName === 'BUTTON' || 
          target.closest('a') || target.closest('button')) {
        return;
      }
      
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        posX: position.x,
        posY: position.y
      };
    };
    
    // Handle mouse move for panning
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newPosX = dragStartRef.current.posX + (e.clientX - dragStartRef.current.x);
      const newPosY = dragStartRef.current.posY + (e.clientY - dragStartRef.current.y);
      
      // Apply reasonable bounds to prevent map from going completely out of frame
      const constrainedPos = constrainPosition({ x: newPosX, y: newPosY }, scale);
      
      setPosition(constrainedPos);
      
      if (onViewChange) {
        onViewChange({ scale, x: constrainedPos.x, y: constrainedPos.y });
      }
    };
    
    // Handle mouse up to stop panning
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    // Add event listeners
    viewport.addEventListener('wheel', handleWheel, { passive: false });
    viewport.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    // Clean up
    return () => {
      viewport.removeEventListener('wheel', handleWheel);
      viewport.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [scale, position, minScale, maxScale, isDragging, onViewChange]);
  
  // Reset view
  const handleReset = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    
    const viewportRect = viewport.getBoundingClientRect();
    
    if (variant === "overworld") {
      // For overworld, reset to the initial centered view
      const worldSize = 10000;
      const resetScale = initialScale;
      const centerX = (viewportRect.width - worldSize * resetScale) / 2;
      const centerY = (viewportRect.height - worldSize * resetScale) / 2;
      
      setScale(resetScale);
      setPosition({ x: centerX, y: centerY });
      
      if (onViewChange) {
        onViewChange({ scale: resetScale, x: centerX, y: centerY });
      }
    } else {
      // Original cemetery logic
      const content = contentRef.current;
      if (!content) return;
      
      const contentRect = content.getBoundingClientRect();
      const centerX = (viewportRect.width - contentRect.width * minScale) / 2;
      const centerY = (viewportRect.height - contentRect.height * minScale) / 2;
      
      setScale(minScale);
      setPosition({ x: centerX, y: centerY });
      
      if (onViewChange) {
        onViewChange({ scale: minScale, x: centerX, y: centerY });
      }
    }
  };
  
  // Expose reset function via ref
  useImperativeHandle(ref, () => ({
    reset: handleReset
  }));
  
  return (
    <div 
      ref={viewportRef} 
      className="relative h-[85vh] w-full overflow-hidden rounded-3xl border border-[var(--border)] bg-black"
    >
      {/* Background effects */}
      {variant === "cemetery" ? (
        <>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(80,120,80,0.14),transparent_55%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(40,60,50,0.20),rgba(40,60,50,0.20)_16px,rgba(20,30,30,0.12)_16px,rgba(20,30,30,0.12)_64px)]" />
        </>
      ) : (
        <>
          <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: `radial-gradient(1200px_600px_at_50%_-10%,rgba(60,80,180,${intensity==='high'?0.28:0.18}),transparent_75%)` }} />
          <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: `radial-gradient(900px_500px_at_20%_110%,rgba(20,180,140,${intensity==='high'?0.14:0.08}),transparent_70%)` }} />
          <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: `radial-gradient(900px_500px_at_80%_110%,rgba(180,60,160,${intensity==='high'?0.1:0.05}),transparent_70%)` }} />
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage: `radial-gradient(rgba(255,255,255,${intensity==='high'?0.07:0.045})_1px,transparent_1px)`,
              backgroundSize: "3px 3px",
              mixBlendMode: "overlay",
            }}
          />
          <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: `radial-gradient(closest-side,rgba(0,0,0,${intensity==='high'?0.5:0.35}),transparent_60%)` }} />
        </>
      )}
      
      {/* Controls */}
      <div className="absolute right-3 top-3 z-10 flex gap-2">
        <button 
          onClick={handleReset} 
          className="rounded bg-[rgba(255,255,255,0.1)] px-2 py-1 text-xs text-white hover:bg-[rgba(255,255,255,0.2)]"
        >
          Reset
        </button>
        <span className="rounded bg-[rgba(255,255,255,0.08)] px-2 py-1 text-[10px] text-[var(--muted)]">
          Scroll to zoom • Drag to pan
        </span>
      </div>
      
      {/* Content */}
      <div
        ref={contentRef}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          position: 'absolute'
        }}
        className={isDragging ? 'cursor-grabbing' : 'cursor-grab'}
      >
        {children}
      </div>
    </div>
  );
});