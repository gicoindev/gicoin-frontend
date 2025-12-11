const path = require("path");

const nextConfig = {
  images: { unoptimized: true },
  trailingSlash: true,
  output: "export",

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@react-native-async-storage/async-storage": path.resolve(
        __dirname,
        "async-storage-web.js"
      ),
    };
    return config;
  },

  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

module.exports = nextConfig;
