import { NextRequest, NextResponse } from 'next/server';
import { setUserSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    console.error('Facebook OAuth error:', error);
    return NextResponse.redirect(new URL('/signin?error=oauth_error', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/signin?error=no_code', request.url));
  }

  try {
    // Exchange code for access token (updated with correct environment variables)
    const tokenResponse = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.FACEBOOK_APP_ID!,
        client_secret: process.env.FACEBOOK_APP_SECRET!,
        code,
        redirect_uri: `${request.nextUrl.origin}/api/auth/callback/facebook`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      throw new Error(tokenData.error.message);
    }

    // Get user info from Facebook
    const userResponse = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${tokenData.access_token}`);
    
    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const userData = await userResponse.json();

    // TODO: Save user to database when Prisma is fully configured
    // For now, create temporary user object
    const user = {
      id: `facebook_${userData.id}`,
      email: userData.email || `${userData.id}@facebook.temp`,
      name: userData.name,
      picture: userData.picture?.data?.url,
      provider: 'facebook',
      providerId: userData.id,
    };

    // Set session
    setUserSession({
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    });

    // Redirect to overworld
    return NextResponse.redirect(new URL('/overworld', request.url));

  } catch (error) {
    console.error('Facebook OAuth callback error:', error);
    return NextResponse.redirect(new URL('/signin?error=server_error', request.url));
  }
}