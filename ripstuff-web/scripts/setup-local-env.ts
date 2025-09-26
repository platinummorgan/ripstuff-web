// Quick setup script to configure environment for local development
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), '.env.example');

// Default local development configuration
const localConfig = {
  EULOGY_FAKE: "1",
  UPLOAD_PROVIDER: "local",
  NODE_ENV: "development",
  NEXT_PUBLIC_SITE_URL: "http://localhost:3000"
};

async function setupLocalEnv() {
  console.log('🔧 Setting up local development environment...');

  // Check if .env.local already exists
  if (fs.existsSync(envPath)) {
    console.log('📄 .env.local already exists');
    
    // Read existing file and update only missing keys
    const existingContent = fs.readFileSync(envPath, 'utf8');
    const existingVars = new Map<string, string>();
    
    // Parse existing variables
    existingContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          existingVars.set(key.trim(), valueParts.join('=').replace(/^"|"$/g, ''));
        }
      }
    });

    // Add missing development variables
    let updated = false;
    for (const [key, value] of Object.entries(localConfig)) {
      if (!existingVars.has(key)) {
        fs.appendFileSync(envPath, `\n# Auto-added for local development\n${key}="${value}"\n`);
        console.log(`✅ Added ${key}="${value}"`);
        updated = true;
      } else {
        console.log(`⏩ ${key} already configured`);
      }
    }

    if (!updated) {
      console.log('✅ All development variables already configured');
    }
  } else {
    console.log('📄 Creating .env.local from example...');
    
    // Copy example file if it exists
    if (fs.existsSync(envExamplePath)) {
      let content = fs.readFileSync(envExamplePath, 'utf8');
      
      // Update with local development values
      for (const [key, value] of Object.entries(localConfig)) {
        const regex = new RegExp(`^${key}=.*$`, 'm');
        if (content.match(regex)) {
          content = content.replace(regex, `${key}="${value}"`);
        } else {
          content += `\n# Auto-added for local development\n${key}="${value}"\n`;
        }
      }
      
      fs.writeFileSync(envPath, content);
      console.log('✅ Created .env.local with development settings');
    } else {
      // Create minimal local config
      const minimalConfig = Object.entries(localConfig)
        .map(([key, value]) => `${key}="${value}"`)
        .join('\n');
      
      fs.writeFileSync(envPath, `# Local development configuration\n${minimalConfig}\n`);
      console.log('✅ Created minimal .env.local');
    }
  }

  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'graves');
  try {
    await fs.promises.mkdir(uploadsDir, { recursive: true });
    console.log('📁 Created uploads directory');
  } catch (error) {
    console.log('📁 Uploads directory already exists');
  }

  console.log('\n🎉 Local development environment ready!');
  console.log('\n📋 Current configuration:');
  console.log('   • AI eulogies: Using fake/demo content (no OpenAI needed)');
  console.log('   • File uploads: Using local storage in /public/uploads');
  console.log('   • Database: Please configure DATABASE_URL in .env.local');
  console.log('\n🚀 You can now run: npm run dev');
}

setupLocalEnv().catch(console.error);