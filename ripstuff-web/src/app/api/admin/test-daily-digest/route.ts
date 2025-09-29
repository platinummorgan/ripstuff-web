import { NextRequest, NextResponse } from 'next/server';
import { DailyDigestService } from '@/lib/daily-digest-service';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get current user for development testing
    const user = await getCurrentUser();
    
    if (!user?.isModerator) {
      return NextResponse.json(
        { error: 'Moderator access required' }, 
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, userEmail } = body;

    if (action === 'send-test-digest' && userEmail) {
      console.log(`🧪 Sending test digest to ${userEmail}...`);
      await DailyDigestService.sendTestDigest(userEmail);
      
      return NextResponse.json({ 
        success: true, 
        message: `Test digest sent to ${userEmail}`,
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'preview-digest' && userEmail) {
      console.log(`👀 Getting digest preview for ${userEmail}...`);
      const previewData = await DailyDigestService.getDigestPreview(user.id);
      
      return NextResponse.json({ 
        success: true, 
        previewData,
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'send-all-digests') {
      console.log('📤 Sending daily digests to all eligible users...');
      await DailyDigestService.generateAndSendDailyDigests();
      
      return NextResponse.json({ 
        success: true, 
        message: 'Daily digests sent to all eligible users',
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use: send-test-digest, preview-digest, or send-all-digests' },
      { status: 400 }
    );
  } catch (error) {
    console.error('❌ Daily digest test failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process daily digest request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Daily digest test service',
    description: 'POST with { action: "send-test-digest", userEmail: "user@example.com" } to test',
    actions: [
      'send-test-digest (requires userEmail)',
      'preview-digest (requires userEmail)', 
      'send-all-digests'
    ]
  });
}