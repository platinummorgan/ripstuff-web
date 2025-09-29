import { NextRequest, NextResponse } from 'next/server';
import { getUserSession, getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get current user (checks session and database)
    const user = await getCurrentUser();
    
    if (user) {
      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture,
          isModerator: user.isModerator
        }
      });
    }

    // No user found
    return NextResponse.json({
      user: null
    });

  } catch (error) {
    console.error('Current user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}