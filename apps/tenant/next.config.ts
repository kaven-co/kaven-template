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
      "connect-src 'self' http://localhost:8000",
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
    return [
      {
        source: '/api/:path*',
        destination: process.env.API_URL
          ? `${process.env.API_URL}/api/:path*`
          : 'http://localhost:8000/api/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: process.env.API_URL
          ? `${process.env.API_URL}/uploads/:path*`
          : 'http://localhost:8000/uploads/:path*',
      }
    ];
  },
};

export default withNextIntl(nextConfig);
