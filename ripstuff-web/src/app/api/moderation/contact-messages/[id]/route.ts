import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireModerator } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure user is a moderator
    await requireModerator(req);

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
    // Handle authentication errors
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED" || error.message === "MOD_AUTH_NOT_CONFIGURED") {
        return new Response("Unauthorized", { status: 401 });
      }
    }
    console.error("Failed to update contact message:", error);
    return NextResponse.json(
      { message: "Failed to update message" },
      { status: 500 }
    );
  }
}