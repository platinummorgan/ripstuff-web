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

Last updated: September 26, 2025