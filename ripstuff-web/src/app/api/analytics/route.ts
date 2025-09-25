import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const analyticsEventSchema = z.object({
  event: z.string(),
  category: z.string().optional(),
  action: z.string().optional(),
  label: z.string().optional(),
  value: z.number().optional(),
  custom: z.record(z.any()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const event = analyticsEventSchema.parse(body);

    // For now, just log analytics events
    // In production, you'd send to your analytics service
    console.log('Analytics Event:', {
      ...event,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: request.ip || request.headers.get('x-forwarded-for'),
    });

    // TODO: Store in database for dashboard
    // await prisma.analyticsEvent.create({
    //   data: {
    //     event: event.event,
    //     category: event.category,
    //     action: event.action,
    //     label: event.label,
    //     value: event.value,
    //     metadata: event.custom,
    //     userAgent: request.headers.get('user-agent'),
    //     ip: request.ip || request.headers.get('x-forwarded-for'),
    //   },
    // });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    // Don't fail requests for analytics errors
    return NextResponse.json({ success: false }, { status: 200 });
  }
}