import { NextRequest } from "next/server";
import { json, internalError } from "@/lib/http";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    // Get total graves
    const totalDeaths = await prisma.grave.count({
      where: { status: "APPROVED" }
    });

    // Get graves created today
    const newDeaths = await prisma.grave.count({
      where: {
        status: "APPROVED",
        createdAt: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    });

    // Get top category today
    const topCategoryToday = await prisma.grave.groupBy({
      by: ['category'],
      where: {
        status: "APPROVED",
        createdAt: {
          gte: startOfDay,
          lt: endOfDay
        }
      },
      _count: { category: true },
      orderBy: { _count: { category: 'desc' } },
      take: 1
    });

    // Get most viral death (highest reactions)
    const viralDeath = await prisma.grave.findFirst({
      where: {
        status: "APPROVED",
        createdAt: {
          gte: startOfDay,
          lt: endOfDay
        }
      },
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
      ]
    });

    // Calculate average age from datesText field (extract numbers)
    const gravesWithDates = await prisma.grave.findMany({
      where: { 
        status: "APPROVED",
        datesText: { not: null }
      },
      select: { datesText: true }
    });

    let averageLifespan = "Unknown";
    if (gravesWithDates.length > 0) {
      // Extract years from datesText (simple parsing)
      const ages = gravesWithDates
        .map(g => {
          const match = g.datesText?.match(/(\d+)\s*years?/i);
          return match ? parseInt(match[1]) : null;
        })
        .filter(age => age !== null) as number[];
      
      if (ages.length > 0) {
        const avgAge = ages.reduce((sum, age) => sum + age, 0) / ages.length;
        averageLifespan = `${Math.round(avgAge * 10) / 10} years`;
      }
    }

    // Get most common category overall
    const mostCommonCategory = await prisma.grave.groupBy({
      by: ['category'],
      where: { status: "APPROVED" },
      _count: { category: true },
      orderBy: { _count: { category: 'desc' } },
      take: 1
    });

    // Get category breakdown for today
    const categoryBreakdown = await prisma.grave.groupBy({
      by: ['category'],
      where: {
        status: "APPROVED",
        createdAt: {
          gte: startOfDay,
          lt: endOfDay
        }
      },
      _count: { category: true },
      orderBy: { _count: { category: 'desc' } }
    });

    // Calculate viral death shares
    const viralShares = viralDeath ? 
      viralDeath.heartCount + viralDeath.candleCount + viralDeath.roseCount + viralDeath.lolCount : 0;

    // Generate quirky facts based on real data
    const quirkyFacts: string[] = [];
    
    if (categoryBreakdown.length > 0) {
      const techCount = categoryBreakdown.find(c => c.category === 'TECH_GADGETS')?._count.category || 0;
      if (techCount > 0) {
        quirkyFacts.push(`${techCount} people buried their tech gadgets today`);
      }
      
      const miscCount = categoryBreakdown.find(c => c.category === 'MISC')?._count.category || 0;
      if (miscCount > 0) {
        quirkyFacts.push(`${miscCount} miscellaneous items found their final resting place today`);
      }
    }

    // Get average eulogy length for today
    const todaysEulogies = await prisma.grave.findMany({
      where: {
        status: "APPROVED",
        createdAt: {
          gte: startOfDay,
          lt: endOfDay
        }
      },
      select: { eulogyText: true }
    });

    if (todaysEulogies.length > 0) {
      const avgEulogyLength = Math.round(
        todaysEulogies.reduce((sum, grave) => sum + (grave.eulogyText?.length || 0), 0) / todaysEulogies.length
      );
      quirkyFacts.push(`The average eulogy today was ${avgEulogyLength} characters long`);
    }

    // Count graves with photos
    const gravesWithPhotos = await prisma.grave.count({
      where: {
        status: "APPROVED",
        createdAt: {
          gte: startOfDay,
          lt: endOfDay
        },
        photoUrl: { not: null }
      }
    });

    if (newDeaths > 0) {
      const photoPercentage = Math.round((gravesWithPhotos / newDeaths) * 100);
      quirkyFacts.push(`${photoPercentage}% of people added custom photos to their memorials`);
    }

    // Fallback quirky facts if no real data
    if (quirkyFacts.length === 0) {
      quirkyFacts.push("No memorials created today yet - be the first!");
    }

    const report = {
      date: today.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      totalDeaths,
      newDeaths,
      topCategory: topCategoryToday[0]?.category || 'MISC',
      viralDeath: viralDeath ? {
        title: viralDeath.title,
        shares: viralShares,
        category: viralDeath.category
      } : {
        title: "No viral deaths today",
        shares: 0,
        category: 'MISC'
      },
      dailyStats: {
        mostCommonCause: getMostCommonCause(mostCommonCategory[0]?.category || 'MISC'),
        averageLifespan: averageLifespan,
        mostMourned: getCategoryDisplayName(mostCommonCategory[0]?.category || 'MISC')
      },
      quirkyFacts,
      categoryBreakdown: categoryBreakdown.map(cat => ({
        category: cat.category,
        count: cat._count.category,
        displayName: getCategoryDisplayName(cat.category)
      }))
    };

    return json(report);

  } catch (error) {
    console.error("Death reports API error:", error);
    return internalError();
  }
}

function getMostCommonCause(category: string): string {
  const causes: Record<string, string> = {
    'TECH_GADGETS': 'Planned Obsolescence',
    'KITCHEN_FOOD': 'Expiration Date',
    'CAR_TOOLS': 'Mechanical Failure',
    'CLOTHING': 'Fashion Evolution',
    'RELATIONSHIPS': 'Irreconcilable Differences',
    'MISC': 'General Wear and Tear'
  };
  return causes[category] || 'Unknown Causes';
}

function getCategoryDisplayName(category: string): string {
  const names: Record<string, string> = {
    'TECH_GADGETS': 'Tech Gadgets',
    'KITCHEN_FOOD': 'Kitchen Items',
    'CAR_TOOLS': 'Car Tools',
    'CLOTHING': 'Clothing',
    'RELATIONSHIPS': 'Relationships',
    'MISC': 'Miscellaneous'
  };
  return names[category] || category.replace(/_/g, ' ');
}