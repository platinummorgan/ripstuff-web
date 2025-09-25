import { cookies, headers } from "next/headers";
import { createHash, randomUUID } from "node:crypto";

const DEVICE_COOKIE = "rip_device";
const DEVICE_HEADER = "x-rip-device";

export function resolveDeviceHash(): string {
  const headerValue = headers().get(DEVICE_HEADER);
  if (headerValue) {
    return headerValue;
  }

  const existingCookie = cookies().get(DEVICE_COOKIE)?.value;
  if (existingCookie) {
    return existingCookie;
  }

  const fallback = createHash("sha256")
    .update(`${randomUUID()}::${headers().get("user-agent") ?? "unknown"}`)
    .digest("hex");

  cookies().set(DEVICE_COOKIE, fallback, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 90,
    sameSite: "lax",
  });

  return fallback;
}

export function getDeviceCookieName() {
  return DEVICE_COOKIE;
}
