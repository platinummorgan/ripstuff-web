import { NextResponse } from "next/server";
import type { ZodError } from "zod";

type JsonInit = number | ResponseInit | undefined;

type JsonData = Record<string, unknown> | Array<unknown> | null;

export function json<T extends JsonData>(data: T, init?: JsonInit) {
  if (typeof init === "number") {
    return NextResponse.json(data, { status: init });
  }

  return NextResponse.json(data, init);
}

export function validationError(error: ZodError) {
  return json(
    {
      code: "BAD_REQUEST",
      issues: error.issues,
    },
    400,
  );
}

export function rateLimitError(retryAfterSeconds: number) {
  return json(
    {
      code: "RATE_LIMIT",
      retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        "Retry-After": retryAfterSeconds.toString(),
      },
    },
  );
}

export function unauthorized(reason = "Unauthorized") {
  return json(
    {
      code: "UNAUTHORIZED",
      reason,
    },
    401,
  );
}

export function forbidden(reason: string) {
  return json(
    {
      code: "FORBIDDEN",
      reason,
    },
    403,
  );
}

export function internalError() {
  return json(
    {
      code: "INTERNAL_ERROR",
    },
    500,
  );
}

export function notFound(message = "Not found") {
  return json(
    {
      code: "NOT_FOUND",
      message,
    },
    404,
  );
}

export function notImplemented(message = "Not implemented") {
  return json(
    {
      code: "NOT_IMPLEMENTED",
      message,
    },
    501,
  );
}
