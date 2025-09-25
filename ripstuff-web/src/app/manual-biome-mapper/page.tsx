"use client";

import { useState } from 'react';
import { BiomeType, getCemeteryBackground } from '@/lib/biome-detector';

const BIOME_TYPES: BiomeType[] = [
  'plains', 'water', 'deepblue', 'coastal', 'underwater', 
  'forest', 'grass', 'mountain', 'rocky', 'desert', 'snow'
];

const BIOME_COLORS = {
  plains: '#8FBC8F',
  water: '#4169E1', 
  deepblue: '#00008B',
  coastal: '#20B2AA',
  underwater: '#191970',
  forest: '#228B22',
  grass: '#9ACD32',
  mountain: '#696969',
  rocky: '#A9A9A9',
  desert: '#F4A460',
  snow: '#FFFAFA'
};

const BIOME_ICONS = {
  plains: '🌾',
  water: '💧',
  deepblue: '🌊', 
  coastal: '🏖️',
  underwater: '🐠',
  forest: '🌲',
  grass: '🌱',
  mountain: '⛰️',
  rocky: '🗿',
  desert: '🏜️',
  snow: '❄️'
};

export default function ManualBiomeMapper() {
  // Initialize with all plains
  const [biomeMap, setBiomeMap] = useState<BiomeType[][]>(() => 
    Array(16).fill(null).map(() => Array(16).fill('plains'))
  );
  
  const [selectedBiome, setSelectedBiome] = useState<BiomeType>('deepblue');
  const [showPreview, setShowPreview] = useState(false);

  const setBiomeAt = (x: number, y: number) => {
    const newMap = [...biomeMap];
    newMap[y][x] = selectedBiome;
    setBiomeMap(newMap);
  };

  const generateConfig = () => {
    const config = `// Auto-generated biome configuration - Manual mapping
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
    
    navigator.clipboard.writeText(config);
    alert('Configuration copied to clipboard!');
  };

  const fillBorder = () => {
    const newMap = [...biomeMap];
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        if (x === 0 || x === 15 || y === 0 || y === 15) {
          newMap[y][x] = 'deepblue';
        }
      }
    }
    setBiomeMap(newMap);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🗺️ Manual Biome Mapper</h1>
        
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Biome Selector */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Select Biome Type</h2>
            <div className="grid grid-cols-2 gap-2">
              {BIOME_TYPES.map(biome => (
                <button
                  key={biome}
                  onClick={() => setSelectedBiome(biome)}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    selectedBiome === biome 
                      ? 'border-white bg-opacity-20' 
                      : 'border-gray-600 hover:border-gray-400'
                  }`}
                  style={{ 
                    backgroundColor: BIOME_COLORS[biome] + '40',
                    color: 'white'
                  }}
                >
                  {BIOME_ICONS[biome]} {biome}
                </button>
              ))}
            </div>
            
            <div className="space-y-2">
              <button 
                onClick={fillBorder}
                className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg font-medium"
              >
                🌊 Fill Border with Deep Blue
              </button>
              
              <button 
                onClick={() => setShowPreview(!showPreview)}
                className="w-full bg-purple-600 hover:bg-purple-700 p-3 rounded-lg font-medium"
              >
                👁️ {showPreview ? 'Hide' : 'Show'} Background Preview
              </button>
              
              <button 
                onClick={generateConfig}
                className="w-full bg-green-600 hover:bg-green-700 p-3 rounded-lg font-medium"
              >
                📋 Copy Configuration
              </button>
            </div>
          </div>

          {/* Interactive Grid */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">
              Click squares to paint with: {BIOME_ICONS[selectedBiome]} {selectedBiome}
            </h2>
            
            <div className="relative">
              {/* Background Image */}
              <img 
                src="/backgrounds/fantasy_world_1.jpeg"
                alt="Fantasy World Map"
                className="w-full rounded-lg opacity-60"
              />
              
              {/* Interactive Grid Overlay */}
              <div className="absolute inset-0 grid grid-cols-16 grid-rows-16 gap-0">
                {Array.from({ length: 16 }, (_, y) =>
                  Array.from({ length: 16 }, (_, x) => (
                    <button
                      key={`${x}-${y}`}
                      onClick={() => setBiomeAt(x, y)}
                      className="border border-white/20 hover:border-white/60 transition-all relative group"
                      style={{
                        backgroundColor: showPreview 
                          ? BIOME_COLORS[biomeMap[y][x]] + '80'
                          : 'transparent'
                      }}
                      title={`(${x},${y}) - ${biomeMap[y][x]}`}
                    >
                      <span className="absolute inset-0 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 bg-black/50">
                        {x},{y}
                      </span>
                      {showPreview && (
                        <span className="absolute top-0 left-0 text-xs">
                          {BIOME_ICONS[biomeMap[y][x]]}
                        </span>
                      )}
                    </button>
                  ))
                ).flat()}
              </div>
            </div>
            
            {/* Legend */}
            <div className="mt-4 text-sm text-gray-300">
              <p><strong>Instructions:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Select a biome type from the left panel</li>
                <li>Click on grid squares to assign that biome</li>
                <li>Use "Fill Border with Deep Blue" for ocean edges</li>
                <li>Toggle preview to see your biome assignments</li>
                <li>Copy configuration when done and paste into biome-config.ts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}