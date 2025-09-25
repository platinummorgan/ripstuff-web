## RIPStuff Web

Next.js 14 App Router app with Prisma + Postgres and local/AI features to create and view memorials (“graves”).

### Dev Quickstart

1) Install deps (root):
```pwsh
pnpm install
pnpm approve-builds
pnpm config set allowed-build-scripts "@prisma/client @prisma/engines prisma @tailwindcss/oxide sharp unrs-resolver"
```

2) Env (ripstuff-web/.env.local):
```ini
DATABASE_URL=postgresql://...
UPLOAD_PROVIDER=local
OPENAI_BASE_URL=http://localhost:11434/v1
OPENAI_API_KEY=ollama
EULOGY_MODEL=qwen2.5:7b-instruct
NEXT_PUBLIC_SHOW_PENDING_IN_FEED=1
NEXT_PUBLIC_AUTO_APPROVE_IN_DEV=1
```

3) Start services:
```pwsh
pnpm --filter ripstuff-web dev
```
Optional (AI locally):
```pwsh
ollama serve
ollama pull qwen2.5:7b-instruct
```

Open http://localhost:3000 and use /bury to create a memorial.

### Database

Apply migrations and open Studio:
```pwsh
pnpm --filter ripstuff-web prisma:migrate
pnpm --filter ripstuff-web prisma:studio
```

### Uploads

- Local dev: saves under `public/uploads/graves/...`, auto-resizes images and downscales videos (best effort).
- Switch to S3 later by setting `UPLOAD_PROVIDER=s3` and AWS envs.
- Cleanup local media:
```pwsh
pnpm --filter ripstuff-web clean:uploads
```

### Commands

See the root `commands.txt` for a concise command reference.
# Updated 09/25/2025 15:10:38
