# Image Upload Guidelines

## User Uploads
- Please upload tasteful, respectful images.
- No faces, hateful symbols, or explicit content.
- Images should relate to memorials (flowers, candles, keepsakes, landscapes, symbolic art).
- All uploads are subject to moderation.
- Automated moderation checks are performed on upload; flagged content is escalated to human moderators.

## Demo/Seed Content
- Demo images are sourced from Creative Commons/royalty-free platforms:
  - Unsplash
  - Pexels
  - Wikimedia Commons
- Preference for soft, moody palettes matching UI tone.
- Inclusive options: memorial keepsakes, sky/landscape shots, symbolic art (paper cranes, candles).

## Custom Art
- Custom art may be generated using DALL·E or Midjourney with serene memorial prompts.
- Permissions and source metadata are captured for auditing.

## Technical Requirements
- Recommended aspect ratio: 4:3 or 1:1.
- Maximum upload size: 5MB.
- Supported formats: JPG, PNG, WEBP.
- Storage target: S3 or Vercel Blob.

## Moderation
- Automated moderation checks on upload.
- Human escalation for flagged content.
- Moderation queue and action endpoints are available for review and management.
- Inappropriate uploads are deleted according to the retention policy.

## UI Integration
- Images can be previewed and attached during the create/bury flow.
- Uploaded images may be used in share-card generation for gravesites.
- All images should include descriptive alt text for accessibility.
- Users receive clear feedback if uploads are rejected by moderation.

## Caching/CDN
- Assets are cached and served via CDN for performance.

## Testing
- Image upload and moderation flows are covered in the testing plan.

## Next Steps
- Finalize upload size and aspect ratio requirements.
- Confirm storage target (e.g., S3 or Vercel Blob).
- Implement moderation checks for uploads (automated + human escalation).
- Update the create/bury flow UI to support image preview/attachment.
- Plan caching/CDN strategy for the new asset bucket.
