// Test database connection and see what's happening
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    const result = await prisma.$queryRaw`SELECT NOW() as current_time, version() as db_version`;
    console.log('✅ Database connected:', result[0]);
    
    // Check if notification_preferences table has the column
    console.log('🔍 Checking notification_preferences structure...');
    const structure = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'notification_preferences' 
      ORDER BY ordinal_position
    `;
    console.log('📊 notification_preferences columns:', structure);
    
    // Check for any recent graves created today
    console.log('🔍 Checking recent graves...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const recentGraves = await prisma.grave.findMany({
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
    
    console.log(`📊 Graves created today: ${recentGraves.length}`);
    recentGraves.forEach((grave, index) => {
      console.log(`${index + 1}. "${grave.title}" (${grave.status})`);
      console.log(`   Slug: ${grave.slug}`);
      console.log(`   Creator: ${grave.creatorDeviceHash}`);
      console.log(`   Created: ${grave.createdAt}`);
      console.log('');
    });
    
    // Check user authentication status for the device hash
    console.log('🔍 Checking authentication...');
    const deviceHash = '167a6522ddb5c76e73e6f200ba9bfbce82d6350527edb613fa03ad775aef0e45'; // From the cookie
    
    const user = await prisma.user.findFirst({
      where: {
        deviceHash: deviceHash
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });
    
    if (user) {
      console.log('✅ User found:', user);
    } else {
      console.log('❌ No user found for device hash:', deviceHash);
      
      // Check if there are any users at all
      const userCount = await prisma.user.count();
      console.log(`📊 Total users in database: ${userCount}`);
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();