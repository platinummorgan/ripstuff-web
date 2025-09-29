import { NextRequest, NextResponse } from 'next/server';
import { DailyDigestService } from '@/lib/daily-digest-service';

export async function POST(request: NextRequest) {
  try {
    // Basic API key authentication for cron jobs
    const authHeader = request.headers.get('authorization');
    const apiKey = process.env.CRON_API_KEY || 'dev-cron-key';
    
    if (authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    console.log('🔄 Daily digest cron job started');
    await DailyDigestService.generateAndSendDailyDigests();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Daily digests sent successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Daily digest cron job failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send daily digests',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Allow GET for health checks
    return NextResponse.json({
      status: 'Daily digest service is active',
      timestamp: new Date().toISOString(),
      description: 'Use POST with proper authorization to trigger daily digests'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Service unavailable' },
      { status: 503 }
    );
  }
}