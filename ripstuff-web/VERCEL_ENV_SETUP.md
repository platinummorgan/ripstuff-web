# Vercel Environment Variables Setup

This guide shows how to configure the environment variables in Vercel for ripstuff.net

## 🚀 Required Environment Variables for Production

### Core Application
```
NEXT_PUBLIC_SITE_URL=https://ripstuff.net
DATABASE_URL=<your-production-postgresql-url>
UPSTASH_REDIS_REST_URL=<your-upstash-redis-url>
UPSTASH_REDIS_REST_TOKEN=<your-upstash-redis-token>
```

### File Uploads (Choose ONE option)

#### Option 1: Vercel Blob (Recommended for Vercel)
```
UPLOAD_PROVIDER=blob
BLOB_READ_WRITE_TOKEN=<your-vercel-blob-token>
```

#### Option 2: AWS S3 (Alternative)
```
UPLOAD_PROVIDER=s3
AWS_S3_BUCKET=<your-s3-bucket-name>
AWS_REGION=<your-aws-region>
AWS_ACCESS_KEY_ID=<your-aws-access-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-key>
```

### AI Eulogy Service

#### Option 1: Use OpenAI (if you have quota/credits)
```
OPENAI_API_KEY=<your-openai-api-key>
EULOGY_MODEL=gpt-4o-mini
EULOGY_MAX_TOKENS=320
EULOGY_FAKE=0
```

#### Option 2: Use Fake Eulogies (bypass OpenAI quota issues)
```
EULOGY_FAKE=1
```

### Rate Limiting & Moderation
```
EULOGY_RATE_LIMIT=2
EULOGY_RATE_WINDOW=60
EULOGY_DRAFT_TTL=900
GRAVE_CREATE_LIMIT=3
GRAVE_CREATE_WINDOW=86400
REACTION_LIMIT=10
REACTION_WINDOW=60
SYMPATHY_LIMIT=1
SYMPATHY_WINDOW=60
REPORT_LIMIT=3
REPORT_WINDOW=86400
REPORT_AUTO_HIDE_THRESHOLD=5
BANNED_TERMS=<comma-separated-list-of-banned-terms>
```

## 📝 How to Set Environment Variables in Vercel

1. Go to https://vercel.com/dashboard
2. Select your `ripstuff-web` project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - **Key**: Variable name (e.g., `UPLOAD_PROVIDER`)
   - **Value**: Variable value (e.g., `blob`)
   - **Environment**: Select `Production` (and `Preview` if needed)

## 🔧 Quick Fix for Current Issues

For the immediate upload and AI issues on ripstuff.net, set these:

```
UPLOAD_PROVIDER=blob
BLOB_READ_WRITE_TOKEN=<get-this-from-vercel-blob-dashboard>
EULOGY_FAKE=1
NEXT_PUBLIC_SITE_URL=https://ripstuff.net
```

## 🎯 Getting a Vercel Blob Token

1. Go to https://vercel.com/dashboard
2. Navigate to **Storage** → **Blob**
3. Create a new Blob store (if you don't have one)
4. Copy the `BLOB_READ_WRITE_TOKEN` from the connection details

## ⚡ After Adding Variables

After adding/changing environment variables in Vercel:
1. Go to **Deployments**
2. Click **Redeploy** on the latest deployment
3. Or push a new commit to trigger a fresh deployment

The new environment variables will be available in the next deployment.