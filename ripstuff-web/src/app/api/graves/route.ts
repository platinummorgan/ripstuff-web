import { Prisma, GraveStatus } from "@prisma/client";
import { NextRequest } from "next/server";

import { enforceGuidelines } from "@/lib/content-guard";
import { resolveDeviceHash } from "@/lib/device";
import { forbidden, internalError, json, rateLimitError, validationError } from "@/lib/http";
import { generateMapCoordinates, findOptimalCoordinates, getDistrictGraveCounts } from "@/lib/map-coordinates";
import prisma from "@/lib/prisma";
import { checkRateLimit, rateLimitRetrySeconds } from "@/lib/rate-limit";
import { generateSlug } from "@/lib/slug";
import { createGraveInput, createGraveResponse } from "@/lib/validation";

const CREATE_LIMIT = Number.parseInt(process.env.GRAVE_CREATE_LIMIT ?? "3", 10);
const CREATE_WINDOW_SECONDS = Number.parseInt(process.env.GRAVE_CREATE_WINDOW ?? "86400", 10);

export async function POST(req: NextRequest) {
  const raw = await req.json().catch(() => null);
  // Safety net: accept relative photoUrl (e.g., "/uploads/…") in dev/local and normalize to absolute
  if (raw && typeof raw.photoUrl === "string" && raw.photoUrl.startsWith("/")) {
    const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
    raw.photoUrl = `${base}${raw.photoUrl}`;
  }
  const parsed = createGraveInput.safeParse(raw);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const deviceHash = resolveDeviceHash();

  const rateResult = await checkRateLimit({
    scope: "grave:create",
    identifier: deviceHash,
    limit: CREATE_LIMIT,
    windowSeconds: CREATE_WINDOW_SECONDS,
  });

  if (!rateResult.ok) {
    return rateLimitError(rateLimitRetrySeconds(rateResult));
  }

  try {
    enforceGuidelines({
      title: parsed.data.title,
      backstory: parsed.data.backstory ?? null,
    });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("BANNED_TERM:")) {
      return forbidden("BANNED_TERM");
    }
  }

  try {
    let draft = null;
    
    // Only look for draft if eulogyId is provided (AI-generated eulogies)
    if (parsed.data.eulogyId) {
      draft = await prisma.eulogyDraft.findFirst({
        where: {
          id: parsed.data.eulogyId,
          deviceHash,
        },
      });

      if (!draft) {
        return forbidden("EULOGY_DRAFT_NOT_FOUND_OR_EXPIRED");
      }
    }

    const autoApprove = process.env.NEXT_PUBLIC_AUTO_APPROVE_IN_DEV === "1";
    
    // Generate map coordinates for the grave
    const gridSize = 16; // Default grid size, could be made configurable
    const preferredCoords = generateMapCoordinates(deviceHash, gridSize);
    
    // Get current district populations to balance distribution
    const districtCounts = await getDistrictGraveCounts(prisma, gridSize);
    const optimalCoords = await findOptimalCoordinates(
      preferredCoords.x, 
      preferredCoords.y, 
      gridSize, 
      districtCounts
    );
    
    const baseData = {
      title: parsed.data.title,
      datesText: parsed.data.datesText ?? draft?.yearsText ?? null,
      backstory: parsed.data.backstory ?? draft?.backstory ?? null,
      photoUrl: parsed.data.photoUrl ?? null,
      eulogyText: parsed.data.eulogyText,
      category: parsed.data.category,
      status: autoApprove ? GraveStatus.APPROVED : GraveStatus.PENDING,
      creatorDeviceHash: deviceHash,
      mapX: optimalCoords.x,
      mapY: optimalCoords.y,
    };

    let grave = null;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const slug = generateSlug(parsed.data.title);
      try {
        grave = await prisma.grave.create({
          data: {
            slug,
            ...baseData,
          },
        });
        break;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          continue;
        }
        throw error;
      }
    }

    if (!grave) {
      console.error("Failed to generate unique slug for grave");
      return internalError();
    }

    // Only delete draft if it exists (AI-generated eulogies)
    if (draft) {
      await prisma.eulogyDraft
        .delete({
          where: {
            id: draft.id,
          },
        })
        .catch((error) => {
          console.warn("Failed to delete consumed eulogy draft", error);
        });
    }

    void prisma.moderationAction
      .create({
        data: {
          graveId: grave.id,
          action: "NOTE",
          reason: "Auto-created pending grave",
        },
      })
      .catch(() => {});

    const shareBase = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    const responseBody = createGraveResponse.parse({
      id: grave.id,
      slug: grave.slug,
      status: grave.status,
      shareUrl: `${shareBase.replace(/\/$/, "")}/grave/${grave.slug}`,
    });

    return json(responseBody, 201);
  } catch (error) {
    console.error("/api/graves POST error", error);
    return internalError();
  }
}

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(new URL(req.url).searchParams.entries());
  const mine = params.mine === "1" || params.mine === "true";
  const limit = Math.min(Math.max(Number(params.limit ?? 12), 1), 24);
  const cursor = params.cursor ? new Date(params.cursor) : undefined;

  if (!mine) {
    return validationError({
      issues: [
        {
          code: "custom",
          path: ["mine"],
          message: "Only 'mine=1' queries are supported here",
        },
      ],
      name: "ZodError",
      errors: [],
    } as any);
  }

  const deviceHash = resolveDeviceHash();

  const where: any = {
    creatorDeviceHash: { equals: deviceHash },
    status: { in: [GraveStatus.PENDING, GraveStatus.APPROVED] },
  };
  if (cursor && !Number.isNaN(cursor.getTime())) {
    where.createdAt = { lt: cursor };
  }

  try {
    const graves = await prisma.grave.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        eulogyText: true,
        photoUrl: true,
        heartCount: true,
        candleCount: true,
        roseCount: true,
        lolCount: true,
        createdAt: true,
        featured: true,
      },
    });

    let nextCursor: string | null = null;
    if (graves.length > limit) {
      const next = graves.pop();
      if (next) nextCursor = next.createdAt.toISOString();
    }

    const items = graves.map((grave) => ({
      id: grave.id,
      slug: grave.slug,
      title: grave.title,
      category: grave.category,
      eulogyPreview: grave.eulogyText.slice(0, 160),
      photoUrl: grave.photoUrl ?? null,
      reactions: {
        heart: grave.heartCount,
        candle: grave.candleCount,
        rose: grave.roseCount,
        lol: grave.lolCount,
      },
      createdAt: grave.createdAt.toISOString(),
      featured: grave.featured,
    }));

    return json({ items, nextCursor }, 200);
  } catch (error) {
    return internalError();
  }
}
