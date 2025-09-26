// Test script to validate upload configuration
import fs from 'fs';
import path from 'path';

async function testUploadConfig() {
  console.log('🧪 Testing upload configuration...');
  
  // Check environment variables
  console.log('\n📋 Environment Variables:');
  console.log('UPLOAD_PROVIDER:', process.env.UPLOAD_PROVIDER || 'not set');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
  console.log('NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL || 'not set');
  
  // Check directory structure
  console.log('\n📁 Directory Structure:');
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'graves');
  console.log('Upload directory:', uploadDir);
  
  try {
    const stats = await fs.promises.stat(uploadDir);
    console.log('Directory exists:', stats.isDirectory());
    
    // Try to create a test file
    const testFile = path.join(uploadDir, 'test.txt');
    await fs.promises.writeFile(testFile, 'test content');
    console.log('Write permission: ✅');
    
    // Clean up
    await fs.promises.unlink(testFile);
    console.log('Delete permission: ✅');
    
  } catch (error) {
    console.error('Directory issue:', error);
    
    // Try to create the directory
    try {
      await fs.promises.mkdir(uploadDir, { recursive: true });
      console.log('Created upload directory: ✅');
    } catch (createError) {
      console.error('Cannot create directory:', createError);
    }
  }
  
  // Check dependencies
  console.log('\n📦 Dependencies:');
  try {
    const sharp = await import('sharp');
    console.log('Sharp (image processing): ✅');
  } catch (error) {
    console.log('Sharp (image processing): ❌', error instanceof Error ? error.message : String(error));
  }
  
  try {
    const ffmpeg = await import('fluent-ffmpeg');
    console.log('FFmpeg (video processing): ✅');
  } catch (error) {
    console.log('FFmpeg (video processing): ❌', error instanceof Error ? error.message : String(error));
  }
  
  // Test API endpoint
  console.log('\n🌐 Testing API Endpoint:');
  try {
    const response = await fetch('http://localhost:3000/api/uploads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contentType: 'image/jpeg',
        contentLength: 1024
      })
    });
    
    console.log('API Response Status:', response.status);
    const data = await response.json().catch(() => null);
    console.log('API Response Data:', data);
    
    if (response.ok && data?.provider === 'local') {
      console.log('Upload token generation: ✅');
    } else {
      console.log('Upload token generation: ❌');
    }
    
  } catch (error) {
    console.log('API test failed:', error instanceof Error ? error.message : String(error));
  }
  
  console.log('\n🎉 Upload configuration test complete!');
}

testUploadConfig().catch(console.error);