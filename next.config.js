/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react']
  },
  // Cloudflare Pages対応設定
  images: {
    unoptimized: true
  },
  // 動的ルートを無効化してより多くの静的ページを生成
  trailingSlash: true,
  async generateBuildId() {
    return 'nextpint-cf-build'
  }
}

module.exports = nextConfig