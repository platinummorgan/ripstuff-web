// Manual notification service for moderator approval workflow
import { prisma } from './prisma';
import { 
  generateNewSympathyEmail,
  generateFirstReactionEmail,
  generateDailyDigestEmail,
  NewSympathyEmailData,
  FirstReactionEmailData,
  DailyDigestEmailData
} from './email-templates';

export class ManualNotificationService {
  /**
   * Queue new sympathy notification for manual review
   */
  static async queueNewSympathyNotification(
    userId: string,
    userEmail: string,
    graveId: string,
    data: NewSympathyEmailData
  ): Promise<void> {
    try {
      // Check if user has email notifications enabled
      const preferences = await prisma.notificationPreference.findUnique({
        where: { userId }
      });

      if (!preferences?.emailOnNewSympathy) {
        console.log(`User ${userId} has new sympathy notifications disabled`);
        return;
      }

      // Generate email content
      const template = generateNewSympathyEmail(data);

      // Queue for manual review instead of sending
      await prisma.notificationHistory.create({
        data: {
          userId,
          graveId,
          type: 'NEW_SYMPATHY',
          method: 'EMAIL',
          success: false, // Mark as pending (not sent yet)
          metadata: JSON.stringify({
            to: userEmail,
            subject: template.subject,
            html: template.html,
            text: template.text,
            sympathyAuthor: data.sympathyAuthor,
            sympathyMessage: data.sympathyMessage,
            graveName: data.graveName
          })
        }
      });

      console.log(`New sympathy notification queued for ${userEmail} (grave: ${data.graveName})`);
    } catch (error) {
      console.error('Error queueing new sympathy notification:', error);
    }
  }

  /**
   * Queue first daily reaction notification for manual review
   */
  static async queueFirstReactionNotification(
    userId: string,
    userEmail: string,
    graveId: string,
    data: FirstReactionEmailData
  ): Promise<void> {
    try {
      // Check if user has first reaction notifications enabled
      const preferences = await prisma.notificationPreference.findUnique({
        where: { userId }
      });

      if (!preferences?.emailOnFirstReaction) {
        console.log(`User ${userId} has first reaction notifications disabled`);
        return;
      }

      // Check if we already queued/sent a first reaction notification for this grave today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const existingNotification = await prisma.notificationHistory.findFirst({
        where: {
          userId,
          graveId,
          type: 'FIRST_DAILY_REACTION',
          sentAt: { gte: today }
        }
      });

      if (existingNotification) {
        console.log(`First reaction notification already processed today for grave ${graveId}`);
        return;
      }

      // Generate email content
      const template = generateFirstReactionEmail(data);

      // Queue for manual review
      await prisma.notificationHistory.create({
        data: {
          userId,
          graveId,
          type: 'FIRST_DAILY_REACTION',
          method: 'EMAIL',
          success: false, // Mark as pending
          metadata: JSON.stringify({
            to: userEmail,
            subject: template.subject,
            html: template.html,
            text: template.text,
            reactionType: data.reactionType,
            reactorName: data.reactorName,
            graveName: data.graveName
          })
        }
      });

      console.log(`First reaction notification queued for ${userEmail} (grave: ${data.graveName})`);
    } catch (error) {
      console.error('Error queueing first reaction notification:', error);
    }
  }

  /**
   * Get all pending notifications for moderation dashboard
   */
  static async getPendingNotifications() {
    try {
      const pending = await prisma.notificationHistory.findMany({
        where: {
          success: false, // Pending notifications
          errorMessage: null // Exclude failed notifications
        },
        include: {
          user: {
            select: {
              email: true,
              name: true,
              picture: true
            }
          },
          grave: {
            select: {
              title: true,
              slug: true
            }
          }
        },
        orderBy: {
          sentAt: 'desc'
        },
        take: 50 // Limit to recent 50 pending notifications
      });

      return pending.map(notification => {
        const metadata = notification.metadata ? JSON.parse(notification.metadata as string) : {};
        
        return {
          id: notification.id,
          type: notification.type,
          createdAt: notification.sentAt,
          user: {
            email: notification.user.email,
            name: notification.user.name,
            picture: notification.user.picture
          },
          grave: {
            title: notification.grave.title,
            slug: notification.grave.slug
          },
          emailData: {
            to: metadata.to,
            subject: metadata.subject,
            text: metadata.text,
            html: metadata.html
          },
          // Additional context based on notification type
          ...(notification.type === 'NEW_SYMPATHY' && {
            sympathyAuthor: metadata.sympathyAuthor,
            sympathyMessage: metadata.sympathyMessage
          }),
          ...(notification.type === 'FIRST_DAILY_REACTION' && {
            reactionType: metadata.reactionType,
            reactorName: metadata.reactorName
          })
        };
      });
    } catch (error) {
      console.error('Error fetching pending notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as sent by moderator
   */
  static async markNotificationAsSent(notificationId: string): Promise<void> {
    try {
      await prisma.notificationHistory.update({
        where: { id: notificationId },
        data: {
          success: true,
          sentAt: new Date()
        }
      });
      console.log(`Notification ${notificationId} marked as sent`);
    } catch (error) {
      console.error('Error marking notification as sent:', error);
    }
  }

  /**
   * Skip/dismiss notification without sending
   */
  static async skipNotification(notificationId: string): Promise<void> {
    try {
      await prisma.notificationHistory.update({
        where: { id: notificationId },
        data: {
          success: false,
          errorMessage: 'Skipped by moderator'
        }
      });
      console.log(`Notification ${notificationId} marked as skipped`);
    } catch (error) {
      console.error('Error skipping notification:', error);
    }
  }

  /**
   * Generate mailto link for Outlook integration
   */
  static generateMailtoLink(
    to: string,
    subject: string,
    body: string
  ): string {
    const params = new URLSearchParams({
      to,
      subject,
      body
    });
    
    return `mailto:?${params.toString()}`;
  }
}