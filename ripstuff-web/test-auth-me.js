// Test the /api/auth/me endpoint to see what it returns
const https = require('https');

const options = {
  hostname: 'ripstuff.net',
  port: 443,
  path: '/api/auth/me',
  method: 'GET',
  headers: {
    'Cookie': 'rip_device=61e806189fa25336a8aadda8737d177b1b9b459b74272c60b1f4bd550ab912ef' // Your device hash
  }
};

console.log('🔍 Testing /api/auth/me endpoint...');

const req = https.request(options, (res) => {
  console.log(`✅ Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('✅ Response:', JSON.stringify(response, null, 2));
      
      if (response.user && response.user.isModerator !== undefined) {
        console.log(`🛡️ isModerator: ${response.user.isModerator}`);
      } else {
        console.log('❌ No isModerator field in response');
      }
    } catch (error) {
      console.log('❌ JSON parse error:', error.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request error:', e.message);
});

req.end();