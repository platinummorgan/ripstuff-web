import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const title = searchParams.get('title') || 'Unknown Item';
  const cause = searchParams.get('cause') || 'Unknown cause';
  const cta = searchParams.get('cta') === 'true';
  const style = searchParams.get('style') || 'dark';

  // Create SVG Twitter card (16:9 format)
  const svg = `
    <svg width="1200" height="675" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0f1419;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#1a202c;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0f1419;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#8e7bff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="1200" height="675" fill="url(#bg)"/>
      
      <!-- Top accent bar -->
      <rect width="1200" height="8" fill="url(#accent)"/>
      
      <!-- Main content area -->
      <rect x="100" y="100" width="1000" height="475" fill="rgba(255,255,255,0.02)" stroke="rgba(142,123,255,0.3)" stroke-width="2" rx="16"/>
      
      <!-- Skull emoji background -->
      <text x="900" y="400" font-family="sans-serif" font-size="200" fill="rgba(255,255,255,0.05)" text-anchor="middle">
        💀
      </text>
      
      <!-- Title -->
      <text x="600" y="200" font-family="sans-serif" font-size="48" font-weight="bold" fill="#fff" text-anchor="middle">
        RIP ${title.length > 20 ? title.substring(0, 20) + '...' : title}
      </text>
      
      <!-- Subtitle -->
      <text x="600" y="280" font-family="sans-serif" font-size="28" fill="#8e7bff" text-anchor="middle">
        Death Certificate Generator
      </text>
      
      <!-- Cause -->
      <text x="600" y="340" font-family="sans-serif" font-size="20" fill="#ccc" text-anchor="middle">
        Cause: ${cause.length > 40 ? cause.substring(0, 40) + '...' : cause}
      </text>
      
      ${cta ? `
      <!-- CTA -->
      <rect x="400" y="420" width="400" height="60" fill="url(#accent)" rx="30"/>
      <text x="600" y="460" font-family="sans-serif" font-size="24" font-weight="bold" fill="#fff" text-anchor="middle">
        Make Your Own Free 🪦
      </text>
      ` : ''}
      
      <!-- Brand -->
      <text x="600" y="620" font-family="sans-serif" font-size="18" fill="#8e7bff" text-anchor="middle">
        RipStuff.net - Free Death Certificates for Broken Things
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