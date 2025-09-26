import { NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { generateEulogy, MissingOpenAiKeyError } from "@/lib/ai/eulogy";
import { resolveDeviceHash } from "@/lib/device";
import { forbidden, internalError, json, rateLimitError, validationError } from "@/lib/http";
import prisma from "@/lib/prisma";
import { checkRateLimit, rateLimitRetrySeconds } from "@/lib/rate-limit";
import { eulogyGenerateInput, eulogyGenerateResponse } from "@/lib/validation";

const RATE_LIMIT = Number.parseInt(process.env.EULOGY_RATE_LIMIT ?? "2", 10);
const RATE_WINDOW_SECONDS = Number.parseInt(process.env.EULOGY_RATE_WINDOW ?? "60", 10);
const DRAFT_TTL_SECONDS = Number.parseInt(process.env.EULOGY_DRAFT_TTL ?? "900", 10);

export async function POST(req: NextRequest) {
  const raw = await req.json().catch(() => null);

  const parsed = eulogyGenerateInput.safeParse(raw);
  if (!parsed.success) {
    return validationError(parsed.error);
  }

  // Check if user is authenticated
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return json({ error: 'Authentication required to generate eulogies' }, { status: 401 });
  }

  const deviceHash = resolveDeviceHash();

  const rateResult = await checkRateLimit({
    scope: "eulogy:generate",
    identifier: deviceHash,
    limit: RATE_LIMIT,
    windowSeconds: RATE_WINDOW_SECONDS,
  });

  if (!rateResult.ok) {
    return rateLimitError(rateLimitRetrySeconds(rateResult));
  }

  try {
    const { text, tokensUsed, provider, fallbackUsed } = await generateEulogy(parsed.data);
    
    // Log provider usage for monitoring
    if (fallbackUsed) {
      console.log(`Eulogy generated using fallback provider: ${provider}`);
    }

    const expiresAt = new Date(Date.now() + DRAFT_TTL_SECONDS * 1000);

    const baseData = {
      deviceHash,
      title: parsed.data.title,
      yearsText: parsed.data.years ?? null,
      backstory: parsed.data.backstory ?? null,
      category: parsed.data.category,
      eulogyText: text,
      tokensUsed,
      expiresAt,
      emotion: parsed.data.emotion ?? "heartfelt",
    };

    let draft;
    if (parsed.data.regenerateFromId) {
      const existing = await prisma.eulogyDraft.findFirst({
        where: {
          id: parsed.data.regenerateFromId,
          deviceHash,
        },
      });

      if (!existing) {
        return forbidden("EULOGY_DRAFT_NOT_FOUND");
      }

      draft = await prisma.eulogyDraft.update({
        where: { id: existing.id },
        data: baseData,
      });
    } else {
      draft = await prisma.eulogyDraft.create({ data: baseData });
    }

    void prisma.eulogyDraft
      .deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      })
      .catch((error) => {
        console.warn("Failed to purge expired eulogy drafts", error);
      });

    const payload = eulogyGenerateResponse.parse({
      eulogyId: draft.id,
      text,
      tokensUsed,
    });

    return json(payload, 200);
  } catch (error) {
    if (error instanceof MissingOpenAiKeyError) {
      return json(
        {
          code: "SERVICE_UNAVAILABLE",
          message: error.message,
        },
        503,
      );
    }

    // Handle known OpenAI errors more gracefully
    const anyErr = error as any;
    const code = anyErr?.code ?? anyErr?.error?.code;
    if (code === "insufficient_quota") {
      return json(
        {
          code: "SERVICE_UNAVAILABLE",
          message: "AI eulogy service is temporarily unavailable. Please try writing your own eulogy using the 'Write My Own' option, or contact support.",
        },
        503,
      );
    }

    console.error("/api/eulogies error", error);
    return internalError();
  }
}
