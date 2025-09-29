// Test script to add a sympathy and trigger notification
const https = require('https');

const postData = JSON.stringify({
  body: "Test sympathy to trigger email notification",
  isAnonymous: false,
  senderName: "Test User"
});

const options = {
  hostname: 'ripstuff.net',
  port: 443,
  path: '/api/graves/testing-umpvr7/sympathies',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🚀 Sending sympathy to trigger notification...');

const req = https.request(options, (res) => {
  console.log(`✅ Status: ${res.statusCode}`);
  console.log(`✅ Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('✅ Response:', data);
    if (res.statusCode === 201) {
      console.log('🎉 Sympathy created successfully! Check logs for notification debug info.');
    } else {
      console.log('❌ Failed to create sympathy');
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request error:', e.message);
});

req.write(postData);
req.end();