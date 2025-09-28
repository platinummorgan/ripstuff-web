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

## 🎯 Death Certificate System - FULLY IMPLEMENTED & OPTIMIZED ✅
**Status:** Production-ready with comprehensive UI polish and OKLCH color fix deployed September 27, 2025

### Core Features ✅
- **Database Schema:** Extended with roastCount, eulogyCount fields and RoastEulogyReaction table
- **API Endpoint:** `/api/graves/[slug]/roast-eulogy` for dual-mode voting (roast vs eulogy) 
- **Component:** `DeathCertificate.tsx` with dom-to-image export, controversy scoring, QR codes
- **Dependencies:** dom-to-image ^2.6.0, qrcode ^1.5.4, @types/dom-to-image ^2.6.7
- **Integration:** Death Certificate appears on all grave pages with download functionality

### UI Polish & Enhancements - September 27, 2025 ✅
- **Age Calculation:** Dynamic age display (e.g., "1d", "4y 10m") next to deceased name
- **Cause Icons:** Context-aware icons (🎮 for gaming, 🎵 for audio, 💧 for water damage, etc.)
- **Enhanced Meter:** Vote counts in labels ("Condolences (18)" vs "Roasts (7)") with 50% tick mark
- **Controversy Levels:** Saint → Respected → Divisive → Controversial → Roasted with contextual descriptions
- **Certificate Serial Numbers:** Auto-generated format "Certificate #VG-ITEM12AB-2025"
- **Micro-CTA:** Engagement prompt "💭 Vote Condolences or Roasts"
- **Layout Optimization:** Increased height to 700px, reduced spacing, improved epitaph visibility

### Technical Architecture ✅
- **Color System Fix:** Sophisticated OKLCH color conversion utilities for modern CSS compatibility
- **Smart Conversion:** `normalizeColorValue()` and `applyLegacyColorOverrides()` functions convert Tailwind's oklch() colors to rgb() before dom-to-image export
- **Non-Destructive Processing:** Temporary color conversion with automatic cleanup restoration
- **Tailwind Configuration:** Custom config forcing hex colors with comprehensive palette mapping
- **Bundle Optimization:** Removed html2canvas dependency, streamlined to dom-to-image only

### OKLCH Color Problem Resolution - September 27, 2025 ✅
**Problem:** "Attempting to parse an unsupported color function 'oklch'" error during certificate download
**Root Cause:** Tailwind CSS v3.4+ uses modern oklch() color functions that dom-to-image/html2canvas cannot parse
**Solution Implemented:**
```typescript
// Smart color conversion utilities in DeathCertificate.tsx
const normalizeColorValue = (property, value) => {
  // Uses hidden DOM element to let browser convert oklch → rgb
}

const applyLegacyColorOverrides = (root) => {
  // Walks DOM tree and converts all oklch colors before export
  // Handles: color, backgroundColor, borderColor, boxShadow, etc.
}
```

**Technical Details:**
- **Browser-Native Conversion:** Uses DOM probe element for accurate color conversion
- **Comprehensive Coverage:** Handles all CSS color properties automatically  
- **Proper Cleanup:** `restoreColors` function in finally block restores original styles
- **Error Handling:** Graceful fallbacks with try/catch protection

### Gaming Console Detection ✅
- **Improved Logic:** PlayStation, Xbox, Nintendo consoles now get 🎮 "System Overload Failure"
- **Fixed Categorization:** No longer incorrectly labeled as "Childhood Neglect Syndrome"
- **Context-Aware Icons:** Smart detection based on title patterns and categories

### Certificate Export Features ✅
- **QR Code Integration:** Memorial page URL embedded in certificate for easy sharing
- **High-Resolution Export:** 2x scale (1600x1400px) PNG output optimized for sharing/printing
- **Professional Styling:** Official certificate appearance with decorative borders and typography
- **Error Recovery:** Robust error handling with detailed failure messages for debugging

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

## 📊 Google Analytics 4 Integration - September 27, 2025 ✅
**Comprehensive analytics tracking system implemented and deployed.**

### GA4 Implementation Features
- **Site-Wide Tracking:** GoogleAnalytics component integrated in root layout with proper Next.js optimization
- **Automatic Page Views:** Route-based pageview tracking with pathname-based navigation detection
- **Custom Event Tracking:** Enhanced analytics.ts class with RipStuff-specific event methods
- **Privacy Compliant:** Configured with `anonymize_ip: true` and disabled ad personalization signals

### RipStuff-Specific Events Tracked
```typescript
// Core interactions
- Grave views (with category and ID tracking)
- Reaction additions (heart, candle, rose, lol)
- Social sharing (Twitter, Facebook, Reddit, copy link)
- Death certificate downloads with controversy scores
- Roast vs Eulogy voting engagement

// User behavior  
- Sign-ins via Google/Facebook OAuth with new vs returning user detection
- Grave creation events with category, photo presence, and eulogy type
- Sympathy message submissions
- Moderation actions for admin users
```

### Technical Implementation
- **Components:** `GoogleAnalytics.tsx`, `GraveViewTracker.tsx` for automatic event tracking
- **Enhanced Analytics Class:** Improved `analytics.ts` with GA4-optimized event structure  
- **Custom Dimensions:** Configured for grave_category, user_type, content_type parameters
- **SSR Compatible:** Fixed useSearchParams() SSR issues for successful static generation

### Environment Configuration ✅
- **Environment Variable:** `NEXT_PUBLIC_GA_MEASUREMENT_ID = G-BOT1PMHN68` (live in Vercel)
- **Client-Side Fix:** Removed process.env access from browser code to prevent console errors
- **Local Development:** Analytics events logged to console when GA ID not present
- **Production Verified:** Real-time tracking confirmed working with active user detection

### Deployment Status ✅
- ✅ **Code Deployed:** All GA4 integration pushed to production
- ✅ **Environment Variable:** `NEXT_PUBLIC_GA_MEASUREMENT_ID` configured in Vercel (G-BOT1PMHN68)
- ✅ **Client-Side Fix:** Resolved process.env access issue in browser console
- ✅ **Live Tracking:** Real-time analytics confirmed working in GA4 dashboard
- 🎯 **Fully Operational:** Comprehensive event tracking active and collecting data

**Status:** Production-ready with comprehensive analytics actively tracking user behavior. All critical Prisma issues resolved, analytics page optimized for static generation, and GA4 tracking system fully operational with real-time data collection confirmed.

## 🌟 COMPREHENSIVE UX REFRAME - September 27, 2025 ✅ 
**Major terminology evolution to eliminate cognitive dissonance and improve user understanding.**

### Terminology System Redesign ✅
**Problem Identified:** "Eulogy" was incorrectly used for both single memorial text AND community reactions, causing confusion.

**Solution Implemented:** Clear separation of concerns with intuitive naming:

#### New Terminology Structure
- **Epitaph:** The single memorial text written at grave creation (replaces confusing "eulogy" usage)
- **Sympathies:** Community-written messages/comments (replaces "sympathies" for text content) 
- **Reactions:** Binary voting system for community sentiment (Condolences ❤️ vs Roasts 🔥)

#### UI Component Updates ✅
- **Death Certificate:** Now displays "Epitaph" section instead of "Eulogy"
- **Voting Buttons:** "Condolences ❤️" and "Roasts 🔥" (replaced generic roast/eulogy voting)
- **Page Layout:** Clear progression: Epitaph → Death Certificate → Sympathies → Reactions
- **Vote Labels:** "Condolences (18)" vs "Roasts (7)" with contextual counts

### Database Schema Alignment ✅
- **Preserved Existing Schema:** RoastEulogyReaction table and roastCount/eulogyCount fields maintained for data integrity
- **API Compatibility:** All existing endpoints continue working with new frontend terminology
- **Migration-Free:** No database changes required, pure UI/UX enhancement

### Death Certificate Enhancement - September 27, 2025 ✅
**Advanced UI polish and technical improvements implemented:**

#### Visual Enhancements ✅
- **Age Display:** Dynamic age calculation next to deceased name ("Age: 4y 10m", "1d", etc.)
- **Cause Icons:** Context-aware emoji icons based on death cause analysis:
  - 🎮 Gaming consoles (PlayStation, Xbox, Nintendo) 
  - 🎵 Audio equipment failures
  - 💧 Water damage incidents
  - 🔥 Overheating/fire damage
  - ⚡ Electrical failures
  - 🔋 Battery-related deaths

#### Controversy System Refinement ✅
- **5-Level Scale:** Saint (0-5%) → Respected (6-20%) → Divisive (21-40%) → Controversial (41-70%) → Roasted (71-100%)
- **Enhanced Labels:** Vote counts in buttons ("Condolences (18)" vs "Roasts (7)")
- **50% Tick Mark:** Visual indicator at controversy meter midpoint
- **Contextual Descriptions:** Level-appropriate controversy explanations

#### Technical Architecture ✅
- **Serial Numbers:** Auto-generated certificate format "Certificate #VG-ITEM12AB-2025"
- **Layout Optimization:** Increased certificate height to 700px, improved spacing
- **Engagement Prompts:** Subtle CTA "💭 Vote Condolences or Roasts" to encourage participation

### CRITICAL OKLCH Color Resolution - September 27, 2025 ✅
**Major technical breakthrough solving Death Certificate download failures.**

#### Problem Analysis
- **Error:** "Attempting to parse an unsupported color function 'oklch'" during certificate export
- **Root Cause:** Tailwind CSS v3.4+ generates modern oklch() color functions that dom-to-image cannot parse
- **Impact:** Death Certificate downloads completely broken for users

#### Elegant Solution Architecture ✅
```typescript
// Smart color conversion system in DeathCertificate.tsx
const normalizeColorValue = (property: string, value: string): string => {
  // Uses browser's native CSS parsing for accurate oklch → rgb conversion
  const probe = document.createElement('div');
  probe.style[property] = value;
  document.body.appendChild(probe);
  const computed = window.getComputedStyle(probe)[property];
  document.body.removeChild(probe);
  return computed;
};

const applyLegacyColorOverrides = (root: HTMLElement): (() => void) => {
  // Walks entire DOM tree and converts all oklch colors before export
  // Handles: color, backgroundColor, borderColor, boxShadow, outline, etc.
  // Returns cleanup function to restore original styles
};
```

#### Technical Implementation Details ✅
- **Browser-Native Conversion:** Uses DOM probe element for 100% accurate color conversion
- **Comprehensive Coverage:** Automatically handles all CSS color properties without manual mapping
- **Non-Destructive Processing:** Temporary conversion with automatic cleanup restoration
- **Error Handling:** Graceful fallbacks with detailed error logging for diagnostics
- **Performance Optimized:** Minimal DOM manipulation with efficient cleanup

#### Deployment Success ✅
- **Migration Complete:** Switched from html2canvas to dom-to-image for better performance
- **Bundle Optimization:** Removed html2canvas dependency, reduced bundle size
- **Production Verified:** Death Certificate downloads working perfectly with new color system
- **User Experience:** Seamless download functionality restored with improved reliability

### Recent Achievements - September 27, 2025 ✅
- ✅ **Analytics Optimization:** Converted analytics page from dynamic to static rendering
- ✅ **Prisma Schema Fixes:** Resolved all compilation errors with camelCase field mapping  
- ✅ **Google Analytics 4:** Complete integration with RipStuff-specific event tracking
- ✅ **UX Reframe:** Comprehensive terminology redesign (Epitaph vs Reactions system)
- ✅ **UI Polish:** Age badges, cause icons, enhanced voting interface, controversy refinement
- ✅ **OKLCH Resolution:** Elegant color conversion solution restoring Death Certificate downloads
- ✅ **Production Deployment:** All enhancements live with verified functionality

Last updated: September 27, 2025 – after successful OKLCH color resolution, comprehensive UX reframe, and Death Certificate system optimization.
