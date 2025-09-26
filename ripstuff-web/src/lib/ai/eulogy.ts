import OpenAI from "openai";

import type { GraveCategory } from "@prisma/client";

import type { GraveCoreFields, EulogyEmotion } from "@/lib/validation";
import { generateEulogyWithGemini, MissingGeminiKeyError } from "./gemini";

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

const EMOTION_STYLES: Record<EulogyEmotion, string> = {
  heartfelt: "warm, sincere, and deeply caring with gentle emotion",
  humorous: "light-hearted, witty, and amusing while remaining respectful",
  nostalgic: "wistful, reminiscent, and bittersweet with fond memories",
  grateful: "thankful, appreciative, and celebrating the item's contributions",
  dramatic: "theatrical, grand, and epic as if for a legendary hero",
  poetic: "lyrical, artistic, and beautiful with flowing, elegant language",
  philosophical: "thoughtful, contemplative, and exploring deeper meanings",
  quirky: "playful, unique, and charmingly eccentric with personality"
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

function buildPrompt(input: GraveCoreFields & { emotion: EulogyEmotion }) {
  const { title, category, backstory, years, emotion } = input;
  const ceremonyLine = CATEGORY_SLOGANS[category] ?? "among gentle company";
  const emotionStyle = EMOTION_STYLES[emotion];

  const context = `Item: ${title}\nCategory: ${category}\nYears or era: ${years ?? "unknown"}\nBackstory: ${backstory ?? "(none provided)"}\nPreferred farewell motif: ${ceremonyLine}\nTone: ${emotionStyle}`;

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
  provider?: "openai" | "gemini";
  fallbackUsed?: boolean;
}

export async function generateEulogy(input: GraveCoreFields & { emotion?: EulogyEmotion }): Promise<GenerateEulogyResult> {
  const inputWithEmotion = { ...input, emotion: input.emotion ?? "heartfelt" };

  // Dev fallback: allow bypassing all AI to unblock local testing
  const shouldUseFake = process.env.EULOGY_FAKE === "1";
  
  if (shouldUseFake) {
    const fake = `We gather to remember ${input.title}, faithful companion.\n\nIt served ${input.years ?? "for many seasons"} ${CATEGORY_SLOGANS[input.category]}.\n\nThough its final day came with little fanfare, its small miracles made life easier.\n\nMay ${input.title} rest ${CATEGORY_SLOGANS[input.category]}.`;
    return { text: clampToRange(fake), tokensUsed: 0, provider: "openai" };
  }

  // Try OpenAI first
  try {
    return await generateEulogyWithOpenAI(inputWithEmotion);
  } catch (error) {
    console.warn("OpenAI failed, trying Gemini fallback:", error);
    
    // If OpenAI fails, try Gemini as fallback
    try {
      const result = await generateEulogyWithGemini(inputWithEmotion);
      return { ...result, fallbackUsed: true };
    } catch (geminiError) {
      console.error("Both OpenAI and Gemini failed:", { openaiError: error, geminiError });
      
      // If both fail, throw a comprehensive error
      const openaiMsg = error instanceof Error ? error.message : "Unknown OpenAI error";
      const geminiMsg = geminiError instanceof Error ? geminiError.message : "Unknown Gemini error";
      
      throw new Error(`AI eulogy generation failed. OpenAI: ${openaiMsg}. Gemini: ${geminiMsg}. Please try writing your own eulogy using the 'Write My Own' option.`);
    }
  }
}

async function generateEulogyWithOpenAI(input: GraveCoreFields & { emotion: EulogyEmotion }): Promise<GenerateEulogyResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new MissingOpenAiKeyError();
  }

  const prompt = buildPrompt(input);
  const client = getClient();
  const emotionStyle = EMOTION_STYLES[input.emotion];

  const response = await client.chat.completions.create({
    model: DEFAULT_MODEL,
    max_tokens: DEFAULT_MAX_TOKENS,
    temperature: 0.85,
    presence_penalty: 0.2,
    frequency_penalty: 0.2,
    messages: [
      {
        role: "system",
        content: `You are an empathetic eulogist for beloved everyday objects. Your voice should be ${emotionStyle}. Keep outputs between 85 and 150 words, with 4-5 short paragraphs or sentences separated by newlines. Never mention that the subject is fictional; avoid dark or real-world tragedies.`,
      },
      {
        role: "user",
        content: `${prompt}\n\nFollow this template:\nOpening: 'We gather to remember [NAME], faithful [ROLE]...'\nService: Reference 1-2 concrete memories in ${emotionStyle} tone.\nDemise: Describe what ended its service using ${emotionStyle} approach.\nLegacy: What it meant using ${emotionStyle} perspective.\nFarewell: 'May [NAME] rest among ...' using category motif.\nMaintain ${emotionStyle} throughout. Avoid emojis.`,
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
    provider: "openai" as const,
  };
}
