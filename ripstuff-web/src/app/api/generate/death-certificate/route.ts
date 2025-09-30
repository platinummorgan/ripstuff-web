import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const title = searchParams.get('title') || 'Unknown Item';
  const category = searchParams.get('category') || 'MISC';
  const cause = searchParams.get('cause') || 'Unknown cause';
  const epitaph = searchParams.get('epitaph') || '';
  const watermark = searchParams.get('watermark') || '';

  // Determine cause of death based on category
  const causeOfDeath = (() => {
    const cat = category.toLowerCase();
    if (cat.includes('electronics') || cat.includes('gadget')) return '⚡ System Overload Failure';
    if (cat.includes('toy')) return '💧 Childhood Neglect Syndrome';
    if (cat.includes('clothing')) return '💧 Fabric Integrity Loss';
    if (cat.includes('furniture')) return '⚡ Structural Collapse';
    if (cat.includes('vehicle')) return '🔥 Mechanical Failure';
    if (cat.includes('accessory')) return '💧 Wear and Tear';
    return '🔋 Natural Wear and Obsolescence';
  })();

  // Create professional SVG death certificate matching real app design
  const svg = `
    <svg width="800" height="700" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Professional gradient background matching real certificate -->
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1f2937;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#374151;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Main background -->
      <rect width="800" height="700" fill="url(#bgGradient)"/>
      
      <!-- Decorative borders matching real certificate -->
      <rect x="20" y="20" width="760" height="660" fill="none" stroke="#d97706" stroke-width="8" rx="8"/>
      <rect x="32" y="32" width="736" height="636" fill="none" stroke="#f59e0b" stroke-width="4" rx="4" opacity="0.5"/>
      <rect x="44" y="44" width="712" height="612" fill="none" stroke="#fbbf24" stroke-width="1" rx="2" opacity="0.3"/>
      
      <!-- Header Section -->
      <text x="400" y="90" text-anchor="middle" font-family="serif" font-size="32" font-weight="bold" fill="#fcd34d">⚰️ Official Death Certificate ⚰️</text>
      <text x="400" y="120" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#d1d5db">Virtual Graveyard Registry • RipStuff.net</text>
      <text x="400" y="140" text-anchor="middle" font-family="monospace" font-size="12" fill="#d97706">Certificate #VG-${title.replace(/[^A-Z0-9]/gi, '').toUpperCase().substring(0, 8)}-${new Date().getFullYear()}</text>
      
      <!-- Main Content Section with proper background -->
      <rect x="60" y="170" width="680" height="90" fill="rgba(0,0,0,0.3)" stroke="#d97706" stroke-width="1" stroke-opacity="0.5" rx="8"/>
      
      <!-- Deceased Information Grid -->
      <text x="80" y="195" font-family="sans-serif" font-size="14" font-weight="bold" fill="#fcd34d">Deceased:</text>
      <text x="80" y="220" font-family="sans-serif" font-size="22" font-weight="bold" fill="white">${title}</text>
      <text x="320" y="220" font-family="sans-serif" font-size="14" fill="#9ca3af">Age: Recently Departed</text>
      
      <text x="420" y="195" font-family="sans-serif" font-size="14" font-weight="bold" fill="#fcd34d">Category:</text>
      <text x="420" y="220" font-family="sans-serif" font-size="18" fill="white">${category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</text>
      
      <!-- Date and Cause Section -->
      <rect x="60" y="280" width="680" height="80" fill="rgba(0,0,0,0.3)" stroke="#d97706" stroke-width="1" stroke-opacity="0.5" rx="8"/>
      
      <text x="80" y="305" font-family="sans-serif" font-size="14" font-weight="bold" fill="#fcd34d">Date of Passing:</text>
      <text x="80" y="330" font-family="sans-serif" font-size="18" fill="white">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</text>
      
      <text x="420" y="305" font-family="sans-serif" font-size="14" font-weight="bold" fill="#fcd34d">Cause of Death:</text>
      <text x="420" y="330" font-family="sans-serif" font-size="18" fill="white">${causeOfDeath}</text>
      
      <!-- Roast Meter Section (Marketing Visual) -->
      <rect x="60" y="380" width="680" height="100" fill="rgba(0,0,0,0.3)" stroke="#d97706" stroke-width="1" stroke-opacity="0.5" rx="8"/>
      
      <text x="80" y="405" font-family="sans-serif" font-size="14" font-weight="bold" fill="#fcd34d">ROAST METER — CONDOLENCES VS ROASTS</text>
      
      <!-- Progress bar background -->
      <rect x="80" y="425" width="640" height="24" fill="#374151" rx="12"/>
      <!-- Progress bar fill (showing "Beloved" status) -->
      <rect x="80" y="425" width="128" height="24" fill="#22c55e" rx="12"/>
      <!-- Center divider -->
      <rect x="398" y="425" width="4" height="24" fill="rgba(255,255,255,0.3)"/>
      
      <text x="140" y="442" font-family="sans-serif" font-size="12" fill="#22c55e">Condolences</text>
      <text x="600" y="442" font-family="sans-serif" font-size="12" fill="#ef4444" text-anchor="end">Roasts</text>
      
      <text x="400" y="470" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="bold" fill="#22c55e">Beloved</text>
      
      <!-- Epitaph Section -->
      <rect x="60" y="500" width="680" height="80" fill="rgba(0,0,0,0.3)" stroke="#d97706" stroke-width="1" stroke-opacity="0.5" rx="8"/>
      
      <text x="80" y="525" font-family="sans-serif" font-size="14" font-weight="bold" fill="#fcd34d">Epitaph:</text>
      <text x="80" y="550" font-family="sans-serif" font-size="14" fill="#d1d5db" font-style="italic">
        "${epitaph.length > 80 ? epitaph.substring(0, 80) + '...' : epitaph || 'A cherished memory that will live on forever.'}"
      </text>
      
      <!-- Call to Action Section -->
      <rect x="60" y="600" width="680" height="30" fill="none" stroke="#d97706" stroke-width="1" stroke-opacity="0.3"/>
      <text x="400" y="620" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#fcd34d">💭 Vote Condolences or Roasts at RipStuff.net</text>
      
      <!-- Footer Certification -->
      <text x="400" y="655" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#fcd34d">Certified by RipStuff Virtual Graveyard Authority</text>
      <text x="400" y="675" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#9ca3af">Generated on ${new Date().toLocaleDateString()}</text>
      
      ${watermark ? `
      <text x="720" y="40" font-family="sans-serif" font-size="10" fill="#555" text-anchor="end" opacity="0.7">
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