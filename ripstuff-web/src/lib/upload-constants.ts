export const ALLOWED_IMAGE_CONTENT_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
] as const;

export const ALLOWED_VIDEO_CONTENT_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;

/**
 * Provider-agnostic allowed upload content types.
 */
export const ALLOWED_UPLOAD_CONTENT_TYPES = [
  ...ALLOWED_IMAGE_CONTENT_TYPES,
  ...ALLOWED_VIDEO_CONTENT_TYPES,
] as const;

export type ImageContentType = (typeof ALLOWED_IMAGE_CONTENT_TYPES)[number];
export type VideoContentType = (typeof ALLOWED_VIDEO_CONTENT_TYPES)[number];
export type UploadContentType = (typeof ALLOWED_UPLOAD_CONTENT_TYPES)[number];

export const MAX_IMAGE_SIZE_BYTES = 3 * 1024 * 1024; // informational; not strictly enforced when local
export const MAX_VIDEO_SIZE_BYTES = 20 * 1024 * 1024; // default cap for non-local providers

const provider = (process.env.UPLOAD_PROVIDER || "blob").toLowerCase();
const SIMULATE_PROD = process.env.SIMULATE_PROD === "1";
// For local dev we allow bigger files since we post-process; keep a sane upper bound to avoid OOM
const LOCAL_DEV_MAX_BYTES = 100 * 1024 * 1024; // 100MB

export const MAX_UPLOAD_SIZE_BYTES = provider === "local" && !SIMULATE_PROD ? LOCAL_DEV_MAX_BYTES : MAX_VIDEO_SIZE_BYTES;
