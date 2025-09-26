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

Last updated: September 25, 2025