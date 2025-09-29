// Test with your personal Gmail account instead
const nodemailer = require('nodemailer');

async function testPersonalGmail() {
  try {
    console.log('🔍 Testing with personal Gmail account...');
    console.log('📧 We need to set up an app password for mdorminey79@gmail.com');
    console.log('');
    console.log('Steps:');
    console.log('1. Go to https://myaccount.google.com/apppasswords');
    console.log('2. Generate an app password for "Mail"');
    console.log('3. Use that password instead of your regular Gmail password');
    console.log('');
    console.log('Current issue: admin@ripstuff.net authentication is failing');
    console.log('Solution: Either fix Workspace SMTP or switch to personal Gmail');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testPersonalGmail();