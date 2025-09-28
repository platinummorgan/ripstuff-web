import { z } from "zod";
import { ReactionType } from "@prisma/client";

export const reactionInput = z.object({
  type: z.nativeEnum(ReactionType),
  action: z.enum(["ADD", "REMOVE"]).default("ADD"),
});

export const reactionAggregate = z.object({
  heart: z.number().int().nonnegative(),
  candle: z.number().int().nonnegative(),
  rose: z.number().int().nonnegative(),
  lol: z.number().int().nonnegative(),
});

export const sympathyInput = z.object({
  body: z.string().trim().min(1).max(140),
  captchaToken: z.string().optional(),
});

export const sympathyDto = z.object({
  id: z.string().uuid(),
  body: z.string(),
  createdAt: z.string().datetime(),
  creatorInfo: z.object({
    name: z.string().nullable(),
    picture: z.string().nullable(),
  }).nullable(),
});

export const reportInput = z.object({
  reason: z.string().trim().max(280).optional(),
});

export const reportAck = z.object({
  acknowledged: z.boolean(),
});

export type ReactionInput = z.infer<typeof reactionInput>;
export type SympathyInput = z.infer<typeof sympathyInput>;
