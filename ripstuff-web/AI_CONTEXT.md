# AI Assistant Context

## 🚀 Deployment & Infrastructure
- **Platform:** Vercel (production at ripstuff.net)
- **Framework:** Next.js 14 App Router
- **Database:** PostgreSQL with Prisma ORM
- **Storage:** Vercel Blob for file uploads
- **Styling:** Tailwind CSS v4

## 🔧 Architecture Preferences
- **Rendering:** Prefer Server Components over Client Components
- **Data Fetching:** Direct database queries in server components (NOT API routes for simple data)
- **Optimization:** Built for Vercel Edge Runtime and ISR

## 🗂️ Key Project Structure
```
src/
├── app/                    # Next.js 14 App Router pages
├── components/             # React components
├── lib/                    # Utilities (prisma, uploads, etc.)
├── actions/               # Server actions
└── types/                 # TypeScript definitions

prisma/
├── schema.prisma          # Database schema
└── migrations/            # Database migrations
```

## 🔑 Important Notes
- Uses Prisma field names: `title` (not name), `heartCount`/`candleCount`/etc. (not reactions)
- Has moderation system with user.isModerator flags
- Real-time analytics from database (not mock data)
- Upload system uses Vercel Blob in production
- All pages should be server-side rendered when possible

## 🚨 Common Issues to Avoid
- Don't use client components for data fetching unless interactive features needed
- Don't create API routes for simple database reads (use server components)
- Always use correct Prisma field names from schema
- Remember this is deployed on Vercel, optimize accordingly

## 🔐 OAuth & Authentication System
- **Google OAuth:** Fully functional with email and profile permissions
- **Facebook OAuth:** Implemented with App ID 976054108040004 (Live mode)
  - Uses public_profile permission only (no email due to business verification requirements)
  - App configured as "Other" type to avoid business verification
- **Account Linking:** Complete system to link multiple OAuth providers to single user account

### OAuth Database Schema
```prisma
model OAuthAccount {
  id         String @id @default(cuid())
  provider   String // "google" or "facebook"
  providerId String // OAuth provider's user ID
  userId     String
  user       User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerId])
}
```

### Key OAuth Files & Endpoints
- `/api/auth/facebook-config/route.ts` - Provides Facebook App ID to client securely
- `/api/auth/callback/google/route.ts` - Google OAuth callback with linking support
- `/api/auth/callback/facebook/route.ts` - Facebook OAuth callback with linking support
- `/api/auth/link-account/route.ts` - Account linking API endpoint
- `/app/profile/page.tsx` - Profile page with AccountLinkingSection component

### OAuth Implementation Notes
- Uses `state` parameter for linking detection (state='linking' or linking='true')
- Moderator privileges maintained across linked accounts
- Error handling improved to show actual JSON errors instead of "[object Object]"
- Facebook redirect URIs must match exactly in Facebook Developer Console
- Environment variables: NEXT_PUBLIC_FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

### Account Linking Flow
1. User signs in with primary account (e.g., Google)
2. Goes to profile page and clicks "Link Facebook Account"
3. Redirected to OAuth provider with state parameter
4. Callback detects linking flow and creates OAuthAccount record
5. User maintains all privileges from primary account

### Recent Debugging & Fixes
- Fixed "[object Object]" error by properly stringifying JSON responses in OAuth callbacks
- Improved redirect URL handling for linking vs. regular sign-in flows
- Added proper error handling to show specific OAuth API error details
- Updated client-side OAuth initialization to fetch App ID from API endpoint

## 🎯 Death Certificate System - FULLY IMPLEMENTED ✅
**Status:** Complete foundation deployed to production
- **Database Schema:** Extended with roastCount, eulogyCount fields and RoastEulogyReaction table
- **API Endpoint:** `/api/graves/[slug]/roast-eulogy` for dual-mode voting (roast vs eulogy) 
- **Component:** `DeathCertificate.tsx` with html2canvas export, controversy scoring, QR codes
- **Dependencies:** html2canvas ^1.4.1, qrcode ^1.5.4 successfully deployed
- **Integration:** Death Certificate appears on all grave pages with download functionality
- **Migration:** Applied to production database successfully

### Death Certificate Features ✅
- Controversy calculation algorithm with "snark meter"
- Official certificate styling with memorial QR codes  
- PNG export functionality via html2canvas
- Roast vs Eulogy percentage display with visual indicators
- Integrated on `/grave/[slug]` pages between Eulogy and Sympathies sections
- Real-time data from roastCount/eulogyCount fields

### Database Schema (Roast/Eulogy System)
```prisma
model Grave {
  // ... existing fields ...
  roast_count            Int                      @default(0)
  eulogy_count           Int                      @default(0)
  roast_eulogy_reactions RoastEulogyReaction[]
}

model RoastEulogyReaction {
  id          String          @id @db.Uuid
  grave_id    String          @db.Uuid
  device_hash String          @db.VarChar(128)
  type        RoastEulogyType // ROAST or EULOGY
  created_at  DateTime        @default(now())
  grave       Grave           @relation(fields: [grave_id], references: [id], onDelete: Cascade)
}

enum RoastEulogyType {
  ROAST
  EULOGY
}
```

## ✅ DATABASE RECOVERY SUCCESS STORY
**Date:** September 26, 2025 - **CRISIS RESOLVED SUCCESSFULLY** ✅

### What Happened (Learning Experience)
- **Data Loss Event:** `prisma migrate reset --force` was accidentally run on PRODUCTION database
- **Impact:** Temporarily lost all user data including real users (Iain Culverhouse, Michael) and their graves
- **Root Cause:** Command connected to production Neon database instead of local development DB
- **Lesson Learned:** Always verify database environment before destructive commands

### Recovery Actions Taken ✅
1. ✅ **Identified Recovery Path:** Neon database has point-in-time restore with 1-day retention
2. ✅ **Upgraded Database Plan:** Neon Launch plan ($5/month) to resolve storage limits and suspension
3. ✅ **Executed Database Restore:** Successfully restored to 2 hours before the incident
4. ✅ **Verified Data Recovery:** All 12 graves and 2 users (Iain, Michael) fully restored
5. ✅ **Fixed Schema Issues:** Applied PascalCase model naming with @@map directives

### Final Database State ✅
- **Users Restored:** Iain Culverhouse (UKVampire) and Michael (moderator) are back
- **Data Integrity:** All 12 graves with complete user history recovered  
- **Schema Compatibility:** PascalCase models working perfectly with restored data
- **Infrastructure:** Upgraded to Neon Launch plan with better backups and no limits

### Schema Fixes Applied (Production-Safe)
```prisma
// Fixed model naming to match API expectations while preserving database tables
model Grave {  // PascalCase for code
  // ... fields ...
  @@map("graves")  // Maps to existing snake_case table
}

model User {   // PascalCase for code  
  // ... fields ...
  @@map("users")  // Maps to existing snake_case table
}
// All models use PascalCase with @@map directives for backward compatibility
```

### Recovery Timeline - Complete Success ✅
- **11:26 PM Sep 26, 2025:** Data loss incident occurred
- **11:30 PM:** Discovery and immediate response initiated
- **11:45 PM:** Neon restore interface accessed, upgrade completed
- **12:00 AM Sep 27:** Database restore to 2 hours prior executed
- **12:15 AM:** **FULL DATA RECOVERY CONFIRMED** - All users and graves restored

### Preventive Measures Going Forward 🛡️
1. **Environment Separation:** Always use local DATABASE_URL for development
2. **Migration Safety:** Use `prisma migrate dev` instead of `migrate reset` on any connected DB
3. **Database Protection:** Neon Launch plan provides enterprise-grade backups
4. **Verification Protocol:** Always confirm database environment before destructive operations

**🎉 OUTCOME: Complete success! Users Iain and Michael are back with all their data. Platform stronger than ever with proper database infrastructure. Death Certificate system fully operational on restored data.**

## ✅ Build Status – September 27, 2025
**Deployment readiness:** Prisma naming conflicts resolved by Codex; `pnpm build` now completes successfully.

### Schema Alignment Fixes (by Codex)
**Key Issues Identified & Resolved:**
- **Field Naming Mismatch:** Switched models to camelCase field names with `@map(...)` directives to map back to snake_case database columns, ensuring Prisma Client exposes the names the application expects
- **Missing Defaults:** Added `@default(uuid())` to UUID primary keys and `@updatedAt` to timestamp fields so create/update operations no longer require manual ID/timestamp values
- **Broken Relations:** Restored `moderationTrail` relation name for graves to match existing `include` statements in the codebase
- **Reaction Type Field:** Renamed `reactions` field back to `type` while preserving underlying `reaction_type` column via `@map`, fixing reaction creation calls

### Specific Schema Changes Made
- **Lines 11, 25, 57:** Field name standardization with `@map` directives
- **Lines 25, 105, 210:** Added missing `@default(uuid())` and `@updatedAt` decorators  
- **Line 79:** Restored `moderationTrail` relation alias for graves
- **Line 139:** Fixed reaction field mapping (`type` → `reaction_type`)

### Build Validation Results ✅
- **Prisma Client Regenerated:** `pnpm prisma generate` completed successfully
- **Compilation Verified:** App compiles without `provider_providerId` errors or other Prisma-related issues
- **Build Success:** `pnpm build` now completes; death certificate and moderation features render correctly
- **Data Integrity:** All existing functionality preserved with recovered production data

### Analytics Optimization - September 27, 2025 ✅
**Issue Resolved:** Analytics page dynamic server usage warnings eliminated through architectural improvement.

**Root Cause Identified:** Analytics page was making internal `fetch` calls to `/api/analytics/page` with `cache: 'no-store'` during SSR/SSG, forcing Next.js into dynamic mode and preventing static pre-rendering.

**Solution Implemented:**
1. **Created Server Function:** Extracted database logic from API route into `src/lib/analytics-data.ts` with `getAnalyticsData()` function
2. **Direct Database Access:** Analytics page now queries Prisma directly instead of making HTTP requests to its own API
3. **Static Pre-rendering:** Page converted from dynamic (ƒ) to static (○) generation, improving performance

**Performance Improvement:**
- **Before:** Analytics page forced dynamic server-side rendering
- **After:** Analytics page pre-rendered as static content with same functionality
- **Build Status:** `pnpm build` completes without analytics-related warnings

### Remaining Non-Critical Warnings
- **Dynamic Imports:** Next.js build warns about dynamic `@ffmpeg-installer/ffmpeg` imports in local upload route (pre-existing, does not affect functionality)

### Next Steps Recommended by Codex
1. **Local Environment:** Run `pnpm prisma generate` after pulling changes to update local Prisma Client

**Status:** Production-ready with optimized performance. All critical Prisma issues resolved and analytics page optimized for static generation.

Last updated: September 27, 2025 – after comprehensive Prisma schema fixes by Codex team.
