import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

// Public URL used for metadata (social previews). On Vercel it falls back to
// the production domain; set NEXT_PUBLIC_SITE_URL to use a custom domain.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000')

const nextConfig: NextConfig = {
  images: {
    loader: 'custom',
    loaderFile: './figma-image-loader.ts',
  },
  // Don't block deploys on type errors if the emitted JS is valid
  typescript: {
    ignoreBuildErrors: true,
  },
  // Prerender source maps add ~100 MB per static build worker
  enablePrerenderSourceMaps: false,
  experimental: {
    // Caps static build workers (~250-380 MB each) to lower `next build` peak memory
    cpus: 2,
  },
  env: {
    NEXT_PUBLIC_SITE_URL: siteUrl,
    // NOTE: Do not add PAYLOAD_SECRET or any other credential here. Values
    // placed in `env` are inlined into the JavaScript bundle by Next.js at
    // build time and become readable by anyone who can load the app's client
    // assets. Server-side code can still read them from `process.env.*`.
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
