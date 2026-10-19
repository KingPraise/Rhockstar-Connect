import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  fallbacks: {
    document: "/offline",
  },

  extendDefaultRuntimeCaching: true,

  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/res\.cloudinary\.com\/.*$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "rhockstar-cloudinary-images",
          cacheableResponse: {
            statuses: [0, 200],
          },
          expiration: {
            maxEntries: 150,
            maxAgeSeconds: 30 * 24 * 60 * 60,
          },
        },
      },
    ],
  },
});

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(self), geolocation=()',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://www.gstatic.com https://checkout.flutterwave.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://images.unsplash.com https://firebasestorage.googleapis.com https://lh3.googleusercontent.com https://res.cloudinary.com https://*.googleusercontent.com https://*.gstatic.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "media-src 'self' blob: data: https://res.cloudinary.com https://firebasestorage.googleapis.com",
      "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://api.flutterwave.com https://api.cloudinary.com https://res.cloudinary.com",
      "frame-src 'self' https://checkout.flutterwave.com https://*.firebaseapp.com",
      "frame-ancestors 'self'",
      "object-src 'none'",
      "base-uri 'self'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactCompiler: true,
  allowedDevOrigins: ['rhockstar-dev-999.loca.lt', 'localhost:3000'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      }
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        source: '/:all*(svg|jpg|png|webp|ico|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);
