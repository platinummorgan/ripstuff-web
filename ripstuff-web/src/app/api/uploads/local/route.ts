import fs from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";

import { json } from "@/lib/http";
import sharp from "sharp";

export const runtime = "nodejs";

export async function PUT(req: NextRequest) {
  try {
    if (process.env.NODE_ENV === "production") {
      return json({ code: "FORBIDDEN", message: "Local upload disabled in production" }, 403);
    }
    const key = new URL(req.url).searchParams.get("key");
    if (!key || key.includes("..")) {
      return json({ code: "BAD_REQUEST", message: "Invalid key" }, 400);
    }

    const data = Buffer.from(await req.arrayBuffer());
    const publicDir = path.join(process.cwd(), "public", "uploads");
    const dest = path.join(publicDir, key);
    const ext = path.extname(dest).toLowerCase();

    await fs.promises.mkdir(path.dirname(dest), { recursive: true });
    if ([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"].includes(ext)) {
      // Image pipeline: resize to max 1600px, convert to webp for size, quality ~80
      const outPath = dest.replace(/\.(jpg|jpeg|png|gif|avif)$/i, ".webp");
      const processed = await sharp(data).rotate().resize({ width: 1600, height: 1600, fit: "inside" }).webp({ quality: 80 }).toBuffer();
      await fs.promises.writeFile(outPath, processed);
  const relative = outPath.split(path.join(process.cwd(), "public"))[1].replace(/\\/g, "/");
  const relUrl = relative.startsWith("/") ? relative : `/${relative}`;
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? req.nextUrl.origin).replace(/\/$/, "");
  const absUrl = `${base}${relUrl}`;
  return json({ ok: true, url: absUrl }, 201);
    }

    if ([".mp4", ".webm", ".mov", ".qt"].includes(ext)) {
      try {
        const [{ default: ffmpeg }, { default: ffmpegInstaller }] = await Promise.all([
          import("fluent-ffmpeg" as any),
          import("@ffmpeg-installer/ffmpeg" as any),
        ]);
        ffmpeg.setFfmpegPath(ffmpegInstaller.path);

        const outPath = dest.replace(/\.(webm|mov|qt)$/i, ".mp4");
        await new Promise<void>((resolve, reject) => {
          const input = path.join(publicDir, `tmp-${Date.now()}${ext}`);
          fs.promises
            .writeFile(input, data)
            .then(() => {
              ffmpeg(input)
                .outputOptions([
                  "-vf scale='min(1280,iw)':-2",
                  "-c:v libx264",
                  "-preset veryfast",
                  "-b:v 2500k",
                  "-maxrate 2500k",
                  "-bufsize 5000k",
                  "-movflags +faststart",
                  "-c:a aac",
                  "-b:a 128k",
                ])
                .on("end", async () => {
                  await fs.promises.rm(input).catch(() => {});
                  resolve();
                })
                .on("error", async (_err: unknown) => {
                  await fs.promises.rm(input).catch(() => {});
                  reject(_err);
                })
                .save(outPath);
            })
            .catch(reject);
        });
  const relative = outPath.split(path.join(process.cwd(), "public"))[1].replace(/\\/g, "/");
  const relUrl = relative.startsWith("/") ? relative : `/${relative}`;
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? req.nextUrl.origin).replace(/\/$/, "");
  const absUrl = `${base}${relUrl}`;
  return json({ ok: true, url: absUrl }, 201);
      } catch {
        // If ffmpeg is unavailable, fall back to storing original
      }
    }

    // Fallback: write as-is
    await fs.promises.writeFile(dest, data);
    {
  const relative = dest.split(path.join(process.cwd(), "public"))[1].replace(/\\/g, "/");
  const relUrl = relative.startsWith("/") ? relative : `/${relative}`;
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? req.nextUrl.origin).replace(/\/$/, "");
  const absUrl = `${base}${relUrl}`;
  return json({ ok: true, url: absUrl }, 201);
    }
  } catch (err) {
    console.error("/api/uploads/local error", err);
    return json({ 
      code: "INTERNAL_ERROR", 
      message: "File processing failed. Please check file format and size (max 50MB)." 
    }, 500);
  }
}
