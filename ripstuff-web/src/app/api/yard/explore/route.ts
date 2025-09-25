import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { json, validationError, internalError } from "@/lib/http";

export const dynamic = 'force-dynamic';
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const search = new URL(req.url).searchParams;
  const limit = Math.min(Math.max(Number(search.get("limit") ?? 30), 1), 60);
  const cursorStr = search.get("cursor");
  const cursor = cursorStr ? new Date(cursorStr) : undefined;
  if (cursorStr && Number.isNaN(cursor?.getTime())) {
    return validationError({
      issues: [{ code: "custom", path: ["cursor"], message: "Invalid cursor" }],
      name: "ZodError",
      errors: [],
    } as any);
  }

  try {
    const where: any = { status: "APPROVED", NOT: { creatorDeviceHash: null } };
    if (cursor) where.createdAt = { lt: cursor };
    const rows = await (prisma as any).grave.findMany({
      where,
      select: { creatorDeviceHash: true, createdAt: true, photoUrl: true },
      orderBy: { createdAt: "desc" },
      distinct: ["creatorDeviceHash"],
      take: limit + 1,
    });

    let nextCursor: string | null = null;
    const slice = rows.slice(0, limit);
    if (rows.length > limit) {
      const last = rows[limit - 1];
      nextCursor = last.createdAt.toISOString();
    }

    const items = await Promise.all(
      slice.map(async (r: any) => {
        const yardId: string = r.creatorDeviceHash;
        const count = await (prisma as any).grave.count({ where: { status: "APPROVED", creatorDeviceHash: yardId } });
        return {
          yardId,
          latestAt: r.createdAt.toISOString(),
          samplePhotoUrl: r.photoUrl as string | null,
          count: Number(count) || 0,
        };
      }),
    );

    return json({ items, nextCursor });
  } catch (e) {
    return internalError();
  }
}
