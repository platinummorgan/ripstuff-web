import { z } from "zod";

import { ALLOWED_UPLOAD_CONTENT_TYPES, MAX_UPLOAD_SIZE_BYTES } from "@/lib/upload-constants";

const contentTypeSchema = z.enum(ALLOWED_UPLOAD_CONTENT_TYPES);

export const createUploadUrlInput = z.object({
  contentType: contentTypeSchema,
  contentLength: z.number().int().positive().max(MAX_UPLOAD_SIZE_BYTES),
});

const blobResponse = z.object({
  provider: z.literal("blob"),
  clientToken: z.string(),
  pathname: z.string(),
  validUntil: z.string().datetime(),
  maximumSizeInBytes: z.number().int().positive(),
});

const s3Response = z.object({
  provider: z.literal("s3"),
  url: z.string().url(),
  method: z.literal("PUT"),
  headers: z.record(z.string()),
  objectUrl: z.string().url(),
  bucket: z.string(),
  key: z.string(),
  validUntil: z.string().datetime(),
  maximumSizeInBytes: z.number().int().positive(),
});

const localResponse = z.object({
  provider: z.literal("local"),
  url: z.string(),
  method: z.literal("PUT"),
  headers: z.record(z.string()),
  objectUrl: z.string(),
  key: z.string(),
  validUntil: z.string().datetime(),
  maximumSizeInBytes: z.number().int().positive(),
});

export const createUploadUrlResponse = z.union([blobResponse, s3Response, localResponse]);

export type CreateUploadUrlInput = z.infer<typeof createUploadUrlInput>;
export type CreateUploadUrlResponse = z.infer<typeof createUploadUrlResponse>;
