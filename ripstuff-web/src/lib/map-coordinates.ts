// Utility functions for map coordinate assignment

/**
 * Generate pseudo-random map coordinates based on device hash
 * This ensures some consistency while still spreading graves across the map
 */
export function generateMapCoordinates(deviceHash: string, gridSize: number = 16): { x: number; y: number } {
  // Use device hash to create a consistent but distributed coordinate assignment
  let hash = 0;
  for (let i = 0; i < deviceHash.length; i++) {
    const char = deviceHash.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Add some time-based variation to prevent all graves from same user going to same district
  const timeVariation = Math.floor(Date.now() / (1000 * 60 * 60)); // Changes hourly
  hash = hash ^ timeVariation;
  
  // Generate coordinates
  const x = Math.abs(hash % gridSize);
  const y = Math.abs(Math.floor(hash / gridSize) % gridSize);
  
  return { x, y };
}

/**
 * Find the least populated nearby district to balance distribution
 */
export async function findOptimalCoordinates(
  preferredX: number, 
  preferredY: number, 
  gridSize: number = 16,
  graveCountByDistrict: Map<string, number> = new Map()
): Promise<{ x: number; y: number }> {
  const candidates = [];
  const radius = 3; // Check within 3 cells of preferred location
  
  // Generate candidate positions in a radius around preferred position
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      const x = (preferredX + dx + gridSize) % gridSize;
      const y = (preferredY + dy + gridSize) % gridSize;
      
      const districtKey = `${x}_${y}`;
      const currentCount = graveCountByDistrict.get(districtKey) || 0;
      const distance = Math.abs(dx) + Math.abs(dy); // Manhattan distance
      
      candidates.push({
        x,
        y,
        count: currentCount,
        distance,
        score: currentCount * 10 + distance, // Prefer less populated and closer
      });
    }
  }
  
  // Sort by score (lower is better)
  candidates.sort((a, b) => a.score - b.score);
  
  // Return the best candidate
  return { x: candidates[0].x, y: candidates[0].y };
}

/**
 * Get current grave counts by district for load balancing
 */
export async function getDistrictGraveCounts(prisma: any, gridSize: number = 16): Promise<Map<string, number>> {
  const counts = await prisma.grave.groupBy({
    by: ['mapX', 'mapY'],
    where: {
      status: 'APPROVED',
      mapX: { 
        not: null,
        gte: 0, 
        lt: gridSize 
      },
      mapY: { 
        not: null,
        gte: 0, 
        lt: gridSize 
      },
    },
    _count: {
      id: true,
    },
  });

  const districtCounts = new Map<string, number>();
  
  for (const count of counts) {
    if (count.mapX !== null && count.mapY !== null) {
      const key = `${count.mapX}_${count.mapY}`;
      districtCounts.set(key, count._count.id);
    }
  }
  
  return districtCounts;
}