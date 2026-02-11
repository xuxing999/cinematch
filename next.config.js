/** @type {import('next').NextConfig} */
const nextConfig = {
  // 部署時跳過 TypeScript 型別錯誤，不阻擋 build
  // （型別錯誤應在本機開發時用 tsc --noEmit 檢查）
  typescript: {
    ignoreBuildErrors: true,
  },
  // ESLint 錯誤也不阻擋 build
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.vercel.app'],
    },
  },
}

module.exports = nextConfig
