import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const title = searchParams.get('title') || 'Unknown Item';
  const category = searchParams.get('category') || 'MISC';
  const cause = searchParams.get('cause') || 'Unknown cause';
  const brand = searchParams.get('brand') === 'true';

  // Determine cause of death with emoji
  const causeOfDeath = (() => {
    const cat = category.toLowerCase();
    if (cat.includes('electronics') || cat.includes('gadget')) return '⚡ System Overload';
    if (cat.includes('toy')) return '💧 Childhood Neglect';
    if (cat.includes('clothing')) return '💧 Fabric Failure';
    if (cat.includes('furniture')) return '⚡ Structural Collapse';
    if (cat.includes('vehicle')) return '🔥 Mechanical Failure';
    if (cat.includes('accessory')) return '💧 Wear and Tear';
    return '🔋 Natural Obsolescence';
  })();

  // Create professional SVG grave card matching app design
  const svg = `
    <svg width="500" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Professional gradient matching death certificate -->
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1f2937;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#374151;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background with professional styling -->
      <rect width="500" height="400" fill="url(#bgGradient)"/>
      
      <!-- Decorative borders -->
      <rect x="15" y="15" width="470" height="370" fill="none" stroke="#d97706" stroke-width="4" rx="8"/>
      <rect x="25" y="25" width="450" height="350" fill="none" stroke="#f59e0b" stroke-width="2" rx="4" opacity="0.5"/>
      
      <!-- Content background -->
      <rect x="40" y="40" width="420" height="320" fill="rgba(0,0,0,0.3)" rx="6"/>
      
      <!-- Header with professional styling -->
      <text x="250" y="75" font-family="serif" font-size="24" font-weight="bold" fill="#fcd34d" text-anchor="middle">
        🪦 MEMORIAL CARD 🪦
      </text>
      
      <text x="250" y="95" font-family="sans-serif" font-size="12" fill="#d97706" text-anchor="middle">
        Virtual Graveyard Registry
      </text>
      
      <!-- Deceased name with proper styling -->
      <text x="250" y="140" font-family="sans-serif" font-size="22" font-weight="bold" fill="white" text-anchor="middle">
        ${title.length > 30 ? title.substring(0, 30) + '...' : title}
      </text>
      
      <!-- Category -->
      <text x="250" y="170" font-family="sans-serif" font-size="14" fill="#9ca3af" text-anchor="middle">
        ${category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </text>
      
      <!-- Cause of death with icon -->
      <text x="250" y="210" font-family="sans-serif" font-size="16" fill="#d1d5db" text-anchor="middle">
        Cause: ${causeOfDeath}
      </text>
      
      <!-- Date -->
      <text x="250" y="240" font-family="sans-serif" font-size="14" fill="#9ca3af" text-anchor="middle">
        Passed: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </text>
      
      <!-- Memorial message -->
      <text x="250" y="280" font-family="serif" font-size="18" fill="#fcd34d" text-anchor="middle" font-style="italic">
        "Gone but not forgotten"
      </text>
      
      <!-- RIP with enhanced styling -->
      <text x="250" y="320" font-family="serif" font-size="28" fill="#d97706" text-anchor="middle" font-weight="bold">
        R.I.P.
      </text>
      
      ${brand ? `
      <!-- Professional branding -->
      <text x="250" y="350" font-family="sans-serif" font-size="10" fill="#6b7280" text-anchor="middle">
        💭 Share memories at RipStuff.net
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