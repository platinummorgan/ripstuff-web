export const IMAGE_UPLOAD_CONFIG = {
    maxSizeMB: 5,
    aspectRatios: ['4:3', '1:1'],
    formats: ['jpg', 'png', 'webp'],
    storageTarget: 'vercel-blob', // or 's3'
    moderation: {
        automated: true,
        humanEscalation: true,
    },
    guidelinesUrl: '/imageGuidelines.md',
};
