import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { setUserSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect(new URL('/signin?error=oauth_error', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/signin?error=no_code', request.url));
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: 'https://ripstuff.net/api/auth/callback/google',
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: tokens,
        redirectUri: 'https://ripstuff.net/api/auth/callback/google',
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        clientSecretLength: process.env.GOOGLE_CLIENT_SECRET?.length
      });
      
      // For debugging, let's show the error in the URL
      const errorMsg = tokens?.error_description || tokens?.error || 'Unknown error';
      return NextResponse.redirect(new URL(`/signin?error=token_error&details=${encodeURIComponent(errorMsg)}`, request.url));
    }

    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const userInfo = await userResponse.json();

    if (!userResponse.ok) {
      console.error('User info failed:', userInfo);
      return NextResponse.redirect(new URL('/signin?error=user_info_error', request.url));
    }

    // Create or find user in database
    const existingUser = await prisma.user.findUnique({
      where: {
        provider_providerId: {
          provider: 'google',
          providerId: userInfo.id,
        },
      },
    });

    let user;
    if (existingUser) {
      // For existing users, only update email and picture
      // Never update the name after the initial creation to preserve custom names
      user = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          picture: userInfo.picture,
          email: userInfo.email, // Update email in case it changed
          // Explicitly NOT updating name to preserve user customization
        },
        select: {
          id: true,
          email: true,
          name: true,
          picture: true,
          isModerator: true,
        },
      });
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          provider: 'google',
          providerId: userInfo.id,
        },
        select: {
          id: true,
          email: true,
          name: true,
          picture: true,
          isModerator: true,
        },
      });
    }

    // Set session with database user data
    setUserSession({
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      picture: user.picture || undefined,
      isModerator: user.isModerator || false,
    });

    // Redirect to overworld
    return NextResponse.redirect(new URL('/overworld', request.url));

  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL('/signin?error=server_error', request.url));
  }
}