/**
 * Biome Map Generator Script
 * Run this to analyze your fantasy_world_1.jpeg and generate biome mappings
 */

import { generateBiomeMap, BiomeType } from './biome-detector';

/**
 * Client-side function to analyze the map image and generate biome data
 */
export async function analyzeBiomeMap(): Promise<BiomeType[][]> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image to canvas
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        
        // Get image data for analysis
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Generate biome map
        const biomeMap = generateBiomeMap(imageData);
        
        console.log('Generated biome map:', biomeMap);
        console.log('Biome map as JSON:', JSON.stringify(biomeMap, null, 2));
        
        resolve(biomeMap);
      } else {
        reject(new Error('Could not get canvas context'));
      }
    };
    
    img.onerror = () => reject(new Error('Could not load image'));
    img.crossOrigin = 'anonymous'; // Handle CORS if needed
    img.src = '/backgrounds/fantasy_world_1.jpeg';
  });
}

/**
 * Generate a static biome configuration file
 */
export function generateBiomeConfig(biomeMap: BiomeType[][]): string {
  return `// Auto-generated biome configuration
// Generated on: ${new Date().toISOString()}

import { BiomeType } from './biome-detector';

export const BIOME_MAP: BiomeType[][] = ${JSON.stringify(biomeMap, null, 2)};

export function getBiomeForCoordinate(x: number, y: number): BiomeType {
  if (y >= 0 && y < BIOME_MAP.length && x >= 0 && x < BIOME_MAP[y].length) {
    return BIOME_MAP[y][x];
  }
  return 'plains';
}
`;
}

// For testing - you can call this in browser console
if (typeof window !== 'undefined') {
  (window as any).analyzeBiomeMap = analyzeBiomeMap;
  (window as any).generateBiomeConfig = generateBiomeConfig;
}