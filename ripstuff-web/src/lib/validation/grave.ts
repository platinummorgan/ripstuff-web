import { z } from "zod";
import { GraveCategory, GraveStatus } from "@prisma/client";

import { reactionAggregate, sympathyDto } from "./interaction";

export const graveCoreFields = z.object({
  title: z.string().trim().min(3).max(80),
  category: z.nativeEnum(GraveCategory),
  backstory: z.string().trim().max(140).optional(),
  years: z.string().trim().max(32).optional(),
});

export const eulogyGenerateInput = graveCoreFields.extend({
  regenerateFromId: z.string().uuid().optional(),
});

export const eulogyGenerateResponse = z.object({
  eulogyId: z.string().uuid(),
  text: z.string().trim().min(80).max(280),
  tokensUsed: z.number().int().positive(),
});

export const createGraveInput = graveCoreFields.extend({
  eulogyId: z.string().uuid().optional(),
  eulogyText: z.string().trim().min(80).max(1000),
  photoUrl: z.string().url().optional(),
  datesText: z.string().trim().max(64).optional(),
  agreeToGuidelines: z.literal(true),
});

const publishableStatus = z.nativeEnum(GraveStatus).superRefine((value, ctx) => {
  if (value === GraveStatus.HIDDEN) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Hidden graves are not exposed via public contract",
    });
  }
});

export const createGraveResponse = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  status: publishableStatus,
  shareUrl: z.string().url(),
});

export const feedItem = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  category: z.nativeEnum(GraveCategory),
  eulogyPreview: z.string().max(160),
  photoUrl: z.string().url().nullable(),
  reactions: reactionAggregate,
  createdAt: z.string().datetime(),
  featured: z.boolean(),
  mapX: z.number().int().nullable().optional(),
  mapY: z.number().int().nullable().optional(),
});

export const feedResponse = z.object({
  items: z.array(feedItem),
  nextCursor: z.string().datetime().nullable(),
});

export const graveDetailResponse = feedItem.extend({
  eulogyText: z.string(),
  datesText: z.string().nullable(),
  backstory: z.string().nullable(),
  sympathies: z.array(sympathyDto),
  status: z.nativeEnum(GraveStatus),
});

export const feedQuery = z.object({
  cursor: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(24).default(12),
  featured: z
    .union([
      z.literal("true"),
      z.literal("false"),
      z.boolean(),
    ])
    .optional(),
});

export type GraveCoreFields = z.infer<typeof graveCoreFields>;
export type CreateGraveInput = z.infer<typeof createGraveInput>;
export type FeedItem = z.infer<typeof feedItem>;
export type GraveDetailResponse = z.infer<typeof graveDetailResponse>;
