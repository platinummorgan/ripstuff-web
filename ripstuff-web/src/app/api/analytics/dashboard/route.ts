import { NextRequest } from "next/server";
import { json, internalError } from "@/lib/http";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Get total count of graves
    const totalGraves = await prisma.grave.count({
      where: { status: "APPROVED" }
    });

    // Get graves created today
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const gravesToday = await prisma.grave.count({
      where: {
        status: "APPROVED",
        createdAt: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    });

    // Get total reactions (simulating "shares")
    const totalReactions = await prisma.grave.aggregate({
      where: { status: "APPROVED" },
      _sum: {
        heartCount: true,
        candleCount: true,
        roseCount: true,
        lolCount: true
      }
    });

    const totalShares = (totalReactions._sum.heartCount || 0) + 
                       (totalReactions._sum.candleCount || 0) + 
                       (totalReactions._sum.roseCount || 0) + 
                       (totalReactions._sum.lolCount || 0);

    // Get top categories
    const categoryStats = await prisma.grave.groupBy({
      by: ['category'],
      where: { status: "APPROVED" },
      _count: { category: true },
      orderBy: { _count: { category: 'desc' } },
      take: 5
    });

    // Get most popular graves (viral content)
    const viralContent = await prisma.grave.findMany({
      where: { status: "APPROVED" },
      select: {
        id: true,
        title: true,
        category: true,
        heartCount: true,
        candleCount: true,
        roseCount: true,
        lolCount: true,
        createdAt: true
      },
      orderBy: [
        { heartCount: 'desc' },
        { candleCount: 'desc' },
        { roseCount: 'desc' },
        { lolCount: 'desc' }
      ],
      take: 5
    });

    // Calculate total reactions for each viral grave
    const viralWithReactions = viralContent.map(grave => {
      const totalReactions = grave.heartCount + grave.candleCount + grave.roseCount + grave.lolCount;
      return {
        id: grave.id,
        title: grave.title,
        category: grave.category,
        shares: totalReactions,
        views: Math.floor(totalReactions * 3.2), // Estimate views as 3.2x shares
        createdAt: grave.createdAt
      };
    }).filter(grave => grave.shares > 0); // Only include graves with reactions

    // Get recent graves for "recent shares" simulation
    const recentGraves = await prisma.grave.findMany({
      where: { status: "APPROVED" },
      select: {
        id: true,
        title: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Simulate platform distribution based on reaction types
    const heartReactions = totalReactions._sum.heartCount || 0;
    const candleReactions = totalReactions._sum.candleCount || 0; 
    const roseReactions = totalReactions._sum.roseCount || 0;
    const lolReactions = totalReactions._sum.lolCount || 0;

    const totalPlatformShares = heartReactions + candleReactions + roseReactions + lolReactions;

    const topPlatforms = totalPlatformShares > 0 ? [
      {
        platform: "Twitter",
        shares: Math.round(totalPlatformShares * 0.5),
        percentage: 50
      },
      {
        platform: "Facebook", 
        shares: Math.round(totalPlatformShares * 0.3),
        percentage: 30
      },
      {
        platform: "Reddit",
        shares: Math.round(totalPlatformShares * 0.2), 
        percentage: 20
      }
    ] : [
      { platform: "Twitter", shares: 0, percentage: 50 },
      { platform: "Facebook", shares: 0, percentage: 30 },
      { platform: "Reddit", shares: 0, percentage: 20 }
    ];

    // Format recent shares
    const recentShares = recentGraves.slice(0, 4).map((grave, index) => ({
      id: grave.id,
      graveTitle: grave.title,
      platform: ["Twitter", "Facebook", "Reddit", "Twitter"][index],
      timestamp: formatTimeAgo(grave.createdAt)
    }));

    const analytics = {
      totalShares: totalShares,
      totalViews: Math.floor(totalShares * 3.2), // Estimate views
      totalGraves,
      gravesToday,
      topPlatforms,
      viralContent: viralWithReactions,
      recentShares
    };

    return json(analytics);

  } catch (error) {
    console.error("Analytics dashboard API error:", error);
    return internalError();
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return "Just now";
  if (diffInHours === 1) return "1 hour ago";
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "1 day ago";
  return `${diffInDays} days ago`;
}