import { NextRequest, NextResponse } from 'next/server';
import { requireUserModerator } from '@/lib/auth';
import { ManualNotificationService } from '@/lib/manual-notification-service';

export async function GET(request: NextRequest) {
  try {
    // Require moderator authentication
    await requireUserModerator();

    // Get all pending notifications
    const pendingNotifications = await ManualNotificationService.getPendingNotifications();

    return NextResponse.json({ 
      notifications: pendingNotifications,
      count: pendingNotifications.length
    });
  } catch (error) {
    console.error('Error fetching pending notifications:', error);
    
    if (String(error).includes('AUTHENTICATION_REQUIRED')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    if (String(error).includes('MODERATOR_PERMISSIONS_REQUIRED')) {
      return NextResponse.json({ error: 'Moderator permissions required' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require moderator authentication
    await requireUserModerator();

    const body = await request.json();
    const { action, notificationId } = body;

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'mark_sent':
        await ManualNotificationService.markNotificationAsSent(notificationId);
        return NextResponse.json({ 
          success: true, 
          message: 'Notification marked as sent' 
        });

      case 'skip':
        await ManualNotificationService.skipNotification(notificationId);
        return NextResponse.json({ 
          success: true, 
          message: 'Notification skipped' 
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "mark_sent" or "skip"' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing notification action:', error);
    
    if (String(error).includes('AUTHENTICATION_REQUIRED')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    if (String(error).includes('MODERATOR_PERMISSIONS_REQUIRED')) {
      return NextResponse.json({ error: 'Moderator permissions required' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to process notification action' },
      { status: 500 }
    );
  }
}