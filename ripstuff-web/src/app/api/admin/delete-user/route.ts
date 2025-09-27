import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
  try {
    // Check if user is authenticated and is a moderator
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!currentUser.isModerator) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider');
    const providerId = searchParams.get('providerId');
    const email = searchParams.get('email');
    const userId = searchParams.get('userId');

    // Need at least one identifier
    if (!provider && !providerId && !email && !userId) {
      return NextResponse.json({ 
        error: 'Must provide at least one identifier: provider+providerId, email, or userId' 
      }, { status: 400 });
    }

    // Find the user to delete
    let userToDelete;
    
    if (userId) {
      userToDelete = await prisma.user.findUnique({
        where: { id: userId }
      });
    } else if (email) {
      userToDelete = await prisma.user.findUnique({
        where: { email }
      });
    } else if (provider && providerId) {
      userToDelete = await prisma.user.findUnique({
        where: {
          provider_providerId: {
            provider,
            providerId,
          },
        }
      });
    }

    if (!userToDelete) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent deletion of self
    if (userToDelete.id === currentUser.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    // Get linked OAuth accounts count
    const oauthAccountCount = await prisma.oAuthAccount.count({
      where: { userId: userToDelete.id }
    });

    // Get some info about what will be deleted (only if deviceHash exists)
    let graveCount = 0;
    let reactionCount = 0;
    
    if (userToDelete.deviceHash) {
      graveCount = await prisma.grave.count({
        where: { creatorDeviceHash: userToDelete.deviceHash }
      });

      reactionCount = await prisma.reactionEvent.count({
        where: { deviceHash: userToDelete.deviceHash }
      });
    }

    // Delete the user (this will cascade to oauth_accounts)
    // Note: We're not deleting graves/reactions by design - they remain but become anonymous
    await prisma.user.delete({
      where: { id: userToDelete.id }
    });

    return NextResponse.json({ 
      message: 'User deleted successfully',
      deletedUser: {
        id: userToDelete.id,
        email: userToDelete.email,
        name: userToDelete.name,
        provider: userToDelete.provider,
        providerId: userToDelete.providerId,
        linkedAccounts: oauthAccountCount,
      },
      impact: {
        gravesCreated: graveCount,
        reactionsGiven: reactionCount,
        note: 'Graves and reactions remain but become anonymous'
      }
    });

  } catch (error) {
    console.error('User deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}

// Also support POST for easier testing/usage
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is a moderator
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!currentUser.isModerator) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { provider, providerId, email, userId } = await request.json();

    // Need at least one identifier
    if (!provider && !providerId && !email && !userId) {
      return NextResponse.json({ 
        error: 'Must provide at least one identifier: provider+providerId, email, or userId' 
      }, { status: 400 });
    }

    // Find the user to delete
    let userToDelete;
    
    if (userId) {
      userToDelete = await prisma.user.findUnique({
        where: { id: userId }
      });
    } else if (email) {
      userToDelete = await prisma.user.findUnique({
        where: { email }
      });
    } else if (provider && providerId) {
      userToDelete = await prisma.user.findUnique({
        where: {
          provider_providerId: {
            provider,
            providerId,
          },
        }
      });
    }

    if (!userToDelete) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent deletion of self
    if (userToDelete.id === currentUser.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    // Get linked OAuth accounts count
    const oauthAccountCount = await prisma.oAuthAccount.count({
      where: { userId: userToDelete.id }
    });

    // Get some info about what will be deleted (only if deviceHash exists)
    let graveCount = 0;
    let reactionCount = 0;
    
    if (userToDelete.deviceHash) {
      graveCount = await prisma.grave.count({
        where: { creatorDeviceHash: userToDelete.deviceHash }
      });

      reactionCount = await prisma.reactionEvent.count({
        where: { deviceHash: userToDelete.deviceHash }
      });
    }

    // Delete the user (this will cascade to oauth_accounts)
    // Note: We're not deleting graves/reactions by design - they remain but become anonymous
    await prisma.user.delete({
      where: { id: userToDelete.id }
    });

    return NextResponse.json({ 
      message: 'User deleted successfully',
      deletedUser: {
        id: userToDelete.id,
        email: userToDelete.email,
        name: userToDelete.name,
        provider: userToDelete.provider,
        providerId: userToDelete.providerId,
        linkedAccounts: oauthAccountCount,
      },
      impact: {
        gravesCreated: graveCount,
        reactionsGiven: reactionCount,
        note: 'Graves and reactions remain but become anonymous'
      }
    });

  } catch (error) {
    console.error('User deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
