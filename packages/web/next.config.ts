import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: { ignoreDuringBuilds: true },
  outputFileTracingRoot: __dirname,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOW-FROM https://elmoluz.com' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self' https://elmoluz.com" },
        ],
      },
    ]
  },
}

export default nextConfig
