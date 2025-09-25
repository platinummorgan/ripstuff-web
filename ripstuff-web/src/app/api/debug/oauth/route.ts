import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  // Let's see exactly what we're working with
  const debugInfo = {
    hasClientId: !!clientId,
    clientId: clientId,
    hasClientSecret: !!clientSecret,
    clientSecretLength: clientSecret?.length,
    
    // Test the exact OAuth URL we're building
    testOAuthUrl: `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
      client_id: clientId || 'MISSING',
      redirect_uri: 'https://ripstuff.net/api/auth/callback/google',
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
    }).toString()}`,
    
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  };
  
  return NextResponse.json(debugInfo);
}