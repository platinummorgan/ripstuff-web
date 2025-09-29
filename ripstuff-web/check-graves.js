const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkGraves() {
  try {
    console.log('🔍 Checking graves in database...');
    
    const graves = await prisma.grave.findMany({
      where: {
        title: {
          contains: 'testing'
        }
      },
      select: {
        id: true,
        slug: true,
        title: true,
        creatorDeviceHash: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`📊 Found ${graves.length} graves with "testing" in title:`);
    graves.forEach((grave, index) => {
      console.log(`${index + 1}. Slug: "${grave.slug}"`);
      console.log(`   Title: "${grave.title}"`);
      console.log(`   ID: ${grave.id}`);
      console.log(`   Creator: ${grave.creatorDeviceHash}`);
      console.log(`   Created: ${grave.createdAt}`);
      console.log('');
    });
    
    if (graves.length === 0) {
      console.log('❌ No graves found with "testing" in title');
      
      // Check recent graves
      const recentGraves = await prisma.grave.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          slug: true,
          title: true,
          createdAt: true
        }
      });
      
      console.log('📊 Recent graves:');
      recentGraves.forEach((grave, index) => {
        console.log(`${index + 1}. "${grave.slug}" - "${grave.title}" (${grave.createdAt})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkGraves();