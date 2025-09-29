import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { certificateDataUrl, graveSlug } = await request.json();
    
    if (!certificateDataUrl || !graveSlug) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    // Convert data URL to buffer
    const base64Data = certificateDataUrl.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // For now, we'll return the data URL directly
    // In production, you might want to upload to a CDN or storage service
    
    // Generate a temporary public URL (this is a simplified approach)
    const publicUrl = `/api/certificates/image/${graveSlug}`;
    
    return NextResponse.json({ 
      success: true, 
      imageUrl: publicUrl,
      dataUrl: certificateDataUrl 
    });

  } catch (error) {
    console.error('Error generating certificate:', error);
    return NextResponse.json({ error: 'Failed to generate certificate' }, { status: 500 });
  }
}