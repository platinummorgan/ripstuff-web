import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const title = searchParams.get('title') || 'Unknown Item';
  const category = searchParams.get('category') || 'MISC';
  const cause = searchParams.get('cause') || 'Unknown cause';
  const epitaph = searchParams.get('epitaph') || '';
  const watermark = searchParams.get('watermark') || '';

  // Create SVG death certificate
  const svg = `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#2d2d2d;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="800" height="600" fill="url(#bg)" stroke="#444" stroke-width="4" rx="12"/>
      
      <!-- Header -->
      <text x="400" y="60" font-family="serif" font-size="36" font-weight="bold" fill="#fff" text-anchor="middle">
        ⚰️ DEATH CERTIFICATE ⚰️
      </text>
      
      <!-- Border decoration -->
      <rect x="50" y="90" width="700" height="420" fill="none" stroke="#666" stroke-width="2" rx="8"/>
      <rect x="60" y="100" width="680" height="400" fill="none" stroke="#444" stroke-width="1" rx="4"/>
      
      <!-- Content -->
      <text x="400" y="160" font-family="sans-serif" font-size="24" font-weight="bold" fill="#ff6b6b" text-anchor="middle">
        ${title.length > 30 ? title.substring(0, 30) + '...' : title}
      </text>
      
      <text x="100" y="220" font-family="sans-serif" font-size="18" fill="#ccc">
        Cause of Death: ${cause.length > 40 ? cause.substring(0, 40) + '...' : cause}
      </text>
      
      <text x="100" y="260" font-family="sans-serif" font-size="18" fill="#ccc">
        Category: ${category.replace('_', ' ')}
      </text>
      
      <text x="100" y="300" font-family="sans-serif" font-size="16" fill="#999">
        Time of Death: ${new Date().toLocaleDateString()}
      </text>
      
      ${epitaph ? `
      <text x="100" y="360" font-family="serif" font-size="16" fill="#aaa" font-style="italic">
        "${epitaph.length > 60 ? epitaph.substring(0, 60) + '...' : epitaph}"
      </text>
      ` : ''}
      
      <!-- RIP Symbol -->
      <text x="400" y="450" font-family="serif" font-size="48" fill="#666" text-anchor="middle">
        🪦 R.I.P. 🪦
      </text>
      
      ${watermark ? `
      <text x="720" y="580" font-family="sans-serif" font-size="14" fill="#555" text-anchor="end">
        ${watermark}
      </text>
      ` : ''}
    </svg>
  `;

  // Convert SVG to response
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}