// Check notification preferences for the correct user
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkNotificationSetup() {
  try {
    console.log('🔍 Checking notification setup for mdorminey79@gmail.com...');
    
    const userId = 'f82c3758-6adc-482e-b267-027db6d5c0ef'; // The correct user ID
    
    // Check notification preferences
    const preferences = await prisma.notificationPreferences.findFirst({
      where: {
        userId: userId
      }
    });
    
    if (preferences) {
      console.log('✅ Notification preferences found:');
      console.log(`   Email on new sympathy: ${preferences.emailOnNewSympathy}`);
      console.log(`   Quiet hours enabled: ${preferences.quietHoursEnabled}`);
      console.log(`   Quiet hours: ${preferences.quietHoursStart}:00 - ${preferences.quietHoursEnd}:00`);
      console.log(`   Timezone: ${preferences.timezone}`);
      console.log(`   Created: ${preferences.createdAt}`);
      console.log(`   Updated: ${preferences.updatedAt}`);
    } else {
      console.log('❌ No notification preferences found - creating default preferences...');
      
      // Create default notification preferences
      const newPreferences = await prisma.notificationPreferences.create({
        data: {
          userId: userId,
          emailOnNewSympathy: true,
          emailOnFirstReaction: true,
          emailDailyDigest: false,
          smsEnabled: false,
          smsOnNewSympathy: false,
          smsOnFirstReaction: false,
          phoneNumber: null,
          quietHoursStart: 22,
          quietHoursEnd: 8,
          quietHoursEnabled: false,
          timezone: 'America/New_York'
        }
      });
      
      console.log('✅ Created default notification preferences:', {
        emailOnNewSympathy: newPreferences.emailOnNewSympathy,
        quietHoursEnabled: newPreferences.quietHoursEnabled
      });
    }
    
    // Check the "Testing" grave created by this user
    console.log('🔍 Checking the "Testing" grave...');
    const grave = await prisma.grave.findFirst({
      where: {
        title: 'Testing',
        creatorDeviceHash: '61e806189fa25336a8aadda8737d177b1b9b459b74272c60b1f4bd550ab912ef'
      },
      include: {
        sympathies: {
          select: {
            id: true,
            body: true,
            createdAt: true
          }
        }
      }
    });
    
    if (grave) {
      console.log('✅ Testing grave found:');
      console.log(`   ID: ${grave.id}`);
      console.log(`   Slug: ${grave.slug}`);
      console.log(`   Sympathies: ${grave.sympathies.length}`);
      
      if (grave.sympathies.length > 0) {
        console.log('   Recent sympathies:');
        grave.sympathies.forEach((sympathy, index) => {
          console.log(`     ${index + 1}. "${sympathy.body}" (${sympathy.createdAt})`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkNotificationSetup();