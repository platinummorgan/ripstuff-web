import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // This API route will help us get the Google Client ID for the frontend
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  
  if (!clientId) {
    return NextResponse.json({ 
      error: 'Client ID not configured',
      env: process.env.NODE_ENV,
      available: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_'))
    }, { status: 500 });
  }
  
  return NextResponse.json({ 
    clientId,
    configured: true
  });
}