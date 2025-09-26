
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '3000', pathname: '/uploads/**' },
      { protocol: 'http', hostname: 'localhost', port: '3001', pathname: '/uploads/**' },
      { protocol: 'http', hostname: 'localhost', port: '3002', pathname: '/uploads/**' },
      { protocol: 'https', hostname: 'localhost', pathname: '/uploads/**' },
      { protocol: 'https', hostname: process.env.AWS_S3_BUCKET ? `${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com` : 'example-bucket.s3.us-east-1.amazonaws.com', pathname: '/**' },
      { protocol: 'https', hostname: 'blob.vercel-storage.com', pathname: '/**' },
      { protocol: 'https', hostname: '**.blob.vercel-storage.com', pathname: '/**' },
    ],
  },
};

module.exports = nextConfig;
