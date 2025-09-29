// Test script to create a grave and then add a sympathy
const https = require('https');

async function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function testNotificationFlow() {
  try {
    // Step 1: Create a grave
    console.log('🏗️  Creating test grave...');
    
    const graveData = JSON.stringify({
      title: "Email Test Grave",
      description: "Testing email notifications",
      epitaph: "Here to test notifications",
      biome: "forest",
      bgColor: "#4ade80"
    });

    const graveOptions = {
      hostname: 'ripstuff.net',
      port: 443,
      path: '/api/graves',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(graveData),
        'Cookie': 'rip_device=167a6522ddb5c76e73e6f200ba9bfbce82d6350527edb613fa03ad775aef0e45' // Use the device cookie from previous response
      }
    };

    const graveResponse = await makeRequest(graveOptions, graveData);
    console.log(`✅ Grave creation status: ${graveResponse.statusCode}`);
    
    if (graveResponse.statusCode !== 201) {
      console.log('❌ Grave creation failed:', graveResponse.body);
      return;
    }
    
    const grave = JSON.parse(graveResponse.body);
    console.log(`🎉 Grave created with slug: ${grave.slug}`);
    
    // Step 2: Add a sympathy to trigger notification
    console.log('💐 Adding sympathy to trigger notification...');
    
    const sympathyData = JSON.stringify({
      body: "Test sympathy to trigger email notification",
      isAnonymous: false,
      senderName: "Test User"
    });

    const sympathyOptions = {
      hostname: 'ripstuff.net',
      port: 443,
      path: `/api/graves/${grave.slug}/sympathies`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(sympathyData)
      }
    };

    const sympathyResponse = await makeRequest(sympathyOptions, sympathyData);
    console.log(`✅ Sympathy creation status: ${sympathyResponse.statusCode}`);
    console.log('✅ Response:', sympathyResponse.body);
    
    if (sympathyResponse.statusCode === 201) {
      console.log('🎉 Sympathy created successfully! Check logs for notification debug info.');
      console.log('📧 Check your email (mdominy72@gmail.com) for the notification.');
    } else {
      console.log('❌ Failed to create sympathy');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testNotificationFlow();