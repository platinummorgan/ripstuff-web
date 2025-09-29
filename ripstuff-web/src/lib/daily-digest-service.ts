import { prisma } from '@/lib/prisma';
import { EmailService } from '@/lib/email-service-switcher';
import { DailyDigestEmailData } from '@/lib/email-templates';

interface UserDigestData {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  graves: Array<{
    id: string;
    slug: string;
    name: string;
    newSympathies: number;
    newReactions: number;
    uniqueVisitors: number;
    sympathyMessages: Array<{
      author: string;
      message: string;
      createdAt: string;
    }>;
    topReactions: Array<{
      type: string;
      count: number;
    }>;
  }>;
}

/**
 * Daily Digest Service - Generates and sends daily activity summaries
 */
export class DailyDigestService {
  
  /**
   * Main function to generate and send daily digests to all eligible users
   */
  static async generateAndSendDailyDigests(): Promise<void> {
    console.log('🔄 Starting daily digest generation...');
    
    try {
      // Get all users who have daily digest enabled
      const eligibleUsers = await this.getEligibleUsers();
      console.log(`📊 Found ${eligibleUsers.length} users with daily digest enabled`);

      if (eligibleUsers.length === 0) {
        console.log('✅ No users have daily digest enabled, skipping...');
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      // Process each user individually
      for (const user of eligibleUsers) {
        try {
          await this.generateDigestForUser(user.id, user.email, user.name || undefined);
          successCount++;
          console.log(`✅ Sent daily digest to ${user.email}`);
          
          // Add delay between emails to avoid rate limiting
          await this.sleep(1000);
        } catch (error) {
          errorCount++;
          console.error(`❌ Failed to send digest to ${user.email}:`, error);
        }
      }

      console.log(`🎉 Daily digest generation complete: ${successCount} sent, ${errorCount} failed`);
    } catch (error) {
      console.error('❌ Daily digest generation failed:', error);
      throw error;
    }
  }

  /**
   * Get all users who have daily digest notifications enabled
   */
  private static async getEligibleUsers() {
    // Get all users with daily digest enabled
    return await prisma.user.findMany({
      where: {
        notificationPreference: {
          emailDailyDigest: true
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        deviceHash: true
      }
    });
  }

  /**
   * Generate and send digest for a specific user
   */
  private static async generateDigestForUser(userId: string, userEmail: string, userName?: string): Promise<void> {
    const digestData = await this.gatherUserDigestData(userId);
    
    if (!digestData || digestData.graves.length === 0) {
      console.log(`📭 No activity for user ${userEmail}, skipping digest`);
      return;
    }

    // Send digest for each grave with activity (or combine into one email)
    for (const grave of digestData.graves) {
      if (grave.newSympathies > 0 || grave.newReactions > 0) {
        const emailData: DailyDigestEmailData = {
          graveName: grave.name,
          graveSlug: grave.slug,
          graveUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/grave/${grave.slug}`,
          sympathyCount: grave.newSympathies,
          reactionCount: grave.newReactions,
          uniqueVisitors: grave.uniqueVisitors,
          newSympathies: grave.sympathyMessages,
          topReactions: grave.topReactions
        };

        await EmailService.sendDailyDigestNotification(userId, userEmail, grave.id, emailData);
      }
    }
  }

  /**
   * Gather activity data for a user's graves from the past 24 hours
   */
  private static async gatherUserDigestData(userId: string): Promise<UserDigestData | null> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        deviceHash: true
      }
    });

    if (!user || !user.deviceHash) return null;

    // Find graves created by this user (using device hash)
    const userGraves = await prisma.grave.findMany({
      where: {
        creatorDeviceHash: user.deviceHash,
        OR: [
          {
            sympathies: {
              some: {
                createdAt: {
                  gte: yesterday,
                  lt: today
                }
              }
            }
          },
          {
            reactionEvents: {
              some: {
                createdAt: {
                  gte: yesterday,
                  lt: today
                }
              }
            }
          }
        ]
      },
      select: {
        id: true,
        slug: true,
        title: true,
        sympathies: {
          where: {
            createdAt: {
              gte: yesterday,
              lt: today
            }
          },
          select: {
            body: true,
            createdAt: true,
            deviceHash: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        reactionEvents: {
          where: {
            createdAt: {
              gte: yesterday,
              lt: today
            }
          },
          select: {
            type: true,
            createdAt: true,
            deviceHash: true
          }
        }
      }
    });

    if (!userGraves || userGraves.length === 0) return null;

    const gravesWithActivity = userGraves.map(grave => {
      // Count unique visitors (unique device hashes who reacted)
      const uniqueReactorIds = new Set(grave.reactionEvents.map(r => r.deviceHash));
      
      // Group reactions by type and count them
      const reactionCounts = grave.reactionEvents.reduce((acc, reaction) => {
        acc[reaction.type] = (acc[reaction.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topReactions = Object.entries(reactionCounts)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5 reactions

      const sympathyMessages = grave.sympathies.map(sympathy => ({
        author: `User ${sympathy.deviceHash.slice(-6)}`, // Anonymous but identifiable
        message: sympathy.body,
        createdAt: sympathy.createdAt.toISOString()
      }));

      return {
        id: grave.id,
        slug: grave.slug,
        name: grave.title,
        newSympathies: grave.sympathies.length,
        newReactions: grave.reactionEvents.length,
        uniqueVisitors: uniqueReactorIds.size,
        sympathyMessages,
        topReactions
      };
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name || undefined
      },
      graves: gravesWithActivity
    };
  }

  /**
   * Respect quiet hours when sending digests
   */
  private static async shouldSendToUser(userId: string): Promise<boolean> {
    const preferences = await prisma.notificationPreference.findUnique({
      where: { userId },
      select: {
        quietHoursEnabled: true,
        quietHoursStart: true,
        quietHoursEnd: true,
        timezone: true
      }
    });

    if (!preferences?.quietHoursEnabled) {
      return true; // No quiet hours restrictions
    }

    // Simple quiet hours check (could be enhanced with timezone support)
    const now = new Date();
    const currentHour = now.getHours();
    const quietStart = preferences.quietHoursStart || 22;
    const quietEnd = preferences.quietHoursEnd || 8;

    // Handle quiet hours that span midnight
    if (quietStart > quietEnd) {
      return !(currentHour >= quietStart || currentHour < quietEnd);
    } else {
      return !(currentHour >= quietStart && currentHour < quietEnd);
    }
  }

  /**
   * Utility function for delays
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Test function for development - send digest to a specific user
   */
  static async sendTestDigest(userEmail: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, email: true, name: true }
    });

    if (!user) {
      throw new Error(`User not found: ${userEmail}`);
    }

    console.log(`🧪 Sending test digest to ${userEmail}...`);
    await this.generateDigestForUser(user.id, user.email, user.name || undefined);
    console.log('✅ Test digest sent!');
  }

  /**
   * Get digest preview data for a user (for testing/preview)
   */
  static async getDigestPreview(userId: string): Promise<UserDigestData | null> {
    return await this.gatherUserDigestData(userId);
  }
}