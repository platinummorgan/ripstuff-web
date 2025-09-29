// Create notification preferences directly
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createPreferences() {
  try {
    const userId = 'f82c3758-6adc-482e-b267-027db6d5c0ef';
    
    console.log('🔧 Creating notification preferences directly...');
    
    // Use raw SQL to ensure it works
    const result = await prisma.$executeRaw`
      INSERT INTO notification_preferences (
        id, user_id, email_on_new_sympathy, email_on_first_reaction, 
        email_daily_digest, sms_enabled, sms_on_new_sympathy, sms_on_first_reaction,
        phone_number, quiet_hours_start, quiet_hours_end, quiet_hours_enabled, 
        timezone, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), 
        ${userId}::uuid,
        true, true, false, false, false, false,
        null, 22, 8, false,
        'America/New_York',
        NOW(), NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        email_on_new_sympathy = true,
        quiet_hours_enabled = false,
        updated_at = NOW()
    `;
    
    console.log('✅ Notification preferences created/updated');
    
    // Verify they exist
    const check = await prisma.$queryRaw`
      SELECT email_on_new_sympathy, quiet_hours_enabled, timezone 
      FROM notification_preferences 
      WHERE user_id = ${userId}::uuid
    `;
    
    console.log('✅ Verification:', check[0]);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createPreferences();