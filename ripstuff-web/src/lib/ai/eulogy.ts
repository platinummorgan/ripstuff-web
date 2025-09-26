import OpenAI from "openai";

import type { GraveCategory } from "@prisma/client";

import type { GraveCoreFields } from "@/lib/validation";

const DEFAULT_MODEL = process.env.EULOGY_MODEL ?? "gpt-4o-mini";
const DEFAULT_MAX_TOKENS = Number.parseInt(process.env.EULOGY_MAX_TOKENS ?? "320", 10);

const CATEGORY_SLOGANS: Record<GraveCategory, string> = {
  TECH_GADGETS: "among the noble circuitry",
  KITCHEN_FOOD: "in the pantry of legends",
  CLOTHING_LAUNDRY: "within the wardrobe of wandering threads",
  TOYS_GAMES: "amid the playful afterlife",
  CAR_TOOLS: "in the eternal garage",
  PETS_CHEWABLES: "beside the chew-toy constellations",
  OUTDOORS_ACCIDENTS: "under open skies eternal",
  MISC: "with the curious relics beyond",
};

export class MissingOpenAiKeyError extends Error {
  constructor() {
    super("OPENAI_API_KEY is not configured");
    this.name = "MissingOpenAiKeyError";
  }
}

let client: OpenAI | null = null;

function getClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new MissingOpenAiKeyError();
  }

  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || undefined,
    });
  }

  return client;
}

function buildPrompt(input: GraveCoreFields) {
  const { title, category, backstory, years } = input;
  const ceremonyLine = CATEGORY_SLOGANS[category] ?? "among gentle company";

  const context = `Item: ${title}\nCategory: ${category}\nYears or era: ${years ?? "unknown"}\nBackstory: ${backstory ?? "(none provided)"}\nPreferred farewell motif: ${ceremonyLine}`;

  return context;
}

function normalizeText(text: string) {
  const trimmed = text.trim();
  const collapsed = trimmed.replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n");
  return collapsed.replace(/\s{2,}/g, " ");
}

function clampToRange(text: string, min = 80, max = 280) {
  if (!text) return text;
  let t = normalizeText(text);
  if (t.length >= min && t.length <= max) return t;

  // If too long, try sentence-aware trim
  if (t.length > max) {
    const sentences = t.split(/(?<=[.!?])\s+/);
    let out = "";
    for (const s of sentences) {
      if ((out + (out ? " " : "") + s).length > max) break;
      out = out ? out + " " + s : s;
    }
    if (out.length >= min) return out;
    // Fallback: hard slice
    return t.slice(0, max).trim();
  }

  // If too short, pad with a gentle closing line
  if (t.length < min) {
    const pad = " We honor its small miracles and bid it gentle rest.";
    while (t.length < min && t.length + pad.length <= max) {
      t += pad;
    }
    if (t.length < min) {
      // last resort: ensure minimum by slicing a longer pad
      const needed = min - t.length;
      t += pad.slice(0, Math.min(needed, max - t.length));
    }
    return t;
  }

  return t;
}

export interface GenerateEulogyResult {
  text: string;
  tokensUsed: number;
}

export async function generateEulogy(input: GraveCoreFields): Promise<GenerateEulogyResult> {
  // Dev fallback: allow bypassing OpenAI to unblock local testing
  // Also automatically enable in development if OpenAI is not configured
  const shouldUseFake = process.env.EULOGY_FAKE === "1" || 
    (process.env.NODE_ENV === "development" && !process.env.OPENAI_API_KEY);
  
  if (shouldUseFake) {
    const fake = `We gather to remember ${input.title}, faithful companion.\n\nIt served ${input.years ?? "for many seasons"} ${CATEGORY_SLOGANS[input.category]}.\n\nThough its final day came with little fanfare, its small miracles made life easier.\n\nMay ${input.title} rest ${CATEGORY_SLOGANS[input.category]}.`;
    return { text: clampToRange(fake), tokensUsed: 0 };
  }

  const prompt = buildPrompt(input);
  const client = getClient();

  const response = await client.chat.completions.create({
    model: DEFAULT_MODEL,
    max_tokens: DEFAULT_MAX_TOKENS,
    temperature: 0.85,
    presence_penalty: 0.2,
    frequency_penalty: 0.2,
    messages: [
      {
        role: "system",
        content: "You are an empathetic eulogist for beloved everyday objects. Your voice is ceremonial, kind, and lightly witty. Keep outputs between 85 and 150 words, with 4-5 short paragraphs or sentences separated by newlines. Never mention that the subject is fictional; avoid dark or real-world tragedies.",
      },
      {
        role: "user",
        content: `${prompt}\n\nFollow this template:\nOpening: 'We gather to remember [NAME], faithful [ROLE]...'\nService: Reference 1-2 concrete memories.\nDemise: Playfully describe what ended its service.\nLegacy: What it meant and who it is survived by.\nFarewell: 'May [NAME] rest among ...' using category motif.\nKeep tone somber but sly. Avoid emojis.`,
      },
    ],
  });

  const rawText = normalizeText(response.choices[0]?.message?.content ?? "");
  if (!rawText) {
    throw new Error("OpenAI returned an empty eulogy");
  }

  const text = clampToRange(rawText, 80, 280);

  return {
    text,
    tokensUsed: response.usage?.total_tokens ?? 0,
  };
}
