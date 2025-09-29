// Check users and find the correct user record
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function findUsers() {
  try {
    console.log('🔍 Checking all users...');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        deviceHash: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`📊 Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email || 'No email'} (${user.name || 'No name'})`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Device Hash: ${user.deviceHash || 'No device hash'}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('');
    });
    
    // Look specifically for your email
    const yourUser = users.find(u => u.email === 'mdominy72@gmail.com');
    if (yourUser) {
      console.log('🎯 Found your user record:');
      console.log(`   Email: ${yourUser.email}`);
      console.log(`   ID: ${yourUser.id}`);
      console.log(`   Device Hash: ${yourUser.deviceHash}`);
      
      // Check notification preferences for this user
      console.log('🔍 Checking notification preferences for your user...');
      const preferences = await prisma.notificationPreferences.findFirst({
        where: {
          userId: yourUser.id
        }
      });
      
      if (preferences) {
        console.log('✅ Notification preferences found:', {
          emailOnNewSympathy: preferences.emailOnNewSympathy,
          quietHoursEnabled: preferences.quietHoursEnabled,
          timezone: preferences.timezone
        });
      } else {
        console.log('❌ No notification preferences found for this user');
      }
      
    } else {
      console.log('❌ No user found with email mdominy72@gmail.com');
      
      // Check if there's a user with mdorminey79@gmail.com (the other email from screenshot)
      const altUser = users.find(u => u.email === 'mdorminey79@gmail.com');
      if (altUser) {
        console.log('🎯 Found user with mdorminey79@gmail.com:');
        console.log(`   ID: ${altUser.id}`);
        console.log(`   Device Hash: ${altUser.deviceHash}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findUsers();