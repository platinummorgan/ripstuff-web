const { PrismaClient } = require('@prisma/client');

async function checkData() {
  const prisma = new PrismaClient();
  
  try {
    // Check grave count
    const graveCount = await prisma.grave.count();
    console.log(`Total graves: ${graveCount}`);
    
    // Get first few graves
    const graves = await prisma.grave.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        createdAt: true,
        status: true
      }
    });
    
    console.log('\nFirst 5 graves:');
    graves.forEach(grave => {
      console.log(`- ${grave.title} (${grave.slug}) - ${grave.status} - ${grave.createdAt}`);
    });
    
    // Check user count
    const userCount = await prisma.user.count();
    console.log(`\nTotal users: ${userCount}`);
    
    console.log('\nData check complete!');
    
  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();