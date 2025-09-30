import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Ensure user is a moderator
    const user = await getCurrentUser();
    if (!user || !user.isModerator) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Get all messages, newest first
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Failed to fetch contact messages:", error);
    return NextResponse.json(
      { message: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}