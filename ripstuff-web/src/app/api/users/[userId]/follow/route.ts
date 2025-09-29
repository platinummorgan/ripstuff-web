import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { NotificationEmailService } from '@/lib/notification-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { userId } = params;
    
    // Prevent users from following themselves
    if (currentUser.id === userId) {
      return new Response('Cannot follow yourself', { status: 400 });
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return new Response('User not found', { status: 404 });
    }

    // Check if already following
    const existingFollow = await (prisma as any).userFollow.findFirst({
      where: {
        followerId: currentUser.id,
        followingId: userId,
      },
    });

    if (existingFollow) {
      return new Response('Already following this user', { status: 400 });
    }

    // Create follow relationship
    await (prisma as any).userFollow.create({
      data: {
        followerId: currentUser.id,
        followingId: userId,
      },
    });

    // Send follow notification (async, don't wait)
    try {
      // Check if target user wants follow notifications
      const targetUserPrefs = await prisma.notificationPreference.findUnique({
        where: { userId: userId },
      });

      if (targetUserPrefs?.emailOnNewFollower) {
        await NotificationEmailService.sendNewFollowerNotification(
          userId,
          targetUser.email,
          {
            followerName: currentUser.name || 'Anonymous User',
            followerProfileUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/user/${currentUser.id}`,
            profileUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/user/${userId}`,
          }
        );
      }
    } catch (notificationError) {
      console.error('Failed to send follow notification:', notificationError);
      // Don't fail the follow action if notification fails
    }

    return new Response('Successfully followed user', { status: 200 });
  } catch (error) {
    console.error('Follow user error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { userId } = params;

    // Find and delete the follow relationship
    const follow = await (prisma as any).userFollow.findFirst({
      where: {
        followerId: currentUser.id,
        followingId: userId,
      },
    });

    if (!follow) {
      return new Response('Not following this user', { status: 400 });
    }

    await (prisma as any).userFollow.delete({
      where: {
        id: follow.id,
      },
    });

    return new Response('Successfully unfollowed user', { status: 200 });
  } catch (error) {
    console.error('Unfollow user error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}