# RIPStuff API Contracts (MVP)

All endpoints live under `/api` via Next.js App Router handlers. Requests and responses use JSON unless otherwise noted. Validation performed with Zod; snippets below show shared schema modules (e.g. in `src/lib/validation`). Device-level throttling relies on a hashed fingerprint (`x-rip-device`) header populated client-side; server will fallback to IP address when missing.

## Public Creation Flow

### POST `/api/eulogies`
Generates or regenerates an eulogy draft via OpenAI.

- **Headers**: `x-rip-device` (optional), `Content-Type: application/json`
- **Body** (`EulogyGenerateInput`):
  ```ts
  const graveCoreFields = z.object({
    title: z.string().min(3).max(80),
    years: z.string().trim().max(32).optional(),
    backstory: z.string().trim().max(140).optional(),
    category: z.nativeEnum(GraveCategory),
  });

  export const eulogyGenerateInput = graveCoreFields.extend({
    regenerateFromId: z.string().uuid().optional(),
  });
  ```
- **Success (`200`)** (`EulogyGenerateResponse`):
  ```ts
  export const eulogyGenerateResponse = z.object({
    eulogyId: z.string().uuid(),
    text: z.string().min(80).max(200),
    tokensUsed: z.number().int().positive(),
  });
  ```
- **Errors**: `400` validation; `429` throttle (max 2 generations/min/device); `503` AI outage.

### POST `/api/graves`
Creates or publishes a grave entry once the user approves the eulogy.

- **Headers**: `x-rip-device`, `Content-Type: application/json`
- **Body** (`CreateGraveInput`):
  ```ts
  export const createGraveInput = graveCoreFields.extend({
    eulogyId: z.string().uuid(),
    eulogyText: z.string().min(80).max(280),
    photoUrl: z.string().url().optional(),
    datesText: z.string().trim().max(64).optional(),
    agreeToGuidelines: z.literal(true),
  });
  ```
- **Success (`201`)** (`CreateGraveResponse`):
  ```ts
  export const createGraveResponse = z.object({
    id: z.string().uuid(),
    slug: z.string(),
    status: z.enum(["PENDING", "APPROVED"]),
    shareUrl: z.string().url(),
  });
  ```
- **Errors**: `400` invalid fields or missing guideline acknowledgement; `403` banned device hash; `413` photo >3MB (pre-upload check); `429` rate limit (3 graves/day/device).

### POST `/api/uploads`
Returns signed URL for photo upload to R2 (optional step).

- **Body** (`CreateUploadUrlInput`):
  ```ts
  export const createUploadUrlInput = z.object({
    contentType: z.string().regex(/^image\//),
    contentLength: z.number().max(3 * 1024 * 1024),
  });
  ```
- **Response**: `{ uploadUrl: string; assetUrl: string; expiresAt: string }`

## Public Consumption

### GET `/api/feed`
Fetches featured and newest graves for the home/feed.

- **Query**: `cursor` (optional ISO datetime), `featured=true` optional toggle.
- **Response (`FeedResponse`)**:
  ```ts
  export const feedItem = z.object({
    id: z.string().uuid(),
    slug: z.string(),
    title: z.string(),
    category: z.nativeEnum(GraveCategory),
    eulogyPreview: z.string().max(160),
    photoUrl: z.string().url().nullable(),
    reactions: z.object({ heart: z.number(), candle: z.number(), rose: z.number(), lol: z.number() }),
    createdAt: z.string().datetime(),
    featured: z.boolean(),
  });
  export const feedResponse = z.object({
    items: z.array(feedItem),
    nextCursor: z.string().datetime().nullable(),
  });
  ```

### GET `/api/graves/[slug]`
Returns full grave detail for public page.

- **Response (`GraveDetailResponse`)** extends `feedItem` with `eulogyText`, `datesText`, `sympathies`, and `status`.

### POST `/api/graves/[id]/reactions`
Adds/toggles a reaction from the device.

- **Body** (`ReactionInput`):
  ```ts
  export const reactionInput = z.object({
    type: z.nativeEnum(ReactionType),
    action: z.enum(["ADD", "REMOVE"]).default("ADD"),
  });
  ```
- **Response**: Updated aggregate counts.
- **Rate limit**: 10 reactions/min/device; dedupe via unique constraint on `(graveId, deviceHash, type)`.

### POST `/api/graves/[id]/sympathies`
Submits a comment (sympathy).

- **Body** (`SympathyInput`):
  ```ts
  export const sympathyInput = z.object({
    body: z.string().trim().min(1).max(140),
    captchaToken: z.string().optional(),
  });
  ```
- **Response**: `{ id, body, createdAt }`.
- **Rate limit**: 1/min/device; profanity filter prior to insert.

### POST `/api/graves/[id]/report`
Flags a grave for moderation.

- **Body** (`ReportInput`): `reason` optional 280 char.
- **Response**: `{ acknowledged: boolean }`; auto hides after N reports (config env).

## Share Card + Metadata

### POST `/api/graves/[id]/share-card`
Generates 1080×1920 share image (server-side Satori).

- **Body**: optional `refresh=true` to bypass cache.
- **Response**: `{ imageUrl: string }` or streams PNG.
- **Rate limit**: 5/min/device to avoid abuse.

### GET `/api/og/[slug]`
Edge function returning OG image markup; uses cached share-card asset.

## Moderation Console (Protected)
All moderation endpoints require clerk/auth0 session with role `moderator`. Responses include audit trail entries.

### GET `/api/moderation/graves`
Query params: `status`, `reported=true`, `cursor`.
- Response: paginated list of pending/flagged graves with summarized report counts.

### POST `/api/moderation/graves/[id]/action`
Performs approve/hide/feature actions.
- **Body** (`ModerationActionInput`):
  ```ts
  export const moderationActionInput = z.object({
    action: z.nativeEnum(ModerationActionType),
    reason: z.string().trim().max(280).optional(),
  });
  ```
- **Response**: `{ status, featured, updatedAt }`.

### POST `/api/moderation/graves/[id]/notes`
Optional lightweight note log for moderators (`body` max 280).

## Shared Validation Modules
Place shared Zod schemas in `src/lib/validation/grave.ts` etc. Suggested exports:

- `graveCoreFields`
- `eulogyGenerateInput`
- `createGraveInput`
- `feedQuerySchema`
- `reactionInput`
- `sympathyInput`
- `reportInput`
- `moderationActionInput`
- `moderationListQuery`

Each handler imports the relevant schema for both runtime validation and inferred TypeScript types via `z.infer`.

## Rate Limiting & Error Contract
- Use Upstash Redis with namespaces per scope (`grave:create`, `eulogy:generate`, `sympathy:post`, etc.). Each limit returns `429` with payload `{ code: "RATE_LIMIT", retryAfterSeconds: number }`.
- Validation errors respond `400` with `{ code: "BAD_REQUEST", issues: ZodIssue[] }`.
- Forbidden/banned devices return `403` `{ code: "FORBIDDEN", reason: "BANNED_DEVICE" }`.
- Unexpected failures return `500` `{ code: "INTERNAL_ERROR" }` and log to Sentry.

## Upload & Asset Handling
- `/api/uploads` issues short-lived signed PUT to R2; client uploads directly, then uses returned `assetUrl` in `createGraveInput.photoUrl`.
- Share cards cached in R2/Cloudflare with key `share-card:{graveId}:{hash}`; regenerate endpoint invalidates cache via metadata update.

## Authentication & Headers
- Public endpoints require no auth but expect `x-rip-device`. Server creates hashed fallback from IP + UA and sets `Set-Cookie: rip_device=hash; Max-Age=90d` on first request.
- Moderation endpoints require middleware verifying session token and role claim; respond `401` when missing, `403` for wrong role.

## TODO
- Define captcha provider integration hook for sympathies (Cloudflare Turnstile recommended).
- Decide on optional email digest subscription endpoint post-MVP.
