import { NextRequest, NextResponse } from "next/server";
import { resolveDeviceHash } from "@/lib/device";
import { checkRateLimit, rateLimitRetrySeconds } from "@/lib/rate-limit";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const deviceHash = resolveDeviceHash();
    
    // Rate limit to 5 messages per day
    const rateResult = await checkRateLimit({
      scope: "contact:message",
      identifier: deviceHash,
      limit: 5,
      windowSeconds: 24 * 60 * 60
    });
    
    if (!rateResult.ok) {
      return NextResponse.json(
        { message: "Too many messages. Please try again tomorrow." },
        { status: 429 }
      );
    }

    const { subject, message } = await req.json();

    // Validate input
    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json(
        { message: "Subject and message are required." },
        { status: 400 }
      );
    }

    if (subject.length > 120) {
      return NextResponse.json(
        { message: "Subject must be 120 characters or less." },
        { status: 400 }
      );
    }

    // Create contact message
    await prisma.contactMessage.create({
      data: {
        senderDeviceHash: deviceHash,
        subject: subject.trim(),
        message: message.trim(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to handle contact message:", error);
    return NextResponse.json(
      { message: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}