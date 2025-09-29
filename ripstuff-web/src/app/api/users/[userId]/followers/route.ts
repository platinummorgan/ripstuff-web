import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    
    const followers = await (prisma as any).userFollow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            picture: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to 50 followers for performance
    });

    const users = followers.map((follow: any) => follow.follower);

    return Response.json({ users });
  } catch (error) {
    console.error('Get followers error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}