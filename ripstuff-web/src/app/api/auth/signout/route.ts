import { NextRequest, NextResponse } from 'next/server';
import { clearUserSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    clearUserSession();
    
    return NextResponse.json({
      success: true,
      message: 'Signed out successfully'
    });
    
  } catch (error) {
    console.error('Sign-out error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}