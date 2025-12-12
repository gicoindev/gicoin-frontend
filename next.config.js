/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  trailingSlash: true,

  // ⬇⬇ ADD THIS TO FORCE WEBPACK MODE ⬇⬇
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@react-native-async-storage/async-storage": require("path").resolve(
        __dirname,
        "async-storage-web.js"
      ),
    };
    return config;
  },

  // ⬇⬇ THIS LINE IS REQUIRED FOR NEXT 15+ TO DISABLE TURBOPACK ⬇⬇
  experimental: {
    webpackBuildWorker: true, // force webpack instead of turbopack
  },

  typescript: { ignoreBuildErrors: true },
};

module.exports = nextConfig;
