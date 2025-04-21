/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure for Cloudflare Pages deployment
  output: 'standalone',
  
  // Add your domain when ready
  // images: {
  //   domains: ['yourdomain.com'],
  // },
  
  // Uncomment if you want a custom URL path prefix
  // basePath: '/app',

  // Any other Next.js config options
};

module.exports = nextConfig;