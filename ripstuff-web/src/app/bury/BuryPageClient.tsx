"use client";

import { useState } from "react";
import { PageHero } from "@/components/PageHero";
import { SectionHeader } from "@/components/SectionHeader";
import { Button } from "@/components/Button";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export function BuryPageClient() {
  const [formData, setFormData] = useState({
    title: "",
    category: "MISC" as const,
    backstory: "",
    years: "",
    agreeToGuidelines: false,
  });
  const [selectedEmotion, setSelectedEmotion] = useState<string>("heartfelt");
  const [media, setMedia] = useState<{ file: File | null; preview: string | null; uploadedUrl: string | null }>({ file: null, preview: null, uploadedUrl: null });
  const [isGenerating, setIsGenerating] = useState(false);
  const [eulogy, setEulogy] = useState("");
  const [eulogyId, setEulogyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [eulogyMode, setEulogyMode] = useState<"ai" | "manual">("ai");
  const [manualEulogy, setManualEulogy] = useState("");

  const categories = {
    TECH_GADGETS: "Tech & Gadgets",
    KITCHEN_FOOD: "Kitchen & Food",
    CLOTHING_LAUNDRY: "Clothing & Laundry", 
    TOYS_GAMES: "Toys & Games",
    CAR_TOOLS: "Car & Tools",
    PETS_CHEWABLES: "Pet Chewables",
    OUTDOORS_ACCIDENTS: "Outdoor Accidents",
    MISC: "Miscellaneous",
  };

  const emotions = {
    heartfelt: { label: "💙 Heartfelt", description: "Warm and sincere with gentle emotion" },
    humorous: { label: "😄 Humorous", description: "Light-hearted and amusing while respectful" },
    nostalgic: { label: "🌅 Nostalgic", description: "Wistful and reminiscent of fond memories" },
    grateful: { label: "🙏 Grateful", description: "Thankful and celebrating its contributions" },
    dramatic: { label: "🎭 Dramatic", description: "Theatrical and grand, like a legendary hero" },
    poetic: { label: "🌸 Poetic", description: "Lyrical and beautiful with flowing language" },
    philosophical: { label: "🤔 Philosophical", description: "Thoughtful and exploring deeper meanings" },
    quirky: { label: "🎪 Quirky", description: "Playful and charmingly eccentric" },
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const generateEulogy = async () => {
    if (!formData.title.trim()) {
      setError("Please enter a title for your item");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const payload = {
        title: formData.title.trim(),
        category: formData.category,
        ...(formData.backstory.trim() ? { backstory: formData.backstory.trim() } : {}),
        ...(formData.years.trim() ? { years: formData.years.trim() } : {}),
        emotion: selectedEmotion,
      };

      const response = await fetch("/api/eulogies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({} as any));
        if (errorData?.code === "BAD_REQUEST" && Array.isArray(errorData.issues) && errorData.issues.length) {
          const first = errorData.issues[0];
          const path = Array.isArray(first.path) ? first.path.join(".") : "input";
          throw new Error(`${path}: ${first.message}`);
        }
        if (response.status === 503 && errorData?.message) {
          throw new Error(errorData.message);
        }
        if (errorData?.code === "RATE_LIMIT") {
          throw new Error(`Rate limit hit. Try again in ${errorData.retryAfterSeconds ?? 30}s`);
        }
        throw new Error(errorData?.message || "Failed to generate eulogy");
      }

      const data = await response.json();
      setEulogy(data.text);
      if (data?.eulogyId) {
        setEulogyId(data.eulogyId);
      } else {
        console.error("/api/eulogies missing eulogyId", data);
        setError("Eulogy generated but draft reference was missing. Please try again.");
        return;
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  async function selectMedia(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setError("");
    const preview = URL.createObjectURL(file);
    setMedia({ file, preview, uploadedUrl: null });

    try {
      console.log("🚀 Starting upload process...", { 
        fileName: file.name, 
        fileType: file.type, 
        fileSize: file.size 
      });
      
      const createRes = await fetch("/api/uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type, contentLength: file.size }),
      });
      
      console.log("📋 Token request response:", { status: createRes.status, statusText: createRes.statusText });
      
      const token = await createRes.json().catch(() => ({} as any));
      console.log("🎫 Upload token:", { provider: token?.provider, hasClientToken: !!token?.clientToken });
      
      if (!createRes.ok) {
        const msg = token?.message || "Could not prepare upload";
        const hint = file.type ? ` (type: ${file.type}, size: ${file.size}B)` : "";
        console.error("❌ Token request failed:", token);
        throw new Error(`${msg}${hint}`);
      }
      if (token.provider === "blob") {
        console.log("🔄 Uploading to Vercel Blob...", { 
          fileName: file.name, 
          fileSize: file.size, 
          fileType: file.type,
          pathname: token.pathname,
          clientToken: token.clientToken?.substring(0, 20) + '...'
        });
        
        const uploadUrl = `https://blob.vercel-storage.com/${token.pathname}`;
        const putRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token.clientToken}`,
            "x-content-type": file.type,
          },
          body: file,
        });
        
        console.log("📡 Blob upload response:", { status: putRes.status, statusText: putRes.statusText });
        
        const putData = (await putRes.json().catch(() => null)) as { url?: string; pathname?: string; error?: any };
        console.log("📦 Blob upload data:", putData);
        
        if (!putRes.ok || !putData?.url) {
          const errorMsg = putData?.error || putData || "Unknown upload error";
          console.error("❌ Blob upload failed:", errorMsg);
          throw new Error(`Upload failed: ${JSON.stringify(errorMsg)}`);
        }
        setMedia((prev) => ({ ...prev, uploadedUrl: putData.url ?? null }));
      } else if (token.provider === "s3") {
        const putRes = await fetch(token.url, {
          method: token.method,
          headers: {
            ...(token.headers || {}),
          },
          body: file,
        });
        if (!putRes.ok) {
          throw new Error("Upload failed");
        }
        setMedia((prev) => ({ ...prev, uploadedUrl: token.objectUrl ?? null }));
      } else if (token.provider === "local") {
        const putRes = await fetch(token.url, {
          method: token.method,
          headers: {
            ...(token.headers || {}),
          },
          body: file,
        });
        if (!putRes.ok) {
          const errorText = await putRes.text().catch(() => "Upload failed");
          throw new Error(`Upload failed: ${errorText}`);
        }
  const out = (await putRes.json().catch(() => ({}))) as { url?: string };
  setMedia((prev) => ({ ...prev, uploadedUrl: out.url ?? token.objectUrl ?? null }));
      } else {
        throw new Error("Unknown upload provider");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setMedia({ file: null, preview: null, uploadedUrl: null });
    }
  }

  const createGrave = async () => {
    const finalEulogy = eulogyMode === "ai" ? eulogy : manualEulogy.trim();
    
    if (!finalEulogy) {
      setError(eulogyMode === "ai" ? "Please generate an AI eulogy first" : "Please write your eulogy first");
      return;
    }

    if (eulogyMode === "ai" && !eulogyId) {
      setError("Please generate a eulogy first");
      return;
    }

    if (!formData.agreeToGuidelines) {
      setError("Please agree to the community guidelines");
      return;
    }

    try {
      const requestBody = {
        title: formData.title.trim(),
        category: formData.category,
        ...(formData.backstory.trim() ? { backstory: formData.backstory.trim() } : {}),
        ...(formData.years.trim() ? { years: formData.years.trim() } : {}),
        ...(media.uploadedUrl ? { photoUrl: media.uploadedUrl } : {}),
        agreeToGuidelines: formData.agreeToGuidelines,
        eulogyText: finalEulogy,
        ...(eulogyMode === "ai" && eulogyId ? { eulogyId } : {}),
      };

      const response = await fetch("/api/graves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({} as any));
        if (errorData?.code === "BAD_REQUEST" && Array.isArray(errorData.issues) && errorData.issues.length) {
          const first = errorData.issues[0];
          const path = Array.isArray(first.path) ? first.path.join(".") : "input";
          throw new Error(`${path}: ${first.message}`);
        }
        if (errorData?.code === "FORBIDDEN" && errorData?.reason === "EULOGY_DRAFT_NOT_FOUND_OR_EXPIRED") {
          throw new Error("Your eulogy draft expired. Please generate a new eulogy and try again.");
        }
        if (errorData?.code === "RATE_LIMIT") {
          throw new Error(`Rate limit hit. Try again in ${errorData.retryAfterSeconds ?? 60}s`);
        }
        throw new Error(errorData?.message || "Failed to create grave");
      }

      const data = await response.json();
      // Redirect to the grave page
      window.location.href = `/grave/${data.slug}`;
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  return (
    <ProtectedRoute fallbackMessage="Please sign in to create memorials for your departed items.">
      <div className="space-y-12">
        <PageHero
          eyebrow="Memorial Service"
          title="Lay Your Fallen Item to Rest"
          description="Share the story of something that served you well, then let our AI eulogist craft a fitting farewell."
        />

      <div className="mx-auto max-w-2xl">
        <div className="space-y-8">
          {/* Basic Information */}
          <section className="space-y-6">
            <SectionHeader
              title="Tell us about the departed"
              description="The more details you provide, the better the eulogy will be."
            />
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
                  What was it? *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="My trusty iPhone 12, Grandma's mixing bowl, etc."
                  maxLength={80}
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(10,14,25,0.8)] px-4 py-3 text-white placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-white mb-2">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(10,14,25,0.8)] px-4 py-3 text-white focus:border-[var(--accent)] focus:outline-none"
                >
                  {Object.entries(categories).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="years" className="block text-sm font-medium text-white mb-2">
                  How long did it serve? (optional)
                </label>
                <input
                  type="text"
                  id="years"
                  name="years"
                  value={formData.years}
                  onChange={handleInputChange}
                  placeholder="3 years, 2019-2024, Since college, etc."
                  maxLength={32}
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(10,14,25,0.8)] px-4 py-3 text-white placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="backstory" className="block text-sm font-medium text-white mb-2">
                  Its story (optional)
                </label>
                <textarea
                  id="backstory"
                  name="backstory"
                  value={formData.backstory}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="How you got it, memorable moments, what made it special..."
                  maxLength={140}
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(10,14,25,0.8)] px-4 py-3 text-white placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none resize-y break-words"
                  style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                />
                <div className="mt-1 text-xs text-[var(--muted)]">{formData.backstory.length}/140</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Photo or video (optional)</label>
                <input
                  type="file"
                  accept="image/*,video/mp4,video/webm,video/quicktime"
                  onChange={selectMedia}
                  className="block w-full text-sm text-[var(--muted)] file:mr-4 file:rounded-md file:border file:border-[rgba(255,255,255,0.1)] file:bg-[rgba(10,14,25,0.8)] file:px-3 file:py-2 file:text-white hover:file:border-[var(--accent)]"
                />
                {media.preview && (
                  <div className="mt-3 rounded-lg border border-[rgba(255,255,255,0.1)] p-2">
                    {media.file?.type.startsWith("image/") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={media.preview} alt="preview" className="max-h-64 w-full object-contain" />
                    ) : (
                      <video src={media.preview} controls className="max-h-64 w-full" />
                    )}
                    <p className="mt-2 text-xs text-[var(--muted)]">
                      {media.uploadedUrl ? "Uploaded" : "Uploading..."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Eulogy Section */}
          <section className="space-y-6">
            <SectionHeader
              title="Create the Eulogy"
              description="Choose how you'd like to honor your departed item."
            />

            {/* Eulogy Mode Toggle */}
            <div className="flex justify-center">
              <div className="inline-flex gap-2 rounded-lg border border-[var(--border)] p-1 bg-[rgba(255,255,255,0.04)]">
                <button
                  onClick={() => setEulogyMode("ai")}
                  className={`rounded-md px-4 py-2 text-sm transition-colors ${
                    eulogyMode === "ai" 
                      ? "bg-[var(--accent)] text-black font-medium" 
                      : "text-[var(--muted)] hover:text-white"
                  }`}
                >
                  ✨ AI Generated
                </button>
                <button
                  onClick={() => setEulogyMode("manual")}
                  className={`rounded-md px-4 py-2 text-sm transition-colors ${
                    eulogyMode === "manual" 
                      ? "bg-[var(--accent)] text-black font-medium" 
                      : "text-[var(--muted)] hover:text-white"
                  }`}
                >
                  ✍️ Write My Own
                </button>
              </div>
            </div>

            {eulogyMode === "ai" ? (
              <>
                {/* Emotion Selection */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">
                      Choose the tone for your eulogy
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(emotions).map(([key, emotion]) => (
                        <div
                          key={key}
                          onClick={() => setSelectedEmotion(key)}
                          className={`cursor-pointer rounded-lg border p-4 transition-all hover:border-[var(--accent)] ${
                            selectedEmotion === key
                              ? "border-[var(--accent)] bg-[var(--accent)]/10"
                              : "border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="emotion"
                              value={key}
                              checked={selectedEmotion === key}
                              onChange={() => setSelectedEmotion(key)}
                              className="sr-only"
                            />
                            <div className={`flex-1 ${selectedEmotion === key ? "text-white" : "text-[var(--muted)]"}`}>
                              <div className="font-medium text-sm">{emotion.label}</div>
                              <div className="text-xs mt-1 opacity-80">{emotion.description}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button
                    onClick={generateEulogy}
                    disabled={isGenerating || !formData.title.trim()}
                    className="px-8"
                  >
                    {isGenerating ? "Crafting Eulogy..." : "Generate AI Eulogy"}
                  </Button>
                </div>

                {eulogy && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">Your AI Eulogy:</h3>
                      <button
                        onClick={generateEulogy}
                        disabled={isGenerating}
                        className="text-sm text-[var(--accent)] hover:underline"
                      >
                        🔄 Regenerate ({emotions[selectedEmotion as keyof typeof emotions]?.label || selectedEmotion})
                      </button>
                    </div>
                    <div className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] p-6">
                      <p 
                        className="text-[var(--foreground)] leading-relaxed whitespace-pre-line break-words"
                        style={{ 
                          wordWrap: 'break-word', 
                          overflowWrap: 'break-word',
                          wordBreak: 'break-word' 
                        }}
                      >
                        {eulogy}
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="manualEulogy" className="block text-sm font-medium text-white mb-3">
                    Write your own eulogy
                  </label>
                  <p className="text-sm text-[var(--muted)] mb-4">
                    Share your personal memories, feelings, or a heartfelt farewell to your departed item.
                  </p>
                  <textarea
                    id="manualEulogy"
                    value={manualEulogy}
                    onChange={(e) => setManualEulogy(e.target.value)}
                    rows={8}
                    placeholder="Today we say goodbye to my beloved [item name]. For [time period], it was more than just an object—it was a faithful companion that..."
                    maxLength={1000}
                    className="w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(10,14,25,0.8)] px-4 py-3 text-white placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none resize-y"
                    style={{ 
                      wordWrap: 'break-word', 
                      overflowWrap: 'break-word', 
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}
                  />
                  <div className="mt-2 flex justify-between items-center">
                    <div className="text-xs text-[var(--muted)]">{manualEulogy.length}/1000 characters</div>
                    <div className="text-xs text-[var(--muted)]">
                      💡 Tip: Share what made it special to you
                    </div>
                  </div>
                </div>

                {manualEulogy.trim() && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Preview:</h3>
                    <div className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] p-6">
                      <p 
                        className="text-[var(--foreground)] leading-relaxed whitespace-pre-line break-words"
                        style={{ 
                          wordWrap: 'break-word', 
                          overflowWrap: 'break-word',
                          wordBreak: 'break-word' 
                        }}
                      >
                        {manualEulogy}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400 text-sm">
                {error}
              </div>
            )}
          </section>

          {/* Final Steps */}
          {((eulogyMode === "ai" && eulogy) || (eulogyMode === "manual" && manualEulogy.trim())) && (
            <section className="space-y-6">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agreeToGuidelines"
                  name="agreeToGuidelines"
                  checked={formData.agreeToGuidelines}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 rounded border-[rgba(255,255,255,0.3)] bg-transparent text-[var(--accent)] focus:ring-[var(--accent)]"
                />
                <label htmlFor="agreeToGuidelines" className="text-sm text-[var(--muted)]">
                  I agree to the{" "}
                  <a href="/guidelines" className="text-[var(--accent)] hover:underline">
                    community guidelines
                  </a>
                  {" "}and understand that this memorial will be public.
                </label>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={createGrave}
                  disabled={!formData.agreeToGuidelines || (eulogyMode === "ai" && !eulogyId) || (eulogyMode === "manual" && !manualEulogy.trim())}
                  className="px-8"
                >
                  Create Memorial
                </Button>
              </div>
              {eulogyMode === "ai" && !eulogyId && (
                <p className="text-center text-xs text-[var(--muted)]">Generating draft reference… please click Generate Eulogy again if this persists.</p>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}