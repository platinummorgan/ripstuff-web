"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { moderationActionInput } from "@/lib/validation";

interface ModerationActionParams {
  graveId: string;
  action: string;
  reason?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export async function performModerationAction({ graveId, action, reason }: ModerationActionParams) {
  const payload = moderationActionInput.safeParse({ action, reason });
  if (!payload.success) {
    throw new Error(payload.error.issues[0]?.message ?? "Invalid action");
  }

  // Fixed: Added NEXT_PUBLIC_SITE_URL environment variable to resolve server action URL issues

  // Get cookies for authentication
  const cookieStore = cookies();
  const cookieHeader = cookieStore.toString();

  const res = await fetch(`${baseUrl}/api/moderation/graves/${graveId}/action`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": cookieHeader,
    },
    body: JSON.stringify(payload.data),
    cache: "no-store",
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.message ?? json?.code ?? "Moderation action failed");
  }

  revalidatePath("/moderation");

  return json as {
    success: boolean;
    status?: string;
    featured?: boolean;
    remainingReports?: number;
    action: string;
    message?: string;
  };
}