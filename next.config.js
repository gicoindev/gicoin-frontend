/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  trailingSlash: true,

  // ✅ ENABLE TURBOPACK (required for Next.js 16)
  turbopack: {
    resolveAlias: {
      "@react-native-async-storage/async-storage": "./async-storage-web.js",
    },
  },

  typescript: { ignoreBuildErrors: true },
};

module.exports = nextConfig;
