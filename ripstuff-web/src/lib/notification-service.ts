// Simplified email service for notification system
import { Resend } from 'resend';
import { prisma } from './prisma';
import { 
  generateNewSympathyEmail,
  generateFirstReactionEmail,
  generateDailyDigestEmail,
  NewSympathyEmailData,
  FirstReactionEmailData,
  DailyDigestEmailData
} from './email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);

export class NotificationEmailService {
  private static readonly FROM_EMAIL = 'notifications@virtualgraveyard.com';
  
  /**
   * Check if current time is within user's quiet hours
   */
  private static isWithinQuietHours(
    quietStart: number, 
    quietEnd: number, 
    timezone: string
  ): boolean {
    try {
      const now = new Date();
      const userTime = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        hour12: false
      });
      
      const currentHour = parseInt(userTime.format(now));
      
      // Handle quiet hours that span midnight (e.g., 21-8)
      if (quietStart > quietEnd) {
        return currentHour >= quietStart || currentHour < quietEnd;
      }
      
      // Normal quiet hours (e.g., 1-6)
      return currentHour >= quietStart && currentHour < quietEnd;
    } catch (error) {
      console.error('Error checking quiet hours:', error);
      return false; // If timezone parsing fails, assume it's not quiet hours
    }
  }

  /**
   * Send email if not in quiet hours, otherwise log for later processing
   */
  private static async sendEmailWithQuietHoursCheck(
    to: string,
    subject: string,
    html: string,
    text: string,
    userId: string,
    graveId: string,
    type: 'NEW_SYMPATHY' | 'FIRST_DAILY_REACTION' | 'DAILY_DIGEST'
  ): Promise<void> {
    try {
      // Get user's notification preferences
      const preferences = await prisma.notificationPreference.findUnique({
        where: { userId }
      });

      if (!preferences) {
        console.log(`No notification preferences found for user ${userId}`);
        return;
      }

      // Check quiet hours
      const isQuietTime = this.isWithinQuietHours(
        preferences.quietHoursStart,
        preferences.quietHoursEnd,
        preferences.timezone
      );

      if (isQuietTime) {
        // For now, just log that it would be queued
        // In production, implement proper queueing
        console.log(`Email for ${to} queued due to quiet hours (${preferences.quietHoursStart}-${preferences.quietHoursEnd})`);
        return;
      }

      // Send immediately
      const result = await resend.emails.send({
        from: this.FROM_EMAIL,
        to,
        subject,
        html,
        text,
      });

      if (result.error) {
        throw new Error(`Resend API error: ${result.error.message}`);
      }

      // Log successful delivery
      await this.logNotification(userId, graveId, type, true);
      console.log(`Email sent to ${to}: ${result.data?.id}`);
      
    } catch (error) {
      console.error('Error sending email:', error);
      await this.logNotification(userId, graveId, type, false, String(error));
    }
  }

  /**
   * Log notification to history
   */
  private static async logNotification(
    userId: string,
    graveId: string,
    type: 'NEW_SYMPATHY' | 'FIRST_DAILY_REACTION' | 'DAILY_DIGEST',
    success: boolean,
    errorMessage?: string
  ): Promise<void> {
    try {
      await prisma.notificationHistory.create({
        data: {
          userId,
          graveId,
          type,
          method: 'EMAIL',
          success,
          errorMessage: success ? null : errorMessage
        }
      });
    } catch (error) {
      console.error('Error logging notification history:', error);
    }
  }

  /**
   * Send new sympathy notification
   */
  static async sendNewSympathyNotification(
    userId: string,
    userEmail: string,
    graveId: string,
    data: NewSympathyEmailData
  ): Promise<void> {
    const template = generateNewSympathyEmail(data);
    await this.sendEmailWithQuietHoursCheck(
      userEmail,
      template.subject,
      template.html,
      template.text,
      userId,
      graveId,
      'NEW_SYMPATHY'
    );
  }

  /**
   * Send first daily reaction notification
   */
  static async sendFirstReactionNotification(
    userId: string,
    userEmail: string,
    graveId: string,
    data: FirstReactionEmailData
  ): Promise<void> {
    // Check if we already sent a first reaction notification for this grave today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingNotification = await prisma.notificationHistory.findFirst({
      where: {
        userId,
        graveId,
        type: 'FIRST_DAILY_REACTION',
        sentAt: { gte: today },
        success: true
      }
    });

    if (existingNotification) {
      console.log(`First reaction notification already sent today for grave ${graveId}`);
      return;
    }

    const template = generateFirstReactionEmail(data);
    await this.sendEmailWithQuietHoursCheck(
      userEmail,
      template.subject,
      template.html,
      template.text,
      userId,
      graveId,
      'FIRST_DAILY_REACTION'
    );
  }

  /**
   * Send daily digest notification
   */
  static async sendDailyDigestNotification(
    userId: string,
    userEmail: string,
    graveId: string,
    data: DailyDigestEmailData
  ): Promise<void> {
    const template = generateDailyDigestEmail(data);
    await this.sendEmailWithQuietHoursCheck(
      userEmail,
      template.subject,
      template.html,
      template.text,
      userId,
      graveId,
      'DAILY_DIGEST'
    );
  }
}