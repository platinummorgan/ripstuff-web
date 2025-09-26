import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GraveCategory } from "@prisma/client";
import type { GraveCoreFields, EulogyEmotion } from "@/lib/validation";

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

export class MissingGeminiKeyError extends Error {
  constructor() {
    super("GEMINI_API_KEY is not configured");
    this.name = "MissingGeminiKeyError";
  }
}

let client: GoogleGenerativeAI | null = null;

function getClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new MissingGeminiKeyError();
  }

  if (!client) {
    // Try with explicit configuration
    client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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
  provider: "gemini";
}

export async function generateEulogyWithGemini(
  input: GraveCoreFields & { emotion: EulogyEmotion }
): Promise<GenerateEulogyResult> {
  console.log('🔍 Gemini Debug - Starting generation...');
  console.log('🔑 API Key exists:', !!process.env.GEMINI_API_KEY);
  console.log('🔑 API Key preview:', process.env.GEMINI_API_KEY?.substring(0, 10) + '...');
  
  try {
    const prompt = buildPrompt(input);
    console.log('📝 Prompt built:', prompt.substring(0, 100) + '...');
    
    const client = getClient();
    console.log('✅ Client created successfully');
    
    // Use the basic model name that should definitely exist
    const model = client.getGenerativeModel({ 
      model: "gemini-pro",  // This is the stable model name
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      }
    });
    console.log('📱 Model created: gemini-pro with config');

    const emotionStyle = EMOTION_STYLES[input.emotion];
    const systemPrompt = `You are an empathetic eulogist for beloved everyday objects. Your voice should be ${emotionStyle}. Keep outputs between 85 and 150 words, with 4-5 short paragraphs or sentences separated by newlines. Never mention that the subject is fictional; avoid dark or real-world tragedies. Focus on the object's service and impact with the requested emotional tone.`;

    const userPrompt = `${prompt}\n\nFollow this template:\nOpening: 'We gather to remember [NAME], faithful [ROLE]...'\nService: Reference 1-2 concrete memories in ${emotionStyle} tone.\nDemise: Describe what ended its service using ${emotionStyle} approach.\nLegacy: What it meant using ${emotionStyle} perspective.\nFarewell: 'May [NAME] rest among ...' using category motif.\nMaintain ${emotionStyle} throughout. Avoid emojis.`;

    console.log('🚀 Making API call to Gemini...');
    console.log('📝 Full prompt length:', (`${systemPrompt}\n\n${userPrompt}`).length);
    
    // Make only one API call to avoid rate limits
    const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
    console.log('✅ API call successful!');

    const response = result.response;
    const rawText = normalizeText(response.text() ?? "");
    console.log('📄 Raw response length:', rawText.length);
    
    if (!rawText) {
      throw new Error("Gemini returned an empty eulogy");
    }

    const text = clampToRange(rawText, 80, 280);
    const estimatedTokens = Math.ceil(text.length / 4);

    console.log('✅ Gemini generation completed successfully!');
    return {
      text,
      tokensUsed: estimatedTokens,
      provider: "gemini" as const,
    };
  } catch (error: any) {
    console.error('❌ Gemini API error details:');
    console.error('Error message:', error?.message);
    console.error('Error status:', error?.status);
    console.error('Error code:', error?.code);
    console.error('Error name:', error?.name);
    console.error('Error cause:', error?.cause);
    console.error('Error stack:', error?.stack);
    console.error('Full error object:', JSON.stringify(error, null, 2));
    
    // Check if this is a GoogleGenerativeAIError
    if (error.constructor?.name) {
      console.error('Error constructor:', error.constructor.name);
    }
    
    // Check for specific Google error properties
    if (error?.error) {
      console.error('Nested error:', error.error);
      console.error('Nested error code:', error.error?.code);
      console.error('Nested error message:', error.error?.message);
      console.error('Nested error status:', error.error?.status);
    }
    
    // Check response details if available
    if (error?.response) {
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
    }
    
    // Handle specific error codes from Google's troubleshooting guide
    const errorCode = error?.code || error?.error?.code || error?.status;
    const errorMessage = error?.message || error?.error?.message || "Unknown error";
    
    if (errorCode === 400) {
      throw new Error(`Gemini API 400 Bad Request: ${errorMessage}. Check request format and parameters.`);
    }
    
    if (errorCode === 403) {
      throw new Error(`Gemini API 403 Forbidden: ${errorMessage}. Check API key permissions and project access.`);
    }
    
    if (errorCode === 404) {
      throw new Error(`Gemini API 404 Not Found: ${errorMessage}. The model or endpoint may not exist.`);
    }
    
    if (errorCode === 429) {
      throw new Error(`Gemini API quota exceeded. The free tier has very low rate limits (15 requests per minute, 1500 per day). Please wait a few minutes before trying again, or consider upgrading your Google Cloud plan for higher limits.`);
    }
    
    if (errorCode === 500) {
      throw new Error(`Gemini API 500 Internal Error: ${errorMessage}. Google server error, try again later.`);
    }
    
    // Generic fallback with all available info
    throw new Error(`Gemini generation failed (${errorCode || 'unknown'}): ${errorMessage}`);
  }

  // TODO: Re-enable actual Gemini API once Google's setup is working
  /*
  // Dev fallback: allow bypassing Gemini to unblock local testing
  const shouldUseFake = process.env.EULOGY_FAKE === "1" || 
    (process.env.NODE_ENV === "development" && !process.env.GEMINI_API_KEY);
  
  if (shouldUseFake) {
    const fake = `We gather to remember ${input.title}, faithful companion.\n\nIt served ${input.years ?? "for many seasons"} ${CATEGORY_SLOGANS[input.category]}.\n\nThough its final day came with little fanfare, its small miracles made life easier.\n\nMay ${input.title} rest ${CATEGORY_SLOGANS[input.category]}.`;
    return { text: clampToRange(fake), tokensUsed: 0, provider: "gemini" };
  }
  */

  const prompt = buildPrompt(input);
  const client = getClient();
  // Use the model that works with Google AI Studio keys
  const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });

  const emotionStyle = EMOTION_STYLES[input.emotion];
  const systemPrompt = `You are an empathetic eulogist for beloved everyday objects. Your voice should be ${emotionStyle}. Keep outputs between 85 and 150 words, with 4-5 short paragraphs or sentences separated by newlines. Never mention that the subject is fictional; avoid dark or real-world tragedies. Focus on the object's service and impact with the requested emotional tone.`;

  const userPrompt = `${prompt}\n\nFollow this template:\nOpening: 'We gather to remember [NAME], faithful [ROLE]...'\nService: Reference 1-2 concrete memories in ${emotionStyle} tone.\nDemise: Describe what ended its service using ${emotionStyle} approach.\nLegacy: What it meant using ${emotionStyle} perspective.\nFarewell: 'May [NAME] rest among ...' using category motif.\nMaintain ${emotionStyle} throughout. Avoid emojis.`;

  try {
    const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);

    const response = result.response;
    const rawText = normalizeText(response.text() ?? "");
    
    if (!rawText) {
      throw new Error("Gemini returned an empty eulogy");
    }

    const text = clampToRange(rawText, 80, 280);

    // Gemini doesn't provide token count in the same way, estimate based on text length
    const estimatedTokens = Math.ceil(text.length / 4); // rough estimate

    return {
      text,
      tokensUsed: estimatedTokens,
      provider: "gemini" as const,
    };
  } catch (error: any) {
    console.error("Gemini API error:", error);
    
    // Handle specific Gemini errors with helpful messages
    if (error?.message?.includes("quota")) {
      throw new Error("Gemini API quota exceeded. Please try again later or check your Google Cloud usage limits.");
    }
    
    if (error?.message?.includes("API key") || error?.message?.includes("authentication")) {
      throw new MissingGeminiKeyError();
    }
    
    if (error?.message?.includes("models/gemini") || error?.message?.includes("not found")) {
      throw new Error("The Gemini model is not available. Please enable the Generative AI API in your Google Cloud project at https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com");
    }
    
    if (error?.status === 403) {
      throw new Error("Gemini API access denied. Please check your API key has the correct permissions for the Generative Language API.");
    }
    
    if (error?.status === 400) {
      throw new Error("Invalid request to Gemini API. The input may be too long or contain unsupported content.");
    }
    
    // Generic fallback with the original error message
    const errorMessage = error?.message || error?.toString() || "Unknown error";
    throw new Error(`Gemini generation failed: ${errorMessage}`);
  }
}