// Test Google Workspace SMTP with different auth methods
const nodemailer = require('nodemailer');

async function testWorkspaceSMTP() {
  try {
    console.log('🔍 Testing Google Workspace SMTP configurations...');
    
    // Method 1: Direct SMTP with different settings
    console.log('📧 Testing Method 1: Standard SMTP...');
    const transporter1 = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'admin@ripstuff.net',
        pass: 'cxzbcqbyghhpcats'
      },
      debug: true
    });
    
    const verified1 = await transporter1.verify();
    console.log('✅ Method 1 verified:', verified1);
    
  } catch (error) {
    console.log('❌ Method 1 failed:', error.message);
    
    // Method 2: Try port 465 with SSL
    try {
      console.log('📧 Testing Method 2: SSL on port 465...');
      const transporter2 = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'admin@ripstuff.net',
          pass: 'cxzbcqbyghhpcats'
        }
      });
      
      const verified2 = await transporter2.verify();
      console.log('✅ Method 2 verified:', verified2);
      
    } catch (error2) {
      console.log('❌ Method 2 also failed:', error2.message);
      console.log('');
      console.log('🔧 Next steps:');
      console.log('1. Check if 2-Step Verification is enabled for admin@ripstuff.net');
      console.log('2. Generate a new app password in Google Workspace');
      console.log('3. Or set up SMTP relay in Admin Console');
    }
  }
}

testWorkspaceSMTP();