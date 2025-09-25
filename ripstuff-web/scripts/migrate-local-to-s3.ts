/*
  Scaffold: Copy local media from public/uploads to S3 and optionally update DB photoUrl.
  Usage (later):
    pnpm tsx scripts/migrate-local-to-s3.ts --bucket your-bucket --region us-east-1 [--update-db]
*/

import fs from "node:fs";
import path from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";

const args = new Map<string, string | boolean>();
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith("--")) {
    const [k, v] = a.slice(2).split("=");
    args.set(k, v ?? true);
  }
}

async function main() {
  const bucket = (args.get("bucket") as string) || process.env.AWS_S3_BUCKET;
  const region = (args.get("region") as string) || process.env.AWS_REGION;
  if (!bucket || !region) {
    console.error("Missing --bucket or --region (or envs)");
    process.exit(1);
  }

  const s3 = new S3Client({ region });
  const root = path.join(process.cwd(), "public", "uploads");
  const prisma = args.get("update-db") ? new PrismaClient() : undefined;

  async function walk(dir: string) {
    const items = await fs.promises.readdir(dir, { withFileTypes: true });
    for (const it of items) {
      const full = path.join(dir, it.name);
      if (it.isDirectory()) {
        await walk(full);
      } else {
        const rel = path.relative(path.join(process.cwd(), "public"), full).replace(/\\/g, "/");
        const key = rel.replace(/^uploads\//, ""); // keep same key layout
        const body = await fs.promises.readFile(full);
        const contentType = guessContentType(full);
        await s3.send(
          new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType })
        );
        if (prisma && rel.startsWith("uploads/graves/")) {
          const objectUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
          await prisma.grave.updateMany({ where: { photoUrl: `/${rel}` }, data: { photoUrl: objectUrl } });
        }
        console.log("Uploaded:", key);
      }
    }
  }

  await walk(root).catch((e) => {
    console.error(e);
    process.exit(1);
  });
  if (prisma) await prisma.$disconnect();
}

function guessContentType(p: string) {
  const ext = path.extname(p).toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".avif":
      return "image/avif";
    case ".mp4":
      return "video/mp4";
    case ".webm":
      return "video/webm";
    case ".mov":
      return "video/quicktime";
    default:
      return "application/octet-stream";
  }
}

main();
