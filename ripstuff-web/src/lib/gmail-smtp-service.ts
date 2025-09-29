// Gmail SMTP service for notification system
import nodemailer from 'nodemailer';
import { prisma } from './prisma';
import { 
  generateNewSympathyEmail,
  generateFirstReactionEmail,
  generateDailyDigestEmail,
  generateNewFollowerEmail,
  generateFollowerMemorialEmail,
  NewSympathyEmailData,
  FirstReactionEmailData,
  DailyDigestEmailData,
  NewFollowerEmailData,
  FollowerMemorialEmailData
} from './email-templates';

export class GmailNotificationService {
  private static readonly FROM_EMAIL = process.env.GMAIL_FROM_EMAIL || 'notifications@ripstuff.net';
  private static transporter: nodemailer.Transporter | null = null;

  /**
   * Initialize Gmail SMTP transporter
   */
  private static getTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: this.FROM_EMAIL,
          pass: process.env.GMAIL_APP_PASSWORD // 16-character app password
        }
      });
    }
    return this.transporter!;
  }

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
    type: 'NEW_SYMPATHY' | 'FIRST_DAILY_REACTION' | 'DAILY_DIGEST' | 'NEW_FOLLOWER' | 'FOLLOWER_NEW_MEMORIAL'
  ): Promise<void> {
    try {
      // Get user's notification preferences
      let preferences = await prisma.notificationPreference.findUnique({
        where: { userId }
      });

      if (!preferences) {
        console.log(`No notification preferences found for user ${userId} - creating defaults to ensure delivery`);
        // CRITICAL FIX: Create default preferences instead of silently failing
        try {
          preferences = await prisma.notificationPreference.create({
            data: {
              userId,
              emailOnNewSympathy: true,
              emailOnFirstReaction: true,
              emailDailyDigest: false,
              smsEnabled: false,
              smsOnNewSympathy: false,
              smsOnFirstReaction: false,
              phoneNumber: '',
              quietHoursEnabled: false, // Default off to ensure immediate delivery
              quietHoursStart: 21,
              quietHoursEnd: 8,
              timezone: 'UTC'
            }
          });
          console.log(`✅ Created default notification preferences for user ${userId}`);
        } catch (createError) {
          console.error('Failed to create default preferences:', createError);
          // Continue with basic defaults in memory
          preferences = {
            emailOnNewSympathy: true,
            emailOnFirstReaction: true,
            quietHoursEnabled: false,
            quietHoursStart: 21,
            quietHoursEnd: 8,
            timezone: 'UTC'
          } as any;
        }
      }

      // Ensure preferences is not null before proceeding
      if (!preferences) {
        console.error(`❌ Unable to create or fetch notification preferences for user ${userId}`);
        return;
      }

      // Check quiet hours (only if enabled, default to true for backward compatibility)
      const quietHoursEnabled = preferences.quietHoursEnabled !== false; // null or true = enabled
      const isQuietTime = quietHoursEnabled && this.isWithinQuietHours(
        preferences.quietHoursStart,
        preferences.quietHoursEnd,
        preferences.timezone
      );

      if (isQuietTime) {
        // CRITICAL FIX: Send immediately to prevent email loss until queue system is implemented
        console.log(`⚠️  Quiet hours active (${preferences.quietHoursStart}-${preferences.quietHoursEnd}) but sending immediately to prevent lost notifications`);
        // Continue to send email instead of silently discarding
      }

      // Send immediately via Gmail SMTP
      const transporter = this.getTransporter();
      
      const result = await transporter.sendMail({
        from: `"RipStuff Notifications" <${this.FROM_EMAIL}>`,
        to,
        subject,
        html,
        text,
      });

      if (!result.messageId) {
        throw new Error('Gmail SMTP: No message ID returned');
      }

      // Log successful delivery (commented out until NotificationHistory model is available)
      // await this.logNotification(userId, graveId, type, true);
      console.log(`✅ Gmail email sent to ${to}: ${result.messageId}`);
      
    } catch (error) {
      console.error('❌ Error sending Gmail email:', error);
      // await this.logNotification(userId, graveId, type, false, String(error));
    }
  }

  /**
   * Log notification to history - TEMPORARILY DISABLED
   * (Waiting for NotificationHistory model to be added to Prisma schema)
   */
  // private static async logNotification(
  //   userId: string,
  //   graveId: string,
  //   type: 'NEW_SYMPATHY' | 'FIRST_DAILY_REACTION' | 'DAILY_DIGEST',
  //   success: boolean,
  //   errorMessage?: string
  // ): Promise<void> {
  //   try {
  //     await prisma.notificationHistory.create({
  //       data: {
  //         userId,
  //         graveId,
  //         type,
  //         method: 'EMAIL',
  //         success,
  //         errorMessage: success ? null : errorMessage
  //       }
  //     });
  //   } catch (error) {
  //     console.error('Error logging notification history:', error);
  //   }
  // }

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
    // (Temporarily disabled until NotificationHistory model is available)
    // const today = new Date();
    // today.setHours(0, 0, 0, 0);
    // 
    // const existingNotification = await prisma.notificationHistory.findFirst({
    //   where: {
    //     userId,
    //     graveId,
    //     type: 'FIRST_DAILY_REACTION',
    //     sentAt: { gte: today },
    //     success: true
    //   }
    // });
    //
    // if (existingNotification) {
    //   console.log(`First reaction notification already sent today for grave ${graveId}`);
    //   return;
    // }

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

  /**
   * Send new follower notification
   */
  static async sendNewFollowerNotification(
    userId: string,
    userEmail: string,
    data: NewFollowerEmailData
  ): Promise<void> {
    const template = generateNewFollowerEmail(data);
    await this.sendEmailWithQuietHoursCheck(
      userEmail,
      template.subject,
      template.html,
      template.text,
      userId,
      '', // No specific grave for follow notifications
      'NEW_FOLLOWER'
    );
  }

  /**
   * Send follower memorial notification
   */
  static async sendFollowerMemorialNotification(
    userId: string,
    userEmail: string,
    graveId: string,
    data: FollowerMemorialEmailData
  ): Promise<void> {
    const template = generateFollowerMemorialEmail(data);
    await this.sendEmailWithQuietHoursCheck(
      userEmail,
      template.subject,
      template.html,
      template.text,
      userId,
      graveId,
      'FOLLOWER_NEW_MEMORIAL'
    );
  }

  /**
   * Test the Gmail SMTP connection
   */
  static async testConnection(): Promise<boolean> {
    try {
      const transporter = this.getTransporter();
      await transporter.verify();
      console.log('Gmail SMTP connection verified successfully');
      return true;
    } catch (error) {
      console.error('Gmail SMTP connection failed:', error);
      return false;
    }
  }
}