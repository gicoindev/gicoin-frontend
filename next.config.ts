import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,

  webpack: (config) => {
    // 🚀 FIX: Override React Native async-storage → dummy module
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@react-native-async-storage/async-storage": path.resolve(
        __dirname,
        "async-storage-web.js"
      ),
    };

    return config;
  },
};

export default nextConfig;
