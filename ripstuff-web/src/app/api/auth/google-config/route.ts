import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // This API route will help us get the Google Client ID for the frontend
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  
  // Debug the actual values
  const debugInfo = {
    clientIdExists: 'NEXT_PUBLIC_GOOGLE_CLIENT_ID' in process.env,
    clientIdValue: clientId,
    clientIdLength: clientId?.length,
    clientIdType: typeof clientId,
    env: process.env.NODE_ENV,
    available: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')),
    allEnvKeys: Object.keys(process.env).length
  };
  
  if (!clientId || clientId.trim() === '') {
    return NextResponse.json({ 
      error: 'Client ID not configured',
      debug: debugInfo
    }, { status: 500 });
  }
  
  return NextResponse.json({ 
    clientId,
    configured: true,
    debug: debugInfo
  });
}