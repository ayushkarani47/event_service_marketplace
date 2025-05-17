/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'encrypted-tbn0.gstatic.com',
      'images.unsplash.com',
      'via.placeholder.com',
      'placekitten.com',
      'placeimg.com',
      'randomuser.me',
      'media.istockphoto.com',
      'framezhouse.com'
    ],
  },
  // Disable ESLint during build
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript checking during build
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;