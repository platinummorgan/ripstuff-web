import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get existing preferences or create default ones
    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId: user.id }
    });

    if (!preferences) {
      // Create default preferences
      preferences = await prisma.notificationPreference.create({
        data: {
          userId: user.id,
          emailOnNewSympathy: true,
          emailOnFirstReaction: true,
          emailDailyDigest: false,
          smsEnabled: false,
          smsOnNewSympathy: false,
          smsOnFirstReaction: false,
          phoneNumber: '',
          quietHoursStart: 21, // 9 PM
          quietHoursEnd: 8,    // 8 AM
          timezone: 'UTC'
        }
      });
    }

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      emailOnNewSympathy,
      emailOnFirstReaction,
      emailDailyDigest,
      smsEnabled,
      smsOnNewSympathy,
      smsOnFirstReaction,
      phoneNumber,
      quietHoursStart,
      quietHoursEnd,
      timezone
    } = body;

    // Validation
    if (smsEnabled && (!phoneNumber || phoneNumber.trim() === '')) {
      return NextResponse.json(
        { error: 'Phone number is required when SMS is enabled' },
        { status: 400 }
      );
    }

    if (quietHoursStart < 0 || quietHoursStart > 23 || quietHoursEnd < 0 || quietHoursEnd > 23) {
      return NextResponse.json(
        { error: 'Invalid quiet hours - must be between 0 and 23' },
        { status: 400 }
      );
    }

    // Clean phone number if SMS is disabled
    const cleanPhoneNumber = smsEnabled ? phoneNumber : '';

    // Update or create preferences
    const preferences = await prisma.notificationPreference.upsert({
      where: { userId: user.id },
      update: {
        emailOnNewSympathy: Boolean(emailOnNewSympathy),
        emailOnFirstReaction: Boolean(emailOnFirstReaction),
        emailDailyDigest: Boolean(emailDailyDigest),
        smsEnabled: Boolean(smsEnabled),
        smsOnNewSympathy: Boolean(smsOnNewSympathy),
        smsOnFirstReaction: Boolean(smsOnFirstReaction),
        phoneNumber: cleanPhoneNumber,
        quietHoursStart: Number(quietHoursStart),
        quietHoursEnd: Number(quietHoursEnd),
        timezone: String(timezone),
        updatedAt: new Date()
      },
      create: {
        userId: user.id,
        emailOnNewSympathy: Boolean(emailOnNewSympathy),
        emailOnFirstReaction: Boolean(emailOnFirstReaction),
        emailDailyDigest: Boolean(emailDailyDigest),
        smsEnabled: Boolean(smsEnabled),
        smsOnNewSympathy: Boolean(smsOnNewSympathy),
        smsOnFirstReaction: Boolean(smsOnFirstReaction),
        phoneNumber: cleanPhoneNumber,
        quietHoursStart: Number(quietHoursStart),
        quietHoursEnd: Number(quietHoursEnd),
        timezone: String(timezone)
      }
    });

    return NextResponse.json({ 
      success: true, 
      preferences,
      message: 'Notification preferences updated successfully'
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}