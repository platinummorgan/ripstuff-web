import { NextRequest } from "next/server";
import { resolveDeviceHash } from "@/lib/device";
import { json } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(_req: NextRequest) {
  const yardId = resolveDeviceHash();
  return json({ yardId });
}
