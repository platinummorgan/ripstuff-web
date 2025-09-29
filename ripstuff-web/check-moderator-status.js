// Check user moderator status
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkModeratorStatus() {
  try {
    console.log('🔍 Checking moderator status for mdorminey79@gmail.com...');
    
    const user = await prisma.user.findFirst({
      where: {
        email: 'mdorminey79@gmail.com'
      },
      select: {
        id: true,
        email: true,
        name: true,
        isModerator: true,
        deviceHash: true
      }
    });
    
    if (user) {
      console.log('✅ User found:');
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Device Hash: ${user.deviceHash}`);
      console.log(`   Is Moderator: ${user.isModerator}`);
      
      if (!user.isModerator) {
        console.log('');
        console.log('🔧 Setting user as moderator...');
        
        const updated = await prisma.user.update({
          where: { id: user.id },
          data: { isModerator: true }
        });
        
        console.log(`✅ Updated! isModerator is now: ${updated.isModerator}`);
      } else {
        console.log('✅ User already has moderator privileges');
      }
    } else {
      console.log('❌ User not found with email mdorminey79@gmail.com');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkModeratorStatus();