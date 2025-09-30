import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const title = searchParams.get('title') || 'Unknown Item';
  const cause = searchParams.get('cause') || 'Unknown cause';
  const cta = searchParams.get('cta') === 'true';
  const style = searchParams.get('style') || 'dark';

  // Determine cause of death for visual display
  const causeOfDeath = (() => {
    const lowerCause = cause.toLowerCase();
    if (lowerCause.includes('overload') || lowerCause.includes('system')) return '⚡ System Overload';
    if (lowerCause.includes('neglect') || lowerCause.includes('childhood')) return '💧 Childhood Neglect';
    if (lowerCause.includes('fabric') || lowerCause.includes('integrity')) return '💧 Fabric Failure';
    if (lowerCause.includes('structural') || lowerCause.includes('collapse')) return '⚡ Structural Collapse';
    if (lowerCause.includes('mechanical') || lowerCause.includes('failure')) return '🔥 Mechanical Failure';
    if (lowerCause.includes('wear') || lowerCause.includes('tear')) return '💧 Wear and Tear';
    return cause.includes('🔋') || cause.includes('⚡') || cause.includes('💧') || cause.includes('🔥') ? cause : '🔋 ' + cause;
  })();

  // Create professional SVG Twitter card (16:9 format) matching app design
  const svg = `
    <svg width="1200" height="675" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Professional gradient background -->
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1f2937;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#374151;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
        </linearGradient>
        
        <!-- Accent gradient -->
        <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#d97706;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f59e0b;stop-opacity:1" />
        </linearGradient>
        
        <!-- CTA button gradient -->
        <linearGradient id="ctaGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#fbbf24;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f59e0b;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="1200" height="675" fill="url(#bgGradient)"/>
      
      <!-- Decorative borders -->
      <rect x="30" y="30" width="1140" height="615" fill="none" stroke="#d97706" stroke-width="4" rx="12"/>
      <rect x="40" y="40" width="1120" height="595" fill="none" stroke="#f59e0b" stroke-width="2" rx="8" opacity="0.5"/>
      
      <!-- Main content area with professional background -->
      <rect x="80" y="80" width="1040" height="515" fill="rgba(0,0,0,0.3)" stroke="#d97706" stroke-width="1" stroke-opacity="0.5" rx="16"/>
      
      <!-- Decorative certificate icons -->
      <text x="150" y="180" font-family="sans-serif" font-size="60" fill="rgba(252,211,77,0.1)" text-anchor="middle">⚰️</text>
      <text x="1050" y="180" font-family="sans-serif" font-size="60" fill="rgba(252,211,77,0.1)" text-anchor="middle">🪦</text>
      
      <!-- Header -->
      <text x="600" y="150" font-family="serif" font-size="36" font-weight="bold" fill="#fcd34d" text-anchor="middle">
        Official Death Certificate
      </text>
      
      <!-- Deceased item title -->
      <text x="600" y="220" font-family="sans-serif" font-size="42" font-weight="bold" fill="white" text-anchor="middle">
        RIP: ${title.length > 25 ? title.substring(0, 25) + '...' : title}
      </text>
      
      <!-- Cause of death with enhanced styling -->
      <text x="600" y="280" font-family="sans-serif" font-size="24" fill="#d1d5db" text-anchor="middle">
        Cause of Death: ${causeOfDeath}
      </text>
      
      <!-- Date -->
      <text x="600" y="320" font-family="sans-serif" font-size="18" fill="#9ca3af" text-anchor="middle">
        Certified: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </text>
      
      <!-- Roast meter preview -->
      <text x="600" y="380" font-family="sans-serif" font-size="16" fill="#fcd34d" text-anchor="middle">
        ROAST METER: Beloved • Vote Condolences or Roasts
      </text>
      
      ${cta ? `
      <!-- Enhanced CTA button -->
      <rect x="400" y="430" width="400" height="70" fill="url(#ctaGradient)" rx="35" stroke="#d97706" stroke-width="2"/>
      <text x="600" y="475" font-family="sans-serif" font-size="26" font-weight="bold" fill="#000" text-anchor="middle">
        🪦 Create Your Memorial Free
      </text>
      ` : ''}
      
      <!-- Professional branding -->
      <text x="600" y="560" font-family="sans-serif" font-size="20" fill="#d97706" text-anchor="middle">
        Virtual Graveyard Registry • RipStuff.net
      </text>
      
      <text x="600" y="590" font-family="sans-serif" font-size="14" fill="#9ca3af" text-anchor="middle">
        Official Digital Death Certificates for Broken Things
      </text>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}