// Test Gmail SMTP connection and get detailed logs
const nodemailer = require('nodemailer');

async function testGmailConnection() {
  try {
    console.log('🔍 Testing Gmail SMTP connection...');
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'admin@ripstuff.net',
        pass: 'mjsracnuocnfffxq'  // Your new app password
      },
      debug: true,  // Enable debug logs
      logger: true  // Enable logging
    });
    
    // Verify connection
    console.log('✅ Verifying SMTP connection...');
    const verified = await transporter.verify();
    console.log('✅ SMTP connection verified:', verified);
    
    // Send a test email
    console.log('📧 Sending test email...');
    const info = await transporter.sendMail({
      from: 'admin@ripstuff.net',
      to: 'mdorminey79@gmail.com',
      subject: 'Direct SMTP Test - RipStuff Notification System',
      html: `
        <h2>Test Email from RipStuff</h2>
        <p>This is a direct test of the Gmail SMTP connection.</p>
        <p>Time: ${new Date().toISOString()}</p>
        <p>If you receive this, the SMTP connection is working!</p>
      `
    });
    
    console.log('✅ Email sent successfully!');
    console.log('📊 Message ID:', info.messageId);
    console.log('📊 Response:', info.response);
    console.log('📊 Accepted:', info.accepted);
    console.log('📊 Rejected:', info.rejected);
    
  } catch (error) {
    console.error('❌ SMTP Error:', error);
    
    if (error.code === 'EAUTH') {
      console.log('🔧 Authentication failed - check app password');
    } else if (error.code === 'ECONNECTION') {
      console.log('🔧 Connection failed - check network/firewall');
    }
  }
}

testGmailConnection();