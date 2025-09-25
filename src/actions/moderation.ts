"use server";

import { revalidatePath } from "next/cache";

import { moderationActionInput } from "@/lib/validation";

interface ModerationActionParams {
  graveId: string;
  action: string;
  reason?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
const moderatorSecret = process.env.MODERATOR_SECRET;

export async function performModerationAction({ graveId, action, reason }: ModerationActionParams) {
  if (!moderatorSecret) {
    throw new Error("MOD_AUTH_NOT_CONFIGURED");
  }

  const payload = moderationActionInput.safeParse({ action, reason });
  if (!payload.success) {
    throw new Error(payload.error.issues[0]?.message ?? "Invalid action");
  }

  const res = await fetch(`${baseUrl}/api/moderation/graves/${graveId}/action`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-moderator-secret": moderatorSecret,
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
    status: string;
    featured: boolean;
    remainingReports: number;
  };
}
