/**
 * Script to regenerate biome configuration with improved detection rules
 * Run this in the browser console on the biome-analyzer page
 */

console.log('🗺️ Regenerating biome configuration...');

// Load and analyze the map
analyzeBiomeMap().then(biomeMap => {
  console.log('📊 Analysis complete! Biome distribution:');
  
  // Count biome types
  const biomeCounts = {};
  biomeMap.flat().forEach(biome => {
    biomeCounts[biome] = (biomeCounts[biome] || 0) + 1;
  });
  
  console.table(biomeCounts);
  
  // Generate new configuration
  const newConfig = generateBiomeConfig(biomeMap);
  
  console.log('📝 New biome configuration generated!');
  console.log('Copy this to replace src/lib/biome-config.ts:');
  console.log('='.repeat(50));
  console.log(newConfig);
  console.log('='.repeat(50));
  
  // Also copy to clipboard if possible
  if (navigator.clipboard) {
    navigator.clipboard.writeText(newConfig);
    console.log('✅ Configuration copied to clipboard!');
  }
}).catch(error => {
  console.error('❌ Analysis failed:', error);
});