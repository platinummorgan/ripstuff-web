import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const currentUser = await getCurrentUser();
    
    // Get follow counts
    const [followersCount, followingCount, isFollowing] = await Promise.all([
      (prisma as any).userFollow.count({
        where: { followingId: userId }
      }),
      (prisma as any).userFollow.count({
        where: { followerId: userId }
      }),
      currentUser ? (prisma as any).userFollow.findFirst({
        where: {
          followerId: currentUser.id,
          followingId: userId,
        },
      }) : null,
    ]);

    return Response.json({
      followersCount,
      followingCount,
      isFollowing: !!isFollowing,
    });
  } catch (error) {
    console.error('Get follow info error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}