import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    hasClientId: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    clientIdLength: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.length,
    clientIdFirst10: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.substring(0, 10),
    hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    clientSecretLength: process.env.GOOGLE_CLIENT_SECRET?.length,
    clientSecretFirst10: process.env.GOOGLE_CLIENT_SECRET?.substring(0, 10),
  });
}