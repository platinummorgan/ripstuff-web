// Check for very recent graves
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkRecentGraves() {
  try {
    console.log('🔍 Checking for very recent graves...');
    
    // Check last 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    const recentGraves = await prisma.grave.findMany({
      where: {
        createdAt: {
          gte: tenMinutesAgo
        }
      },
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        creatorDeviceHash: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`📊 Graves created in last 10 minutes: ${recentGraves.length}`);
    recentGraves.forEach((grave, index) => {
      console.log(`${index + 1}. "${grave.title}" (${grave.status})`);
      console.log(`   Slug: ${grave.slug}`);
      console.log(`   Creator: ${grave.creatorDeviceHash}`);
      console.log(`   Created: ${grave.createdAt}`);
      console.log('');
    });
    
    // Check all graves from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaysGraves = await prisma.grave.findMany({
      where: {
        createdAt: {
          gte: today
        }
      },
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        creatorDeviceHash: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`📊 All graves created today: ${todaysGraves.length}`);
    todaysGraves.forEach((grave, index) => {
      const isYourDevice = grave.creatorDeviceHash === '61e806189fa25336a8aadda8737d177b1b9b459b74272c60b1f4bd550ab912ef';
      const marker = isYourDevice ? '🎯' : '  ';
      console.log(`${marker}${index + 1}. "${grave.title}" (${grave.status})`);
      console.log(`   Slug: ${grave.slug}`);
      console.log(`   Creator: ${grave.creatorDeviceHash.substring(0, 16)}...`);
      console.log(`   Created: ${grave.createdAt}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkRecentGraves();