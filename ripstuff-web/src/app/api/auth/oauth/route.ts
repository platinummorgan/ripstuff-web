import { NextRequest, NextResponse } from 'next/server';
import { resolveDeviceHash } from '@/lib/device';

// Simple JWT decode function (without external dependencies)
function decodeJWT(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const payload = parts[1];
    // Add padding if needed for base64 decoding
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    const decoded = Buffer.from(paddedPayload, 'base64url').toString('utf8');
    return JSON.parse(decoded);
  } catch (error) {
    throw new Error('Failed to decode JWT');
  }
}

export async function POST(request: NextRequest) {
  try {
    const { provider, credential } = await request.json();
    
    if (!provider || !credential) {
      return NextResponse.json(
        { error: 'Provider and credential are required' }, 
        { status: 400 }
      );
    }

    let userInfo;
    
    // Handle different OAuth providers
    if (provider === 'google') {
      try {
        // Decode Google JWT token
        const decoded = decodeJWT(credential);
        
        userInfo = {
          email: decoded.email,
          name: decoded.name,
          picture: decoded.picture,
          provider: 'google',
          providerId: decoded.sub, // Google's user ID
        };
        
        // Basic email verification
        if (!decoded.email_verified) {
          return NextResponse.json(
            { error: 'Email not verified with Google' }, 
            { status: 400 }
          );
        }
        
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid Google credential' }, 
          { status: 400 }
        );
      }
    } else if (provider === 'facebook') {
      try {
        // For Facebook, credential should be the access token
        const userResponse = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${credential}`);
        
        if (!userResponse.ok) {
          throw new Error('Failed to get Facebook user info');
        }
        
        const userData = await userResponse.json();
        
        userInfo = {
          email: userData.email || `${userData.id}@facebook.temp`,
          name: userData.name,
          picture: userData.picture?.data?.url,
          provider: 'facebook',
          providerId: userData.id,
        };
        
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid Facebook credential' }, 
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Unsupported OAuth provider' }, 
        { status: 400 }
      );
    }

    const deviceHash = resolveDeviceHash();

    // TODO: Uncomment when Prisma client is regenerated
    // // Check if user already exists
    // let existingUser = await prisma.user.findUnique({
    //   where: { 
    //     provider_providerId: {
    //       provider: userInfo.provider,
    //       providerId: userInfo.providerId
    //     }
    //   }
    // });

    // // If user doesn't exist, create them
    // if (!existingUser) {
    //   existingUser = await prisma.user.create({
    //     data: {
    //       email: userInfo.email,
    //       name: userInfo.name,
    //       picture: userInfo.picture,
    //       provider: userInfo.provider,
    //       providerId: userInfo.providerId,
    //       deviceHash
    //     }
    //   });
    // } else {
    //   // Update device hash for existing user
    //   existingUser = await prisma.user.update({
    //     where: { id: existingUser.id },
    //     data: { deviceHash }
    //   });
    // }

    // Temporary response for development
    const user = {
      id: 'temp-oauth-id',
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture
    };

    // Set session cookie
    const response = NextResponse.json({
      user,
      isNewUser: true
    });

    // Set HTTP-only cookie for session
    response.cookies.set('rip_user_session', JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;

  } catch (error) {
    console.error('OAuth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}