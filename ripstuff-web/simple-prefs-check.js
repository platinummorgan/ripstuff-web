// Simple check for notification preferences
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function checkPreferences() {
  try {
    const userId = 'f82c3758-6adc-482e-b267-027db6d5c0ef'; // Your user ID
    
    console.log('🔍 Checking notification preferences...');
    
    const preferences = await prisma.notificationPreferences.findFirst({
      where: {
        userId: userId
      }
    });
    
    if (preferences) {
      console.log('✅ Notification preferences FOUND:');
      console.log(`   Email on new sympathy: ${preferences.emailOnNewSympathy}`);
      console.log(`   Quiet hours enabled: ${preferences.quietHoursEnabled}`);
      console.log(`   Timezone: ${preferences.timezone}`);
      console.log(`   Created: ${preferences.createdAt}`);
    } else {
      console.log('❌ No notification preferences found - CREATING DEFAULT...');
      
      const newPrefs = await prisma.notificationPreferences.create({
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
      
      console.log('✅ Created notification preferences:', {
        emailOnNewSympathy: newPrefs.emailOnNewSympathy,
        quietHoursEnabled: newPrefs.quietHoursEnabled
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkPreferences();