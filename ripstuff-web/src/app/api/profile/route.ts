import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, setUserSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PATCH(request: NextRequest) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json(
        { message: 'Not authenticated' }, 
        { status: 401 }
      );
    }

    const { name } = await request.json();
    
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { message: 'Name is required and must be a string' }, 
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    if (trimmedName.length === 0 || trimmedName.length > 50) {
      return NextResponse.json(
        { message: 'Name must be between 1 and 50 characters' }, 
        { status: 400 }
      );
    }

    // Check if user.id is a valid UUID or if we need to look up by provider ID
    let user;
    try {
      console.log('Attempting to update user with ID:', sessionUser.id);
      
      // Try to update with the session user ID (assuming it's a UUID)
      user = await prisma.user.update({
        where: { id: sessionUser.id },
        data: { name: trimmedName },
        select: {
          id: true,
          email: true,
          name: true,
          picture: true,
          isModerator: true,
        },
      });
      
      console.log('Successfully updated user:', user);
    } catch (error: any) {
      console.log('Update failed with error:', error.code, error.message);
      
      if (error.code === 'P2023' || error.code === 'P2025') {
        // Invalid UUID format or record not found - look up by email and provider info instead
        console.log('Looking up user by email:', sessionUser.email);
        
        user = await prisma.user.findFirst({
          where: {
            email: sessionUser.email,
            provider: 'google',
          },
        });

        if (!user) {
          console.log('User not found in database');
          return NextResponse.json(
            { message: 'User not found in database' }, 
            { status: 404 }
          );
        }

        console.log('Found user by email:', user.id);

        // Update with correct database UUID
        user = await prisma.user.update({
          where: { id: user.id },
          data: { name: trimmedName },
          select: {
            id: true,
            email: true,
            name: true,
            picture: true,
            isModerator: true,
          },
        });

        console.log('Updated user with correct ID:', user);

        // Update session cookie with correct database UUID
        setUserSession({
          id: user.id,
          email: user.email,
          name: user.name || undefined,
          picture: user.picture || undefined,
          isModerator: user.isModerator,
        });
        
        console.log('Updated session cookie');
      } else {
        throw error;
      }
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        isModerator: user.isModerator,
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({
        user: null
      });
    }

    // Try to get the user from database by session ID first
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: sessionUser.id },
        select: {
          id: true,
          email: true,
          name: true,
          picture: true,
          isModerator: true,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2023') {
        // Invalid UUID - look up by email and provider
        user = await prisma.user.findFirst({
          where: {
            email: sessionUser.email,
            provider: 'google',
          },
          select: {
            id: true,
            email: true,
            name: true,
            picture: true,
            isModerator: true,
          },
        });

        if (user) {
          // Update session cookie with correct UUID
          setUserSession({
            id: user.id,
            email: user.email,
            name: user.name || undefined,
            picture: user.picture || undefined,
            isModerator: user.isModerator,
          });
        }
      }
    }

    if (!user) {
      // Fallback to session user data
      return NextResponse.json({
        user: {
          id: sessionUser.id,
          email: sessionUser.email,
          name: sessionUser.name,
          picture: sessionUser.picture,
          isModerator: sessionUser.isModerator || false,
        },
      });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        isModerator: user.isModerator,
      },
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}