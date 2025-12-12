/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  trailingSlash: true,

  turbopack: {
    // FIX: prevent imports that break Turbopack
    resolveAlias: {
      "@react-native-async-storage/async-storage": "./async-storage-web.js",
      "pino": false,
      "pino-pretty": false,
      "thread-stream": false,
    },

    // FIX: prevent Turbopack from scanning test/bench folders in node_modules
    exclude: [
      "**/node_modules/**/test/**",
      "**/node_modules/**/tests/**",
      "**/node_modules/**/bench/**",
      "**/node_modules/**/benchmark/**",
      "**/*.md",
      "**/*.markdown",
      "**/*.zip"
    ],
  },

  typescript: { ignoreBuildErrors: true },
};

module.exports = nextConfig;
