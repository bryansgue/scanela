import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 🚀 Optimización de imágenes
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // 🚀 Compression
  compress: true,

  // 🚀 Production optimizations
  productionBrowserSourceMaps: false,

  // 🚀 Experimental features para optimizar imports
  experimental: {
    optimizePackageImports: ["lucide-react", "@tanstack/react-query"],
  },
};

export default nextConfig;
