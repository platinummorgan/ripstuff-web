import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure user is a moderator
    const user = await getCurrentUser();
    if (!user || !user.isModerator) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { notes } = await req.json();

    // Update the message status
    await prisma.contactMessage.update({
      where: { id: params.id },
      data: {
        status: "READ",
        resolvedAt: new Date(),
        moderatorNotes: notes || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update contact message:", error);
    return NextResponse.json(
      { message: "Failed to update message" },
      { status: 500 }
    );
  }
}