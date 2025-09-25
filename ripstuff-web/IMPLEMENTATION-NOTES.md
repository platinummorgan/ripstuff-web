# Virtual Graveyard Map Implementation Updates

## Issues Fixed

1. **Zoom Behavior Issue**
   - Problem: Zoom didn't focus on cursor position, making navigation difficult
   - Solution: Implemented proper zoom-to-cursor calculations in SimplePanZoom2.tsx

2. **Black Spaces Around Map**
   - Problem: Black edges appeared around the map when zoomed out
   - Solution: Improved scaling logic to ensure map fills viewport completely

## Implementation Changes

### 1. New Components Created

- **SimplePanZoom2.tsx**: Simplified pan/zoom implementation with proper event handling
- **CemeteryCanvas2.tsx**: Updated container component using the new pan/zoom implementation
- **OverworldMap2.tsx**: Updated map component with improved layout and link handling
- **overworld2/page.tsx**: Example implementation page

### 2. How To Implement

To use the new implementation:

1. Replace imports in your application:
   ```tsx
   // Old imports
   import { CemeteryCanvas } from "../components/cemetery/CemeteryCanvas";
   import { OverworldMap } from "../components/cemetery/OverworldMap";

   // New imports
   import { CemeteryCanvas } from "../components/cemetery/CemeteryCanvas2";
   import { OverworldMap } from "../components/cemetery/OverworldMap2";
   ```

2. Update routes to point to the new implementation:
   ```tsx
   // In your app/routes.ts or next.config.js
   // Redirect /overworld to /overworld2 if desired
   ```

3. Test the implementation by navigating to `/overworld2` in your application.

### 3. Key Technical Improvements

1. **Zoom Calculation**:
   ```tsx
   // Proper zoom-to-cursor calculation
   const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
   const mouseX = event.clientX - containerRect.left;
   const mouseY = event.clientY - containerRect.top;
   
   // Calculate world coordinates under mouse before zoom
   const worldX = (mouseX - translate.x) / scale;
   const worldY = (mouseY - translate.y) / scale;
   
   // Calculate new scale with constraints
   const newScale = Math.min(maxScale, Math.max(minScale, scale * zoomFactor));
   
   // Calculate new translation to keep mouse over same world coordinates
   const newTranslateX = mouseX - worldX * newScale;
   const newTranslateY = mouseY - worldY * newScale;
   ```

2. **Map Sizing**:
   ```tsx
   // Ensure map completely fills viewport with no black edges
   const scaleX = rect.width / worldSize;
   const scaleY = rect.height / worldSize;
   
   // Using the LARGER scale ensures the map completely fills the viewport
   const minScaleValue = Math.max(scaleX, scaleY) * 1.01; // slight buffer
   ```

3. **Link Handling**:
   ```tsx
   // Proper link structure with pointer events enabled
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
   ```

## Testing

1. Zoom behavior should now:
   - Focus on cursor position when zooming in/out
   - Maintain proper bounds and constraints
   - Not interfere with link clicks

2. Map display should:
   - Fill the viewport completely at minimum zoom
   - Show no black spaces around edges
   - Properly display tombstones with links

## Next Steps

After confirming the fixes work as expected, you may:

1. Replace the original implementations with these new versions
2. Further refine the styles and interactions
3. Implement additional features like:
   - Custom tombstone placement
   - Region-specific visuals
   - User interaction indicators