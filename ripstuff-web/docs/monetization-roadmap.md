# Monetization Roadmap

Goal: Light-hearted, community-first experience with tasteful, useful monetization. Keep it fun, kind, and helpful.

## Phases
- MVP (Experimentation)
  - Affiliate suggestions: Contextual “Helpful replacements” card when posts mention broken items.
  - Disclosures: Clear FTC disclosure inline ("Some links may be affiliate links").
  - Feature flags: Toggle placements via env and per-page flags.
- V1: Virtual Plots & Stones
  - Sell plots: Reserve a coordinate on the overworld (unique, cheap; renewable or lifetime).
  - Sell tombstone styles: Cosmetic styles/frames users can assign to their yard/markers.
  - Wallet/credits: Credit packs (e.g., $5 → 500 credits); spend small amounts (e.g., 25 credits/plot) to reduce fee friction.
- V1.1: Tasteful Ads
  - Minimal in-feed sponsored cards after every N items; off on memorial detail pages by default.
  - Optional yard footer banner for users who opt-in to show support.

## Placements
- Eulogy page: “Helpful replacements” card (2–3 links) under content, collapsed by default.
- Feed: Rare in‑feed sponsored card, clearly labeled.
- Overworld: No ads; purchasable plots are the monetized interaction.
- Yard page: Optional small footer banner (opt‑in).

## Data Model (Prisma concepts)
- Plot: id, x, y, worldId, ownerId, status (available|reserved|owned), expiresAt (nullable for lifetime).
- Product (Cosmetic): id, slug, type (tombstone_style|frame|effect), name, priceCredits, active.
- InventoryItem: id, userId, productId, acquiredAt, metadata.
- Wallet: id, userId, balanceCredits, updatedAt.
- Purchase: id, userId, amountCents, creditsGranted, provider (stripe), externalId, status.
- Flags/Settings: user.showSponsored (boolean), region for compliance.

## Payments
- Stripe Checkout (one‑time): Credit packs; idempotent server routes + webhooks.
- Fraud: Rate limits, CSRF, webhook secret validation, idempotency keys.

## Affiliates
- Providers: Amazon, eBay, CJ, others.
- Matching: Keyword/regex from post text → product search links with provider tags.
- Disclosures: Inline label near links + site‑wide policy page.
- Opt‑outs: User can hide affiliate suggestions globally.

## Compliance & Safety
- FTC disclosure near links; accessible labels.
- Sensitive content: Suppress ads/affiliates on flagged memorials.
- Geo filtering: Disable providers where not supported.

## Metrics
- CTR on suggestions; outbound click IDs for basic attribution.
- Revenue per 1k sessions, credits sold, plots claimed.
- A/B test placements and copy.

## Env & Flags (initial)
- `NEXT_PUBLIC_AFFILIATES_ENABLED=true`
- `NEXT_PUBLIC_AMAZON_TAG=yourtag-20`
- `NEXT_PUBLIC_EBAY_CAMPAIGN_ID=1234567890`

## Next Steps
1. Implement affiliate suggestion utility (server‑safe, env‑driven providers).
2. Design Prisma migrations for Plot, Product, Inventory, Wallet, Purchase.
3. Add Stripe test integration for credit packs and wallet.
4. Ship minimal UI: replacements card beneath eulogies with disclosure + opt‑out.

---

Open questions:
- Lifetime plots vs. renewable? Target price per plot?
- Default state of the replacements card (expanded vs. collapsed)?
- Initial tombstone style pack count and vibe (somber vs. playful variants)?
