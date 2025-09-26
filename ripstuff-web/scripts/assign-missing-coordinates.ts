// Script to assign map coordinates to existing graves that don't have them
import { PrismaClient } from '@prisma/client';
import { generateMapCoordinates, findOptimalCoordinates, getDistrictGraveCounts } from '../src/lib/map-coordinates';

const prisma = new PrismaClient();

async function assignMissingCoordinates() {
  console.log('🗺️  Starting coordinate assignment for graves...');

  // Find graves without coordinates
  const gravesWithoutCoords = await prisma.grave.findMany({
    where: {
      OR: [
        { mapX: null },
        { mapY: null }
      ]
    },
    select: {
      id: true,
      creatorDeviceHash: true,
      title: true,
      status: true,
      createdAt: true
    }
  });

  console.log(`📍 Found ${gravesWithoutCoords.length} graves without coordinates`);

  if (gravesWithoutCoords.length === 0) {
    console.log('✅ All graves already have coordinates!');
    return;
  }

  // Get current district counts
  const districtCounts = await getDistrictGraveCounts(prisma);
  console.log(`📊 Current districts with graves: ${districtCounts.size}`);

  // Process each grave
  for (let i = 0; i < gravesWithoutCoords.length; i++) {
    const grave = gravesWithoutCoords[i];
    
    console.log(`\n🪦 Processing grave ${i + 1}/${gravesWithoutCoords.length}: "${grave.title}"`);

    // Generate preferred coordinates based on device hash (if available)
    let preferredCoords = { x: 8, y: 8 }; // Default to center
    
    if (grave.creatorDeviceHash) {
      preferredCoords = generateMapCoordinates(grave.creatorDeviceHash);
      console.log(`   📱 Device hash coordinates: ${preferredCoords.x}, ${preferredCoords.y}`);
    } else {
      // Use a hash of the creation date for consistent placement
      const dateHash = grave.createdAt.getTime() % 256;
      preferredCoords.x = dateHash % 16;
      preferredCoords.y = Math.floor(dateHash / 16) % 16;
      console.log(`   📅 Date-based coordinates: ${preferredCoords.x}, ${preferredCoords.y}`);
    }

    // Find optimal coordinates to balance distribution
    const optimalCoords = await findOptimalCoordinates(
      preferredCoords.x,
      preferredCoords.y,
      16,
      districtCounts
    );

    console.log(`   🎯 Optimal coordinates: ${optimalCoords.x}, ${optimalCoords.y}`);

    // Update the grave
    await prisma.grave.update({
      where: { id: grave.id },
      data: {
        mapX: optimalCoords.x,
        mapY: optimalCoords.y
      }
    });

    // Update district counts for next iteration
    const districtKey = `${optimalCoords.x}_${optimalCoords.y}`;
    const currentCount = districtCounts.get(districtKey) || 0;
    districtCounts.set(districtKey, currentCount + 1);

    console.log(`   ✅ Updated grave coordinates`);
  }

  console.log(`\n🎉 Successfully assigned coordinates to ${gravesWithoutCoords.length} graves!`);
  
  // Show final distribution summary
  console.log('\n📈 Final district distribution:');
  const sortedDistricts = Array.from(districtCounts.entries())
    .sort(([a], [b]) => a.localeCompare(b));
  
  for (const [district, count] of sortedDistricts) {
    console.log(`   District ${district}: ${count} graves`);
  }
}

async function main() {
  try {
    await assignMissingCoordinates();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();