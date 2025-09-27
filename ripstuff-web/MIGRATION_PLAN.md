# Death Certificate Terminology Migration Plan

## Current State Analysis
- `eulogyText` field contains the main memorial text (should be `epitaph`)
- `RoastEulogyReaction` table tracks ROAST/EULOGY votes 
- `eulogyCount` and `roastCount` track these votes
- Users are confused: "Eulogies: 14" sounds like 14 separate texts, not 14 votes

## Target State
- `epitaph` field contains the main memorial text (renamed from `eulogyText`)
- New reaction system: `sympathy` and `roast` counts
- `memoriesCount` for optional longer comments/photos
- `candleCount` already exists (optional lightweight reactions)

## Migration Strategy

### Phase 1: Schema Changes (Backward Compatible)
1. Add new fields to Grave model:
   - `sympathyCount: Int @default(0)`
   - `roastCountNew: Int @default(0)` (temporary name)
   - `memoriesCount: Int @default(0)`
   - `epitaph: String?` (nullable initially)

### Phase 2: Data Migration
1. Copy `eulogyText` → `epitaph` for all existing graves
2. Copy `eulogyCount` → `sympathyCount` (reframe eulogy votes as sympathy)
3. Copy `roastCount` → `roastCountNew`
4. Set `memoriesCount = 0` for all existing graves

### Phase 3: API Updates
1. Update roast-eulogy API to handle sympathy/roast reactions
2. Modify grave queries to return new field names
3. Update Death Certificate component to use new terminology

### Phase 4: Cleanup
1. Make `epitaph` non-nullable
2. Drop old fields: `eulogyText`, `eulogyCount`, `roastCount`
3. Rename `roastCountNew` → `roastCount`

## Safe Implementation
- All changes will be backward compatible until Phase 4
- API responses will include both old and new fields during transition
- Frontend can be updated incrementally
- Migration can be rolled back easily before Phase 4

## Database Schema Changes

```prisma
model Grave {
  // ... existing fields ...
  
  // NEW FIELDS (Phase 1)
  epitaph        String?  // Will replace eulogyText
  sympathyCount  Int      @map("sympathy_count") @default(0)
  roastCountNew  Int      @map("roast_count_new") @default(0) 
  memoriesCount  Int      @map("memories_count") @default(0)
  
  // EXISTING FIELDS (to be deprecated)
  eulogyText     String   @map("eulogy_text") // Will be dropped
  eulogyCount    Int      @map("eulogy_count") @default(0) // Will be dropped
  roastCount     Int      @map("roast_count") @default(0) // Will be dropped
}
```

## UI/UX Changes

### Death Certificate
- Show epitaph excerpt instead of vote counts
- "Roast Meter" with Sympathies vs Roasts percentage
- Optional tiles for Memories and Candles

### Reaction Buttons
- "Leave Sympathy ❤️" (replaces eulogy vote)
- "Roast It 🔥" (same concept, clearer label)
- "Add a Memory 🖼️" (new feature)

### Labels Throughout App
- "Epitaph by [Creator]" under the main text
- "Sympathies: X • Roasts: Y → Z% roasted"
- Clear distinction between one epitaph and many reactions