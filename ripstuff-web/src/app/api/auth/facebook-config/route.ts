import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // This API route will help us get the Facebook App ID for the frontend
  const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
  
  // Debug the actual values
  const debugInfo = {
    appIdExists: 'NEXT_PUBLIC_FACEBOOK_APP_ID' in process.env,
    appIdValue: appId,
    appIdLength: appId?.length,
    appIdType: typeof appId,
    env: process.env.NODE_ENV,
    available: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')),
    allEnvKeys: Object.keys(process.env).length
  };
  
  if (!appId || appId.trim() === '') {
    return NextResponse.json({ 
      error: 'Facebook App ID not configured',
      debug: debugInfo
    }, { status: 500 });
  }
  
  return NextResponse.json({ 
    appId,
    configured: true,
    debug: debugInfo
  });
}