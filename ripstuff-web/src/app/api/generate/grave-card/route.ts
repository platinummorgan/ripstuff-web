import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const title = searchParams.get('title') || 'Unknown Item';
  const category = searchParams.get('category') || 'MISC';
  const cause = searchParams.get('cause') || 'Unknown cause';
  const brand = searchParams.get('brand') === 'true';

  // Create SVG grave card (compact format)
  const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0f1419;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1a202c;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#8e7bff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="400" height="300" fill="url(#bg)" stroke="url(#accent)" stroke-width="2" rx="12"/>
      
      <!-- Header -->
      <text x="200" y="40" font-family="sans-serif" font-size="20" font-weight="bold" fill="#fff" text-anchor="middle">
        🪦 MEMORIAL CARD
      </text>
      
      <!-- Item name -->
      <text x="200" y="80" font-family="sans-serif" font-size="18" font-weight="bold" fill="#8e7bff" text-anchor="middle">
        ${title.length > 25 ? title.substring(0, 25) + '...' : title}
      </text>
      
      <!-- Cause -->
      <text x="200" y="120" font-family="sans-serif" font-size="14" fill="#ccc" text-anchor="middle">
        Cause: ${cause.length > 30 ? cause.substring(0, 30) + '...' : cause}
      </text>
      
      <!-- Date -->
      <text x="200" y="145" font-family="sans-serif" font-size="12" fill="#999" text-anchor="middle">
        ${new Date().toLocaleDateString()}
      </text>
      
      <!-- RIP -->
      <text x="200" y="200" font-family="serif" font-size="32" fill="#666" text-anchor="middle">
        R.I.P.
      </text>
      
      ${brand ? `
      <!-- Brand -->
      <text x="200" y="270" font-family="sans-serif" font-size="12" fill="#8e7bff" text-anchor="middle">
        Made with ❤️ at RipStuff.net
      </text>
      ` : ''}
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}