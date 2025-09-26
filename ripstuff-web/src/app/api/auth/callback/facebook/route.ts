import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { setUserSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Check for Facebook OAuth errors
  if (error) {
    console.error('Facebook OAuth error:', error);
    return NextResponse.redirect(new URL('/signin?error=oauth_error', request.url));
  }

  if (!code) {
    console.error('No authorization code received from Facebook');
    return NextResponse.redirect(new URL('/signin?error=no_code', request.url));
  }

  // Check environment variables
  const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;

  if (!appId || !appSecret) {
    console.error('Facebook OAuth configuration missing:', {
      hasAppId: !!appId,
      hasAppSecret: !!appSecret,
    });
    return NextResponse.redirect(new URL('/signin?error=oauth_config_error', request.url));
  }

  console.log('Facebook OAuth callback processing with valid credentials');

  try {
    // Exchange code for access token
    const redirectUri = new URL('/api/auth/callback/facebook', request.url).toString();
    console.log('Token exchange - using redirect URI:', redirectUri);
    
    const tokenResponse = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: appId,
        client_secret: appSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokens = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokens);
      const errorMsg = tokens?.error_description || tokens?.error || `HTTP ${tokenResponse.status}: ${tokenResponse.statusText}`;
      return NextResponse.redirect(new URL(`/signin?error=token_error&details=${encodeURIComponent(errorMsg)}`, request.url));
    }

    // Get user info from Facebook
    const userResponse = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${tokens.access_token}`);

    const userInfo = await userResponse.json();

    if (!userResponse.ok) {
      console.error('User info failed:', userInfo);
      return NextResponse.redirect(new URL('/signin?error=user_info_error', request.url));
    }

    // Create or find user in database
    const existingUser = await prisma.user.findUnique({
      where: {
        provider_providerId: {
          provider: 'facebook',
          providerId: userInfo.id,
        },
      },
    });

    let user;
    if (existingUser) {
      user = existingUser;
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: userInfo.email || `${userInfo.id}@facebook.temp`,
          name: userInfo.name,
          picture: userInfo.picture?.data?.url,
          provider: 'facebook',
          providerId: userInfo.id,
          isModerator: false,
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
    console.error('Facebook OAuth callback error:', error);
    return NextResponse.redirect(new URL('/signin?error=server_error', request.url));
  }
}