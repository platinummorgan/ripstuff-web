// Email service switcher - chooses between Resend and Gmail SMTP
import { GmailNotificationService } from './gmail-smtp-service';
import { NotificationEmailService } from './notification-service';
import {
  NewSympathyEmailData,
  FirstReactionEmailData,
  DailyDigestEmailData
} from './email-templates';

/**
 * Email service that automatically chooses between Gmail SMTP and Resend
 * based on EMAIL_PROVIDER environment variable
 */
export class EmailService {
  private static get provider() {
    return process.env.EMAIL_PROVIDER || 'resend';
  }

  private static get isGmail() {
    return this.provider === 'gmail';
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
    if (this.isGmail) {
      await GmailNotificationService.sendNewSympathyNotification(userId, userEmail, graveId, data);
    } else {
      await NotificationEmailService.sendNewSympathyNotification(userId, userEmail, graveId, data);
    }
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
    if (this.isGmail) {
      await GmailNotificationService.sendFirstReactionNotification(userId, userEmail, graveId, data);
    } else {
      await NotificationEmailService.sendFirstReactionNotification(userId, userEmail, graveId, data);
    }
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
    if (this.isGmail) {
      await GmailNotificationService.sendDailyDigestNotification(userId, userEmail, graveId, data);
    } else {
      await NotificationEmailService.sendDailyDigestNotification(userId, userEmail, graveId, data);
    }
  }

  /**
   * Test email service connection
   */
  static async testConnection(): Promise<boolean> {
    if (this.isGmail) {
      return await GmailNotificationService.testConnection();
    } else {
      // Resend doesn't have a direct test method, assume it works if API key is set
      return !!process.env.RESEND_API_KEY;
    }
  }

  /**
   * Get current email provider info
   */
  static getProviderInfo(): { provider: string; fromEmail: string } {
    if (this.isGmail) {
      return {
        provider: 'Gmail SMTP',
        fromEmail: process.env.GMAIL_FROM_EMAIL || 'notifications@ripstuff.net'
      };
    } else {
      return {
        provider: 'Resend',
        fromEmail: 'notifications@virtualgraveyard.com'
      };
    }
  }
}