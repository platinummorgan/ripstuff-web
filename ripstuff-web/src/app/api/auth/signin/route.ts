import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveDeviceHash } from '@/lib/device';
import { setUserSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();
    
    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: 'Username is required' }, 
        { status: 400 }
      );
    }

    // Validate username format
    const cleanUsername = username.trim().toLowerCase();
    if (cleanUsername.length < 2 || cleanUsername.length > 20) {
      return NextResponse.json(
        { error: 'Username must be 2-20 characters long' }, 
        { status: 400 }
      );
    }

    if (!/^[a-z0-9_-]+$/.test(cleanUsername)) {
      return NextResponse.json(
        { error: 'Username can only contain letters, numbers, hyphens, and underscores' }, 
        { status: 400 }
      );
    }

    // Get device hash
    const deviceHash = resolveDeviceHash();

    // TODO: Uncomment when Prisma client is regenerated
    // // Check if user already exists with this device
    // const existingUser = await prisma.user.findFirst({
    //   where: { deviceHash }
    // });

    // if (existingUser) {
    //   // User exists, set session and return
    //   const user = {
    //     id: existingUser.id,
    //     username: existingUser.username,
    //     deviceHash: existingUser.deviceHash
    //   };
    //   setUserSession(user);
    //   return NextResponse.json({
    //     user: {
    //       id: existingUser.id,
    //       username: existingUser.username
    //     },
    //     isNewUser: false
    //   });
    // }

    // // Check if username is available
    // const usernameExists = await prisma.user.findUnique({
    //   where: { username: cleanUsername }
    // });

    // if (usernameExists) {
    //   return NextResponse.json(
    //     { error: 'Username is already taken' }, 
    //     { status: 409 }
    //   );
    // }

    // // Create new user
    // const newUser = await prisma.user.create({
    //   data: {
    //     username: cleanUsername,
    //     deviceHash
    //   }
    // });

    // const user = {
    //   id: newUser.id,
    //   username: newUser.username,
    //   deviceHash: newUser.deviceHash
    // };
    // setUserSession(user);

    // return NextResponse.json({
    //   user: {
    //     id: newUser.id,
    //     username: newUser.username
    //   },
    //   isNewUser: true
    // });

    // Temporary placeholder response
    const user = {
      id: 'temp-id',
      email: `${cleanUsername}@temp.local`, // Temporary email format
      name: cleanUsername,
    };
    setUserSession(user);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name
      },
      isNewUser: true
    });

  } catch (error) {
    console.error('Sign-in error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}