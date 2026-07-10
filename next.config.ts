import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable HMR in production to avoid WebSocket errors
  webpack: (config, { dev }) => {
    if (!dev) {
      // Blocking attempts to connect to WebSocket
      config.plugins = config.plugins.filter(
        (plugin: any) =>
          plugin.constructor.name !== "HotModuleReplacementPlugin",
      );
    }
    return config;
  },
  // Additional options for Turbopack (if you are using it)
  turbopack: {
    // There is no direct setting to disable HMR, but this will help
  },
};

export default nextConfig;
