import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json(
      { error: 'Username parameter is required' }, 
      { status: 400 }
    );
  }

  try {
    const cleanUsername = username.trim().toLowerCase();
    
    // Validate username format
    if (cleanUsername.length < 2 || cleanUsername.length > 20) {
      return NextResponse.json(
        { available: false, error: 'Username must be 2-20 characters long' }
      );
    }

    if (!/^[a-z0-9_-]+$/.test(cleanUsername)) {
      return NextResponse.json(
        { available: false, error: 'Username can only contain letters, numbers, hyphens, and underscores' }
      );
    }

    // Check if username exists - this will fail until Prisma generates
    // const existingUser = await prisma.user.findUnique({
    //   where: { username: cleanUsername }
    // });

    // Temporary placeholder - always return available for now
    return NextResponse.json({
      available: true,
      username: cleanUsername
    });

  } catch (error) {
    console.error('Username check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}