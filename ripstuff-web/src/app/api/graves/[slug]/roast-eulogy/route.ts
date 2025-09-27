import { Prisma, RoastEulogyType } from "@prisma/client";
import { NextRequest } from "next/server";
import { z } from "zod";

import { resolveDeviceHash } from "@/lib/device";
import { internalError, json, notFound, validationError } from "@/lib/http";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ slug: string }>;
}

function looksLikeUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

const roastEulogyInput = z.object({
  type: z.nativeEnum(RoastEulogyType),
  action: z.enum(["ADD", "REMOVE"]).default("ADD"),
});

const counterFieldByType: Record<RoastEulogyType, keyof Prisma.GraveUncheckedUpdateInput> = {
  ROAST: "roastCount",
  EULOGY: "eulogyCount",
};

export async function POST(req: NextRequest, context: RouteContext) {
  const raw = await req.json().catch(() => null);
  const parsed = roastEulogyInput.safeParse(raw);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const { slug } = await context.params;
  if (!slug) {
    return notFound("Missing identifier");
  }

  const deviceHash = resolveDeviceHash();

  // Find grave by id (uuid) or slug
  const grave = await prisma.grave.findFirst({
    where: looksLikeUuid(slug) ? { id: slug } : { slug },
  });

  if (!grave || grave.status === "HIDDEN") {
    return notFound("Grave not found");
  }

  const field = counterFieldByType[parsed.data.type];

  try {
    if (parsed.data.action === "ADD") {
      try {
        await prisma.$transaction([
          prisma.roastEulogyReaction.create({
            data: {
              graveId: grave.id,
              deviceHash,
              type: parsed.data.type,
            },
          }),
          prisma.grave.update({
            where: { id: grave.id },
            data: {
              [field]: { increment: 1 },
            },
          }),
        ]);
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          // Duplicate reaction — ignore and return current counts
        } else {
          throw error;
        }
      }
    } else {
      // REMOVE
      const del = await prisma.roastEulogyReaction.deleteMany({
        where: { graveId: grave.id, deviceHash, type: parsed.data.type },
      });
      if (del.count > 0) {
        await prisma.grave.update({
          where: { id: grave.id },
          data: {
            [field]: { decrement: 1 },
          },
        });
      }
    }

    const fresh = await prisma.grave.findUnique({
      where: { id: grave.id },
      select: {
        roastCount: true,
        eulogyCount: true,
      },
    });

    if (!fresh) {
      return internalError();
    }

    return json(
      {
        roastCount: fresh.roastCount,
        eulogyCount: fresh.eulogyCount,
      },
      200,
    );
  } catch (error) {
    console.error("Roast/Eulogy reaction error:", error);
    return internalError();
  }
}

// GET endpoint to retrieve current roast/eulogy counts and user's vote
export async function GET(req: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  if (!slug) {
    return notFound("Missing identifier");
  }

  const deviceHash = resolveDeviceHash();

  // Find grave by id (uuid) or slug
  const grave = await prisma.grave.findFirst({
    where: looksLikeUuid(slug) ? { id: slug } : { slug },
    select: {
      id: true,
      roastCount: true,
      eulogyCount: true,
    },
  });

  if (!grave) {
    return notFound("Grave not found");
  }

  // Check if user has already voted
  const existingVote = await prisma.roastEulogyReaction.findUnique({
    where: {
      graveId_deviceHash: {
        graveId: grave.id,
        deviceHash,
      },
    },
    select: {
      type: true,
    },
  });

  return json(
    {
      roastCount: grave.roastCount,
      eulogyCount: grave.eulogyCount,
      userVote: existingVote?.type || null,
    },
    200,
  );
}