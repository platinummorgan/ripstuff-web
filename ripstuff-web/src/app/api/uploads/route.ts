import { NextRequest } from "next/server";

import { resolveDeviceHash } from "@/lib/device";
import { internalError, json, validationError } from "@/lib/http";
import { createImageUploadToken } from "@/lib/uploads";
import { createUploadUrlInput, createUploadUrlResponse } from "@/lib/validation";
import { moderateImage } from "@/lib/image-moderation";
import { ALLOWED_UPLOAD_CONTENT_TYPES } from "@/lib/upload-constants";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const raw = await req.json().catch(() => null);
  const parsed = createUploadUrlInput.safeParse(raw);

  if (!parsed.success) {
    const ct = raw?.contentType as string | undefined;
    if (ct && !ALLOWED_UPLOAD_CONTENT_TYPES.includes(ct as any)) {
      return json(
        {
          code: "BAD_REQUEST",
          message:
            `Unsupported file type: ${ct}. Allowed: ${ALLOWED_UPLOAD_CONTENT_TYPES.join(", ")}.` +
            ` Try a JPEG/PNG/WebP image or MP4/WEBM/MOV video.`,
        },
        400,
      );
    }
    return validationError(parsed.error);
  }

  const deviceHash = resolveDeviceHash();

  // Simulate moderation check (stub)
  // Skip moderation in local provider for smoother dev
  const provider = (process.env.UPLOAD_PROVIDER || "blob").toLowerCase();
  const simulateProd = process.env.SIMULATE_PROD === "1";
  if (provider !== "local" || simulateProd) {
    const dummyBuffer = Buffer.alloc(Math.min(parsed.data.contentLength, 1024));
    const moderationResult = await moderateImage(dummyBuffer);
    if (!moderationResult.safe) {
      return json(
        {
          code: "MODERATION_REJECTED",
          message:
            moderationResult.reason ||
            "Image failed automated moderation. Escalated for review.",
        },
        403,
      );
    }
  }

  try {
    const result = await createImageUploadToken({
      contentType: parsed.data.contentType,
      contentLength: parsed.data.contentLength,
      deviceHash,
    });

    let payload: unknown;
    if (result.provider === "blob") {
      payload = {
        provider: "blob" as const,
        clientToken: result.clientToken!,
        pathname: result.pathname!,
        validUntil: result.validUntil.toISOString(),
        maximumSizeInBytes: result.maximumSizeInBytes,
      };
    } else if (result.provider === "s3") {
      payload = {
        provider: "s3" as const,
        url: result.url!,
        method: result.method!,
        headers: result.headers!,
        objectUrl: result.objectUrl!,
        bucket: result.bucket!,
        key: result.key!,
        validUntil: result.validUntil.toISOString(),
        maximumSizeInBytes: result.maximumSizeInBytes,
      };
    } else {
      payload = {
        provider: "local" as const,
        url: result.url!,
        method: result.method!,
        headers: result.headers!,
        objectUrl: result.objectUrl!,
        key: result.key!,
        validUntil: result.validUntil.toISOString(),
        maximumSizeInBytes: result.maximumSizeInBytes,
      };
    }

    return json(createUploadUrlResponse.parse(payload), 201);
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === "Unsupported image content type" ||
        error.message === "Image exceeds maximum size" ||
        error.message === "File too large for local processing limit"
      ) {
        return json(
          {
            code: "BAD_REQUEST",
            message: error.message,
          },
          400,
        );
      }

      if (error.message === "BLOB_READ_WRITE_TOKEN is not configured" || error.message === "S3 environment is not configured") {
        return json({ 
          code: "UPLOADS_NOT_CONFIGURED", 
          message: "File upload is temporarily unavailable. Please try again later or contact support." 
        }, 500);
      }
    }

    console.error("/api/uploads error", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Upload configuration error:", errorMessage);
    return json({
      code: "INTERNAL_ERROR",
      message: `Upload configuration error: ${errorMessage}`
    }, 500);
  }
}
