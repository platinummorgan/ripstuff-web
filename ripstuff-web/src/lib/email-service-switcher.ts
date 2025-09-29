// Email service switcher - uses Gmail SMTP (Resend removed)
import { GmailNotificationService } from './gmail-smtp-service';
import {
  NewSympathyEmailData,
  FirstReactionEmailData,
  DailyDigestEmailData,
  NewFollowerEmailData,
  FollowerMemorialEmailData
} from './email-templates';

/**
 * Email service - uses Gmail SMTP for all notifications
 */
export class EmailService {

  /**
   * Send new sympathy notification
   */
  static async sendNewSympathyNotification(
    userId: string,
    userEmail: string,
    graveId: string,
    data: NewSympathyEmailData
  ): Promise<void> {
    await GmailNotificationService.sendNewSympathyNotification(userId, userEmail, graveId, data);
  }

  /**
   * Send first reaction notification
   */
  static async sendFirstReactionNotification(
    userId: string,
    userEmail: string,
    graveId: string,
    data: FirstReactionEmailData
  ): Promise<void> {
    await GmailNotificationService.sendFirstReactionNotification(userId, userEmail, graveId, data);
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
    await GmailNotificationService.sendDailyDigestNotification(userId, userEmail, graveId, data);
  }

  /**
   * Send new follower notification
   */
  static async sendNewFollowerNotification(
    userId: string,
    userEmail: string,
    data: NewFollowerEmailData
  ): Promise<void> {
    await GmailNotificationService.sendNewFollowerNotification(userId, userEmail, data);
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
    await GmailNotificationService.sendFollowerMemorialNotification(userId, userEmail, graveId, data);
  }

  /**
   * Test email service connection
   */
  static async testConnection(): Promise<boolean> {
    return await GmailNotificationService.testConnection();
  }

  /**
   * Get current email provider info
   */
  static getProviderInfo(): { provider: string; fromEmail: string } {
    return {
      provider: 'Gmail SMTP',
      fromEmail: process.env.GMAIL_FROM_EMAIL || 'notifications@ripstuff.net'
    };
  }
}