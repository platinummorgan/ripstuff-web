// Check the sympathies on the Testing grave to see attribution
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSympathies() {
  try {
    console.log('🔍 Checking sympathies on the Testing grave...');
    
    const grave = await prisma.grave.findFirst({
      where: {
        slug: 'testing-umpvr7'
      },
      include: {
        sympathies: {
          select: {
            id: true,
            body: true,
            deviceHash: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
    
    if (!grave) {
      console.log('❌ Testing grave not found');
      return;
    }
    
    console.log(`✅ Found grave: "${grave.title}"`);
    console.log(`📊 Sympathies count: ${grave.sympathies.length}`);
    console.log('');
    
    grave.sympathies.forEach((sympathy, index) => {
      console.log(`${index + 1}. "${sympathy.body}"`);
      console.log(`   Device Hash: ${sympathy.deviceHash || 'None'}`);
      console.log(`   Created: ${sympathy.createdAt}`);
      
      // Check if this matches your device hash
      if (sympathy.deviceHash === '61e806189fa25336a8aadda8737d177b1b9b459b74272c60b1f4bd550ab912ef') {
        console.log(`   🎯 This is YOUR sympathy (matches your device hash)`);
      } else {
        console.log(`   ❓ This sympathy is from a different device`);
      }
      console.log('');
    });
    
    // Check what user is associated with the grave owner
    console.log('🔍 Checking grave owner...');
    const graveOwner = await prisma.user.findFirst({
      where: {
        deviceHash: grave.creatorDeviceHash
      },
      select: {
        id: true,
        email: true,
        name: true,
        deviceHash: true
      }
    });
    
    if (graveOwner) {
      console.log('✅ Grave owner found:', graveOwner);
      
      // Check notification preferences
      try {
        const preferences = await prisma.notificationPreferences.findFirst({
          where: {
            userId: graveOwner.id
          }
        });
        
        if (preferences) {
          console.log('✅ Notification preferences exist:');
          console.log(`   Email on new sympathy: ${preferences.emailOnNewSympathy}`);
          console.log(`   Quiet hours enabled: ${preferences.quietHoursEnabled}`);
          console.log(`   Timezone: ${preferences.timezone}`);
        } else {
          console.log('❌ No notification preferences found for grave owner');
        }
      } catch (prefError) {
        console.log('❌ Error checking notification preferences:', prefError.message);
      }
    } else {
      console.log('❌ No user found for grave owner device hash:', grave.creatorDeviceHash);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSympathies();