const nextConfig = {
  images: { unoptimized: true },
  trailingSlash: true,

  turbopack: {
    resolveAlias: {
      "@react-native-async-storage/async-storage": "./async-storage-web.js",

      // ⬇⬇ FIX: Prevent pino & thread-stream from bundling on client
      "pino": false,
      "pino-pretty": false,
      "thread-stream": false,
    },
  },

  typescript: { ignoreBuildErrors: true },
};

module.exports = nextConfig;
