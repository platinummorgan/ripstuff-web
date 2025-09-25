/**
 * Biome Detection System
 * Analyzes the main map image to determine biome types for each coordinate
 */

export type BiomeType = 'snow' | 'grass' | 'forest' | 'desert' | 'water' | 'mountain' | 'plains' | 'coastal' | 'deepblue' | 'rocky' | 'underwater';

interface RGBColor {
  r: number;
  g: number;
  b: number;
}

// Define biome detection rules based on color analysis - improved accuracy
const BIOME_RULES = {
  // Snow/Ice - Very bright white/light blue areas
  snow: (rgb: RGBColor) => 
    rgb.r > 200 && rgb.g > 200 && rgb.b > 200 && 
    Math.abs(rgb.r - rgb.g) < 30 && Math.abs(rgb.g - rgb.b) < 30,
  
  // Deep ocean - Very dark blue water
  deepblue: (rgb: RGBColor) => 
    rgb.b > 80 && rgb.b > rgb.r * 2 && rgb.b > rgb.g * 1.8 && 
    rgb.r < 60 && rgb.g < 80,
  
  // Underwater - Dark blue-green
  underwater: (rgb: RGBColor) => 
    rgb.b > 70 && rgb.g > 50 && rgb.b > rgb.r * 1.5 && 
    rgb.r < 50 && (rgb.b + rgb.g) / 2 > rgb.r * 1.8,
  
  // Regular water - Blue dominant but lighter than deep water
  water: (rgb: RGBColor) => 
    rgb.b > 90 && rgb.b > rgb.r * 1.3 && rgb.b > rgb.g * 1.2 && 
    rgb.r < 120 && rgb.g < 130,
  
  // Coastal - Blue-green mix near water
  coastal: (rgb: RGBColor) => 
    rgb.b > 80 && rgb.g > 80 && rgb.b > rgb.r && 
    Math.abs(rgb.b - rgb.g) < 40 && rgb.r < 100,
  
  // Desert - Sandy brown/yellow tones
  desert: (rgb: RGBColor) => 
    rgb.r > 140 && rgb.g > 100 && rgb.b < 90 && 
    rgb.r > rgb.g && rgb.g > rgb.b && (rgb.r - rgb.b) > 50,
  
  // Forest - Dark green areas
  forest: (rgb: RGBColor) => 
    rgb.g > 80 && rgb.g > rgb.r * 1.2 && rgb.g > rgb.b * 1.3 && 
    rgb.r < 100 && rgb.b < 80 && rgb.g < 150,
  
  // Grass/Light green - Brighter green than forest
  grass: (rgb: RGBColor) => 
    rgb.g > 100 && rgb.g > rgb.r * 1.1 && rgb.g > rgb.b * 1.2 && 
    rgb.r > 60 && rgb.r < 140 && rgb.b < 100,
  
  // Rocky/Gray - Neutral gray tones
  rocky: (rgb: RGBColor) => 
    rgb.r > 60 && rgb.g > 60 && rgb.b > 60 && 
    Math.abs(rgb.r - rgb.g) < 30 && Math.abs(rgb.g - rgb.b) < 30 &&
    (rgb.r + rgb.g + rgb.b) / 3 > 70 && (rgb.r + rgb.g + rgb.b) / 3 < 120,
  
  // Mountain - Lighter gray/brown, elevated terrain
  mountain: (rgb: RGBColor) => 
    rgb.r > 90 && rgb.g > 90 && rgb.b > 80 && 
    Math.abs(rgb.r - rgb.g) < 40 && rgb.r < 160 && rgb.g < 160 &&
    (rgb.r + rgb.g + rgb.b) / 3 > 90 && (rgb.r + rgb.g + rgb.b) / 3 < 140,
  
  // Plains - Fallback for everything else (lighter areas, mixed terrain)
  plains: (rgb: RGBColor) => 
    true // Default fallback
};

/**
 * Analyzes a pixel and determines the biome type
 */
export function detectBiome(rgb: RGBColor): BiomeType {
  // Check each biome rule in priority order
  for (const [biome, rule] of Object.entries(BIOME_RULES)) {
    if (rule(rgb)) {
      return biome as BiomeType;
    }
  }
  return 'plains'; // Fallback
}

/**
 * Generate biome map for all coordinates (0,0 to 15,15)
 * This would be called client-side with canvas to analyze the image
 */
export function generateBiomeMap(imageData: ImageData): BiomeType[][] {
  const biomeMap: BiomeType[][] = [];
  const gridSize = 16;
  const imageWidth = imageData.width;
  const imageHeight = imageData.height;
  
  for (let y = 0; y < gridSize; y++) {
    const row: BiomeType[] = [];
    
    for (let x = 0; x < gridSize; x++) {
      // Calculate pixel position in the image for this coordinate
      const pixelX = Math.floor((x / gridSize) * imageWidth);
      const pixelY = Math.floor((y / gridSize) * imageHeight);
      const pixelIndex = (pixelY * imageWidth + pixelX) * 4;
      
      // Extract RGB values
      const rgb: RGBColor = {
        r: imageData.data[pixelIndex],
        g: imageData.data[pixelIndex + 1], 
        b: imageData.data[pixelIndex + 2]
      };
      
      // Detect biome for this coordinate
      const biome = detectBiome(rgb);
      row.push(biome);
    }
    
    biomeMap.push(row);
  }
  
  return biomeMap;
}

/**
 * Get biome type for a specific coordinate
 */
export function getBiomeAt(x: number, y: number, biomeMap: BiomeType[][]): BiomeType {
  if (y >= 0 && y < biomeMap.length && x >= 0 && x < biomeMap[y].length) {
    return biomeMap[y][x];
  }
  return 'plains'; // Fallback for invalid coordinates
}

/**
 * Get the cemetery background image for a biome type
 */
export function getCemeteryBackground(biome: BiomeType): string {
  const backgroundMap: Record<BiomeType, string> = {
    snow: '/backgrounds/snowy_detail.jpeg',
    water: '/backgrounds/deepblue_detail.jpeg', 
    desert: '/backgrounds/desert_detail.jpeg',
    forest: '/backgrounds/forest_detail.jpeg',
    grass: '/backgrounds/plains_detail.jpeg',
    mountain: '/backgrounds/mountain_detail.jpeg',
    plains: '/backgrounds/plains_detail.jpeg', // Will be replaced with clean version
    coastal: '/backgrounds/coastal_detail.jpeg',
    deepblue: '/backgrounds/deepblue_detail.jpeg',
    rocky: '/backgrounds/rocky_detail.jpeg',
    underwater: '/backgrounds/underwater_detail.jpeg'
  };
  
  return backgroundMap[biome] || backgroundMap.plains;
}