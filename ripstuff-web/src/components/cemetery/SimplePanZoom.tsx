"use client";

import { useEffect, useRef, useState, forwardRef } from "react";

type Props = {
  children: React.ReactNode;
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
  onViewChange?: (view: { scale: number; x: number; y: number }) => void;
  variant?: "cemetery" | "overworld";
  intensity?: "normal" | "high";
};

/**
 * A simple pan-zoom component that renders content with mouse-based zoom/pan.
 * Key features:
 * 1. Prevents black space at edges by properly enforcing boundaries
 * 2. Zooms precisely toward cursor position for intuitive navigation
 * 3. Centers content when at minimum zoom level
 * 4. Maintains proper aspect ratios and fills viewport
 * 5. Handles window resizing gracefully
 */
export function SimplePanZoom({ 
  children, 
  minScale = 0.5, 
  maxScale = 3.0, 
  initialScale = 1.0,
  onViewChange,
  variant = "cemetery",
  intensity = "normal"
}: Props) {
  // Viewport is the container, content is what we're transforming
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Transform state
  const [scale, setScale] = useState(initialScale);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  
  // Handle zooming with mouse wheel
  useEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;
    
    // Detect dimensions and center the content when needed
    const updateDimensions = () => {
      if (!viewport || !content) return;
      
      // At minimum scale, center the content
      if (Math.abs(scale - minScale) < 0.01) {
        const viewportRect = viewport.getBoundingClientRect();
        const contentRect = content.getBoundingClientRect();
        
        // Calculate actual content dimensions at min scale
        const scaledWidth = contentRect.width / scale * minScale;
        const scaledHeight = contentRect.height / scale * minScale;
        
        // Calculate center position - ensures content fills the viewport with no black space
        // Use Math.min to ensure content is at least as large as viewport
        const centerX = (viewportRect.width - Math.min(viewportRect.width, scaledWidth)) / 2;
        const centerY = (viewportRect.height - Math.min(viewportRect.height, scaledHeight)) / 2;
        
        setPosition({ x: centerX, y: centerY });
      }
    };
    
    // Wheel handler for zooming - critical for zoom-to-cursor behavior
    const handleWheel = (e: WheelEvent) => {
      // Prevent the page from scrolling when using wheel over the map
      e.preventDefault();
      
      if (!viewport || !content) return;
      
      const viewportRect = viewport.getBoundingClientRect();
      
      // Get mouse position relative to viewport
      const mouseX = e.clientX - viewportRect.left;
      const mouseY = e.clientY - viewportRect.top;
      
      // Get current content position
      const contentX = position.x;
      const contentY = position.y;
      
      // Calculate point on the content under mouse before zoom
      const pointXBeforeZoom = (mouseX - contentX) / scale;
      const pointYBeforeZoom = (mouseY - contentY) / scale;
      
      // Calculate new scale with fine-tuned zoom intensity
      const zoomIntensity = 0.0008; // Fine-tuned for smoother zooming
      const delta = -e.deltaY;
      const newScale = Math.min(maxScale, Math.max(minScale, scale * (1 + delta * zoomIntensity)));
      
      // If we're at minimum scale, center the content
      if (Math.abs(newScale - minScale) < 0.01) {
        const contentRect = content.getBoundingClientRect();
        // Calculate dimensions at minimum scale
        const scaledWidth = contentRect.width / scale * minScale;
        const scaledHeight = contentRect.height / scale * minScale;
        
        // Center position - ensure we fill the viewport
        const centerX = (viewportRect.width - Math.min(viewportRect.width, scaledWidth)) / 2;
        const centerY = (viewportRect.height - Math.min(viewportRect.height, scaledHeight)) / 2;
        
        setScale(minScale);
        setPosition({ x: centerX, y: centerY });
        
        if (onViewChange) {
          onViewChange({
            scale: minScale,
            x: centerX,
            y: centerY
          });
        }
        return;
      }
      
      // Calculate where the point should be after zoom - this is what makes zoom focus on cursor
      const newX = mouseX - pointXBeforeZoom * newScale;
      const newY = mouseY - pointYBeforeZoom * newScale;
      
      // Apply boundary checks
      const contentRect = content.getBoundingClientRect();
      // Calculate new dimensions
      const newWidth = contentRect.width / scale * newScale;
      const newHeight = contentRect.height / scale * newScale;
      
      // Prevent black space by clamping position
      let clampedX = newX;
      let clampedY = newY;
      
      // Prevent black space on right edge
      if (clampedX > 0) clampedX = 0;
      
      // Prevent black space on left edge
      const minX = Math.min(0, viewportRect.width - newWidth);
      if (clampedX < minX) clampedX = minX;
      
      // Prevent black space on bottom edge
      if (clampedY > 0) clampedY = 0;
      
      // Prevent black space on top edge
      const minY = Math.min(0, viewportRect.height - newHeight);
      if (clampedY < minY) clampedY = minY;
      
      // Update state
      setScale(newScale);
      setPosition({ x: clampedX, y: clampedY });
      
      if (onViewChange) {
        onViewChange({
          scale: newScale,
          x: clampedX,
          y: clampedY
        });
      }
    };
    
    // Mouse down handler for panning
    const handleMouseDown = (e: MouseEvent) => {
      // Don't pan if we're at minimum zoom
      if (Math.abs(scale - minScale) < 0.01) return;
      
      // Only handle left button clicks for panning
      if (e.button !== 0) return;
      
      // Get the actual target element
      const target = e.target as HTMLElement;
      
      // Check if the click is on a link or within a link - allow it to work normally
      if (target.tagName.toLowerCase() === 'a' || 
          target.closest('a') || 
          target.closest('[data-ui]') || 
          target.closest('button')) {
        // Don't interfere with clickable elements
        return;
      }
      
      // For all other elements, enable dragging
      e.preventDefault();
      e.stopPropagation();
      
      setIsDragging(true);
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        posX: position.x,
        posY: position.y
      };
    };
    
    // Mouse move handler for panning
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      // Prevent text selection during dragging
      e.preventDefault();
      
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      
      const newX = dragStart.current.posX + dx;
      const newY = dragStart.current.posY + dy;
      
      // Apply position, respecting bounds
      applyBoundedPosition(newX, newY);
    };
    
    // Function to apply position while respecting boundaries - critical for preventing black space
    const applyBoundedPosition = (x: number, y: number) => {
      if (!viewport || !content) return;
      
      const viewportRect = viewport.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();
      
      // Calculate content dimensions after scaling
      const scaledWidth = contentRect.width / scale * scale;
      const scaledHeight = contentRect.height / scale * scale;
      
      // Special case for minimum scale - always center perfectly
      if (Math.abs(scale - minScale) < 0.01) {
        // At minimum scale, content should be centered
        const centerX = (viewportRect.width - Math.min(viewportRect.width, scaledWidth)) / 2;
        const centerY = (viewportRect.height - Math.min(viewportRect.height, scaledHeight)) / 2;
        
        setPosition({ x: centerX, y: centerY });
        
        if (onViewChange) {
          onViewChange({
            scale: scale,
            x: centerX,
            y: centerY
          });
        }
        return;
      }
      
      // Regular boundary enforcement for non-minimum scale
      let boundedX = x;
      let boundedY = y;
      
      // For X axis (horizontal)
      if (scaledWidth <= viewportRect.width) {
        // If content is smaller than viewport, center it
        boundedX = (viewportRect.width - scaledWidth) / 2;
      } else {
        // Otherwise, prevent black space on edges
        if (boundedX > 0) boundedX = 0; // Left edge
        
        // Right edge - use Math.min to handle edge cases correctly
        const minX = Math.min(0, viewportRect.width - scaledWidth);
        if (boundedX < minX) boundedX = minX;
      }
      
      // For Y axis (vertical)
      if (scaledHeight <= viewportRect.height) {
        // If content is smaller than viewport, center it
        boundedY = (viewportRect.height - scaledHeight) / 2;
      } else {
        // Otherwise, prevent black space on edges
        if (boundedY > 0) boundedY = 0; // Top edge
        
        // Bottom edge - use Math.min to handle edge cases correctly
        const minY = Math.min(0, viewportRect.height - scaledHeight);
        if (boundedY < minY) boundedY = minY;
      }
      
      setPosition({ x: boundedX, y: boundedY });
      
      if (onViewChange) {
        onViewChange({
          scale: scale,
          x: boundedX,
          y: boundedY
        });
      }
    };
    
    // Mouse up handler to end panning
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    // Window resize handler
    const handleResize = () => {
      updateDimensions();
    };
    
    // Mouse down handler specifically for links
    const handleLinkClick = (e: MouseEvent) => {
      // If target is a link or inside a link, allow default behavior (navigate)
      const target = e.target as HTMLElement;
      if (target.tagName.toLowerCase() === 'a' || target.closest('a')) {
        // Don't interfere with link clicks
        return;
      }
    };

    // Add event listeners with proper options for all browsers
    viewport.addEventListener('wheel', handleWheel, { passive: false });
    viewport.addEventListener('mousedown', handleMouseDown);
    
    // Special handler just for links - this is a separate handler to ensure links work
    document.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    });
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('resize', handleResize);
    
    // Initial dimensions update
    updateDimensions();
    
    // Cleanup
    return () => {
      viewport.removeEventListener('wheel', handleWheel);
      viewport.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);
    };
  }, [scale, position, minScale, maxScale, onViewChange, isDragging]);
  
  // Reset to initial view
  const handleReset = () => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    
    if (!viewport || !content) return;
    
    const viewportRect = viewport.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();
    
    // Calculate dimensions for centered content at min scale
    const scaledWidth = contentRect.width / scale * minScale;
    const scaledHeight = contentRect.height / scale * minScale;
    
    // Center position
    const centerX = (viewportRect.width - scaledWidth) / 2;
    const centerY = (viewportRect.height - scaledHeight) / 2;
    
    setScale(minScale);
    setPosition({ x: centerX, y: centerY });
  };
  
  return (
    <div 
      ref={viewportRef} 
      className="relative h-[70vh] w-full overflow-hidden rounded-3xl border border-[var(--border)] bg-[rgba(4,7,15,0.6)]"
      style={{ position: 'relative' }}
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
      <div className="absolute right-3 top-3 z-10 flex gap-2" data-ui>
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
      
      {/* Content container */}
      <div
        ref={contentRef}
        className={`absolute ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          zIndex: 5 // Ensure content is above the background
        }}
      >
        {children}
      </div>
    </div>
  );
}