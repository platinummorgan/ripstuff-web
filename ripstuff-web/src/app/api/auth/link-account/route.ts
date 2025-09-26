import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Get the currently logged-in user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { provider, providerId } = await request.json();

    if (!provider || !providerId) {
      return NextResponse.json({ error: 'Provider and provider ID are required' }, { status: 400 });
    }

    // Check if this OAuth account is already linked to another user
    const existingAccount = await prisma.oAuthAccount.findUnique({
      where: {
        provider_providerId: {
          provider,
          providerId,
        },
      },
      include: {
        user: true,
      },
    });

    if (existingAccount) {
      if (existingAccount.userId === currentUser.id) {
        return NextResponse.json({ message: 'Account already linked' });
      } else {
        return NextResponse.json({ 
          error: 'This account is already linked to another user' 
        }, { status: 400 });
      }
    }

    // Check if there's a separate User record for this OAuth account that we need to merge
    const separateUser = await prisma.user.findUnique({
      where: {
        provider_providerId: {
          provider,
          providerId,
        },
      },
    });

    if (separateUser && separateUser.id !== currentUser.id) {
      // We have a separate user account that needs to be merged
      // For now, we'll just create the OAuth link and keep both user records
      // TODO: Implement full account merging (graves, reactions, etc.)
      
      await prisma.oAuthAccount.create({
        data: {
          userId: currentUser.id,
          provider,
          providerId,
          email: separateUser.email,
          name: separateUser.name,
          picture: separateUser.picture,
        },
      });

      return NextResponse.json({ 
        message: 'Account linked successfully',
        warning: 'Previous account data kept separate - contact support to merge content'
      });
    }

    // Create the OAuth account link
    const oauthAccount = await prisma.oAuthAccount.create({
      data: {
        userId: currentUser.id,
        provider,
        providerId,
      },
    });

    return NextResponse.json({ 
      message: 'Account linked successfully',
      oauthAccount: {
        provider: oauthAccount.provider,
        createdAt: oauthAccount.createdAt,
      }
    });

  } catch (error) {
    console.error('Account linking error:', error);
    return NextResponse.json({ error: 'Failed to link account' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get linked accounts for current user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const linkedAccounts = await prisma.oAuthAccount.findMany({
      where: {
        userId: currentUser.id,
      },
      select: {
        provider: true,
        name: true,
        picture: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json({ linkedAccounts });

  } catch (error) {
    console.error('Get linked accounts error:', error);
    return NextResponse.json({ error: 'Failed to get linked accounts' }, { status: 500 });
  }
}