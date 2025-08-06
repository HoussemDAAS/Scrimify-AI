/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Disable TypeScript checks during build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Disable ESLint checks during build
    ignoreDuringBuilds: true,
  },
  // Disable strict mode to avoid potential runtime issues
  reactStrictMode: false,
  // Optimize for production
  experimental: {
    optimizePackageImports: ['@clerk/nextjs', 'lucide-react'],
  },
  // Handle images from external sources
  images: {
    domains: ['xzxbszspthqwchhwwtyb.supabase.co'],
    unoptimized: true,
  },
  // Disable source maps in production for faster builds
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig
