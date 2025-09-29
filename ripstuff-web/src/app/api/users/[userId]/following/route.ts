import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    
    const following = await (prisma as any).userFollow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            picture: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to 50 following for performance
    });

    const users = following.map((follow: any) => follow.following);

    return Response.json({ users });
  } catch (error) {
    console.error('Get following error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}