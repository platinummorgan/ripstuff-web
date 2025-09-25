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

  // Get OAuth credentials
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  
  if (!clientId || !clientSecret) {
    console.error('Missing OAuth credentials:', {
      hasClientId: !!clientId,
      hasSecret: !!clientSecret,
      clientIdRaw: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientIdLength: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.length,
      clientSecretLength: process.env.GOOGLE_CLIENT_SECRET?.length,
    });
    return NextResponse.redirect(new URL('/signin?error=oauth_config_error', request.url));
  }
  
  console.log('OAuth callback processing with valid credentials');

  try {
    // Exchange code for access token
    const redirectUri = new URL('/api/auth/callback/google', request.url).toString();
    console.log('Token exchange - using redirect URI:', redirectUri);
    console.log('Token exchange - client ID:', clientId);
    console.log('Token exchange - code length:', code.length);
    
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: new URL('/api/auth/callback/google', request.url).toString(),
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      const fullError = {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: tokens,
        redirectUri: redirectUri,
        requestUrl: request.url,
        clientIdExists: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        clientIdLength: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.length,
        clientIdTruncated: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.substring(0, 20) + '...',
        hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        clientSecretLength: process.env.GOOGLE_CLIENT_SECRET?.length,
        codeLength: code.length,
        codeTruncated: code.substring(0, 20) + '...',
      };
      
      console.error('Token exchange failed:', fullError);
      
      // For debugging, let's show the error in the URL
      const errorMsg = tokens?.error_description || tokens?.error || `HTTP ${tokenResponse.status}: ${tokenResponse.statusText}`;
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