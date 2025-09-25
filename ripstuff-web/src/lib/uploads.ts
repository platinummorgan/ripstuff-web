import { randomBytes } from "node:crypto";

import { generateClientTokenFromReadWriteToken } from "@vercel/blob/client";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import {
  ALLOWED_UPLOAD_CONTENT_TYPES,
  MAX_UPLOAD_SIZE_BYTES,
  type UploadContentType,
} from "./upload-constants";

const DEFAULT_UPLOAD_TTL_MS = 15 * 60 * 1000;

const EXTENSION_BY_CONTENT_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

interface CreateUploadTokenArgs {
  contentType: string;
  contentLength: number;
  deviceHash: string;
}

export interface UploadToken {
  provider: "blob" | "s3" | "local";
  // Blob fields
  clientToken?: string;
  pathname?: string;
  // S3 fields
  url?: string;
  method?: "PUT";
  headers?: Record<string, string>;
  bucket?: string;
  key?: string;
  objectUrl?: string;
  // Shared
  validUntil: Date;
  maximumSizeInBytes: number;
}

function ensureBlobToken() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
  }

  return token;
}

function resolveExtension(contentType: UploadContentType | string) {
  if (EXTENSION_BY_CONTENT_TYPE[contentType]) {
    return EXTENSION_BY_CONTENT_TYPE[contentType];
  }

  if (contentType.includes("/")) {
    const [, inferred] = contentType.split("/");
    if (inferred) {
      return inferred;
    }
  }

  return "bin";
}

function sanitizeDeviceHash(deviceHash: string) {
  return deviceHash.replace(/[^a-z0-9]/gi, "").slice(0, 12) || "anonymous";
}

export async function createImageUploadToken({
  contentType,
  contentLength,
  deviceHash,
}: CreateUploadTokenArgs): Promise<UploadToken> {
  if (!ALLOWED_UPLOAD_CONTENT_TYPES.includes(contentType as UploadContentType)) {
    throw new Error("Unsupported image content type");
  }

  if (contentLength > MAX_UPLOAD_SIZE_BYTES) {
    const isLocal = (process.env.UPLOAD_PROVIDER || "blob").toLowerCase() === "local";
    throw new Error(isLocal ? "File too large for local processing limit" : "Image exceeds maximum size");
  }

  const ttlMs = Date.now() + DEFAULT_UPLOAD_TTL_MS;
  const extension = resolveExtension(contentType);
  const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const owner = sanitizeDeviceHash(deviceHash);
  const randomSuffix = randomBytes(8).toString("hex");
  const key = `graves/${datePrefix}/${owner}-${randomSuffix}.${extension}`;

  const provider = (process.env.UPLOAD_PROVIDER || "blob").toLowerCase();

  if (provider === "local") {
    const url = `/api/uploads/local?key=${encodeURIComponent(key)}`;
    const objectUrl = `/uploads/${key}`;
    return {
      provider: "local",
      url,
      method: "PUT",
      headers: { "Content-Type": contentType },
      key,
      objectUrl,
      validUntil: new Date(ttlMs),
      maximumSizeInBytes: MAX_UPLOAD_SIZE_BYTES,
    };
  }

  if (provider === "s3") {
    const bucket = process.env.AWS_S3_BUCKET;
    const region = process.env.AWS_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!bucket || !region || !accessKeyId || !secretAccessKey) {
      throw new Error("S3 environment is not configured");
    }

    const s3 = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      CacheControl: "public, max-age=2592000",
    });

    const url = await getSignedUrl(s3, command, { expiresIn: Math.floor((ttlMs - Date.now()) / 1000) });
    const objectUrl = `https://${bucket}.s3.${region}.amazonaws.com/${encodeURIComponent(key)}`;

    return {
      provider: "s3",
      url,
      method: "PUT",
      headers: { "Content-Type": contentType },
      bucket,
      key,
      objectUrl,
      validUntil: new Date(ttlMs),
      maximumSizeInBytes: MAX_UPLOAD_SIZE_BYTES,
    };
  }

  // Default: Blob
  const blobToken = ensureBlobToken();
  const pathname = key;
  const clientToken = await generateClientTokenFromReadWriteToken({
    token: blobToken,
    pathname,
    maximumSizeInBytes: Math.min(contentLength, MAX_UPLOAD_SIZE_BYTES),
    allowedContentTypes: [contentType],
    validUntil: ttlMs,
    addRandomSuffix: false,
    cacheControlMaxAge: 60 * 60 * 24 * 30,
  });

  return {
    provider: "blob",
    clientToken,
    pathname,
    validUntil: new Date(ttlMs),
    maximumSizeInBytes: MAX_UPLOAD_SIZE_BYTES,
  };
}
