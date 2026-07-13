import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["bcryptjs"],
  poweredByHeader: false,
  compress: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "ntxfcrvgjfaesedyribq.supabase.co",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  experimental: {
    optimizePackageImports: [
      "recharts",
      "framer-motion",
      "lucide-react",
      "react-icons",
      "react-countup",
    ],
  },
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return [
      {
        source: "/image/about-aditya-saini.jpg",
        destination: "/image/aditya-saini-profile-2026.jpg",
        permanent: true,
      },
      {
        source: "/learn",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/learn/:slug*",
        destination: "/blog/:slug*",
        permanent: true,
      },
      {
        source: "/blog/:slug((?!$).*)",
        destination: "/:slug",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        // Next.js static assets — immutable cache
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Public image assets — long cache
        source: "/image/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Security headers for all routes
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  trailingSlash: true,
};

export default nextConfig;
