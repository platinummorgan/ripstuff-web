"use client";

import { useState } from 'react';
import { analyzeBiomeMap, generateBiomeConfig } from '@/lib/biome-generator';
import { BiomeType, getCemeteryBackground } from '@/lib/biome-detector';

export default function BiomeAnalyzerPage() {
  const [biomeMap, setBiomeMap] = useState<BiomeType[][] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [configCode, setConfigCode] = useState<string>('');

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeBiomeMap();
      setBiomeMap(result);
      const config = generateBiomeConfig(result);
      setConfigCode(config);
      console.log('Biome analysis complete!', result);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed. Check console for details.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(configCode);
    alert('Configuration copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🗺️ Biome Map Analyzer</h1>
        
        <div className="grid gap-8 md:grid-cols-2">
          {/* Analysis Controls */}
          <div className="space-y-6">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Map Analysis</h2>
              <p className="text-gray-300 mb-4">
                This will analyze your fantasy_world_1.jpeg and determine biome types 
                for each coordinate (0,0 to 15,15).
              </p>
              
              <button 
                onClick={runAnalysis}
                disabled={isAnalyzing}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-medium"
              >
                {isAnalyzing ? 'Analyzing Map...' : 'Analyze Biomes'}
              </button>
            </div>

            {/* Map Preview */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Source Map</h3>
              <img 
                src="/backgrounds/fantasy_world_1.jpeg" 
                alt="Fantasy World Map"
                className="w-full rounded border"
                style={{ maxHeight: '400px', objectFit: 'contain' }}
              />
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {biomeMap && (
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Biome Grid (16x16)</h3>
                <div className="grid grid-cols-16 gap-1 mb-4" style={{ fontSize: '8px' }}>
                  {biomeMap.map((row, y) =>
                    row.map((biome, x) => (
                      <div
                        key={`${x},${y}`}
                        className="aspect-square flex items-center justify-center text-xs rounded"
                        style={{
                          backgroundColor: getBiomeColor(biome),
                          color: biome === 'snow' ? 'black' : 'white'
                        }}
                        title={`${x},${y}: ${biome}`}
                      >
                        {biome[0].toUpperCase()}
                      </div>
                    ))
                  )}
                </div>
                
                <div className="text-sm text-gray-300 mb-4">
                  <p><strong>Legend:</strong></p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['snow', 'deepblue', 'water', 'coastal', 'underwater', 'desert', 'forest', 'grass', 'rocky', 'mountain', 'plains'].map(biome => (
                      <div key={biome} className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: getBiomeColor(biome as BiomeType) }}
                        />
                        <span className="capitalize">{biome}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {configCode && (
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Generated Configuration</h3>
                  <button 
                    onClick={copyToClipboard}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm"
                  >
                    Copy Code
                  </button>
                </div>
                <pre className="bg-gray-900 p-4 rounded overflow-auto max-h-96 text-sm">
                  <code>{configCode}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getBiomeColor(biome: BiomeType): string {
  const colors: Record<BiomeType, string> = {
    snow: '#ffffff',
    water: '#4A90E2', 
    deepblue: '#003366',
    coastal: '#5DADE2',
    underwater: '#1B4F72',
    desert: '#D4A574',
    forest: '#228B22',
    grass: '#90EE90',
    rocky: '#696969',
    mountain: '#708090',
    plains: '#9ACD32'
  };
  return colors[biome] || colors.plains;
}