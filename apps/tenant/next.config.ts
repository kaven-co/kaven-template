import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

// Default image hostnames allowed for next/image optimization.
// Override via IMAGE_REMOTE_HOSTNAMES env var (comma-separated).
// Example: IMAGE_REMOTE_HOSTNAMES=flagcdn.com,api.dicebear.com,cdn.example.com
const DEFAULT_IMAGE_HOSTNAMES = ['flagcdn.com', 'api.dicebear.com'];

function getImageRemotePatterns(): NextConfig['images'] {
  const envHostnames = process.env.IMAGE_REMOTE_HOSTNAMES;
  const hostnames = envHostnames
    ? envHostnames.split(',').map((h) => h.trim()).filter(Boolean)
    : DEFAULT_IMAGE_HOSTNAMES;

  return {
    remotePatterns: hostnames.map((hostname) => ({
      protocol: 'https' as const,
      hostname,
    })),
  };
}

// Build CSP img-src directive from the same hostname list
const imageHostnames = process.env.IMAGE_REMOTE_HOSTNAMES
  ? process.env.IMAGE_REMOTE_HOSTNAMES.split(',').map((h) => h.trim()).filter(Boolean)
  : DEFAULT_IMAGE_HOSTNAMES;
const imgSrcDirective = `img-src 'self' data: ${imageHostnames.map((h) => `https://${h}`).join(' ')}`;

// Security headers applied to all routes
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      imgSrcDirective,
      "font-src 'self'",
      `connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}`,
      "frame-ancestors 'none'",
    ].join('; '),
  },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

const nextConfig: NextConfig = {
  images: getImageRemotePatterns(),
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [],
      // afterFiles: run after filesystem checks.
      // /api/auth/* excluded — handled by NextAuth Pages Router.
      afterFiles: [
        // /api/:section — top-level API path, no sub-segments
        {
          source: '/api/:section((?!auth(?:/|$))[^/]+)',
          destination: process.env.NEXT_PUBLIC_API_URL
            ? `${process.env.NEXT_PUBLIC_API_URL}/api/:section`
            : 'http://localhost:8000/api/:section',
        },
        // /api/:section/:path* — API paths with sub-segments
        {
          source: '/api/:section((?!auth(?:/|$))[^/]+)/:path*',
          destination: process.env.NEXT_PUBLIC_API_URL
            ? `${process.env.NEXT_PUBLIC_API_URL}/api/:section/:path*`
            : 'http://localhost:8000/api/:section/:path*',
        },
        {
          source: '/uploads/:path*',
          destination: process.env.NEXT_PUBLIC_API_URL
            ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/:path*`
            : 'http://localhost:8000/uploads/:path*',
        },
      ],
      fallback: [],
    };
  },
};

export default withNextIntl(nextConfig);
