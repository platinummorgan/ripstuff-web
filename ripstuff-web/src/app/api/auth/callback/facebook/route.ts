import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { setUserSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const linking = searchParams.get('linking'); // Check if this is a linking request

  // Check for Facebook OAuth errors
  if (error) {
    console.error('Facebook OAuth error:', error);
    const redirectUrl = linking ? '/profile?error=oauth_error' : '/signin?error=oauth_error';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  if (!code) {
    console.error('No authorization code received from Facebook');
    const redirectUrl = linking ? '/profile?error=no_code' : '/signin?error=no_code';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
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
      const errorMsg = tokens?.error_description || tokens?.error || JSON.stringify(tokens) || `HTTP ${tokenResponse.status}: ${tokenResponse.statusText}`;
      const redirectUrl = linking ? '/profile' : '/signin';
      return NextResponse.redirect(new URL(`${redirectUrl}?error=token_error&details=${encodeURIComponent(errorMsg)}`, request.url));
    }

    // Get user info from Facebook - only requesting fields we have permission for
    const userResponse = await fetch(`https://graph.facebook.com/me?fields=id,name,picture&access_token=${tokens.access_token}`);

    const userInfo = await userResponse.json();

    if (!userResponse.ok) {
      console.error('User info failed:', userInfo);
      const redirectUrl = linking ? '/profile?error=user_info_error' : '/signin?error=user_info_error';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    console.log('Facebook user info received:', {
      id: userInfo.id,
      name: userInfo.name,
      hasEmail: !!userInfo.email,
      hasPicture: !!userInfo.picture
    });

    // Handle account linking flow
    if (linking === 'true' || state === 'linking') {
      // This is an account linking request - check if user is already logged in
      const { getCurrentUser } = await import('@/lib/auth');
      const currentUser = await getCurrentUser();
      
      if (!currentUser) {
        return NextResponse.redirect(new URL('/profile?error=not_logged_in', request.url));
      }

      // Check if this Facebook account is already linked to any user
      const existingAccount = await prisma.oAuthAccount.findUnique({
        where: {
          provider_providerId: {
            provider: 'facebook',
            providerId: userInfo.id,
          },
        },
      });

      if (existingAccount) {
        if (existingAccount.userId === currentUser.id) {
          return NextResponse.redirect(new URL('/profile?message=already_linked', request.url));
        } else {
          return NextResponse.redirect(new URL('/profile?error=account_already_linked', request.url));
        }
      }

      // Link the Facebook account to the current user
      await prisma.oAuthAccount.create({
        data: {
          userId: currentUser.id,
          provider: 'facebook',
          providerId: userInfo.id,
          email: userInfo.email || null,
          name: userInfo.name,
          picture: userInfo.picture?.data?.url,
        },
      });

      return NextResponse.redirect(new URL('/profile?message=facebook_linked', request.url));
    }

    // Create or find user in database (regular sign-in flow)
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
      // Create new user - use a unique placeholder email since we don't have email permission
      user = await prisma.user.create({
        data: {
          email: userInfo.email || `facebook-${userInfo.id}@ripstuff.local`,
          name: userInfo.name || 'Facebook User',
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