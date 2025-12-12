const nextConfig = {
  images: { unoptimized: true },
  trailingSlash: true,

  turbopack: {
    resolveAlias: {
      "@react-native-async-storage/async-storage": "./async-storage-web.js",

      // FIX alias — must be a string (path), NOT boolean
      "pino": "./empty.js",
      "pino-pretty": "./empty.js",
      "thread-stream": "./empty.js",
    },
  },

  typescript: { ignoreBuildErrors: true },
};

module.exports = nextConfig;
