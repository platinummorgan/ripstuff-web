import { z } from "zod";
import { GraveCategory, ModerationActionType, GraveStatus } from "@prisma/client";

export const moderationActionInput = z.object({
  action: z.nativeEnum(ModerationActionType),
  reason: z.string().trim().max(280).optional(),
});

export const moderationNoteInput = z.object({
  body: z.string().trim().min(1).max(280),
});

export const moderationListQuery = z.object({
  status: z.nativeEnum(GraveStatus).optional(),
  reported: z
    .union([
      z.literal("true"),
      z.literal("false"),
      z.boolean(),
    ])
    .optional(),
  cursor: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const moderationQueueItem = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  status: z.nativeEnum(GraveStatus),
  featured: z.boolean(),
  createdAt: z.string().datetime(),
  reports: z.number().int().nonnegative(),
  reportDetails: z.array(
    z.object({
      id: z.string().uuid(),
      reason: z.string().nullable(),
      createdAt: z.string().datetime(),
      deviceHash: z.string(),
    }),
  ),
  category: z.nativeEnum(GraveCategory),
  eulogyPreview: z.string().max(160),
  backstory: z.string().nullable(),
  lastActions: z.array(
    z.object({
      id: z.string().uuid(),
      action: z.nativeEnum(ModerationActionType),
      reason: z.string().nullable(),
      createdAt: z.string().datetime(),
    }),
  ),
});

export const moderationQueueResponse = z.object({
  items: z.array(moderationQueueItem),
  nextCursor: z.string().datetime().nullable(),
});

export type ModerationActionInput = z.infer<typeof moderationActionInput>;
