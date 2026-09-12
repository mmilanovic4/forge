const nextConfig = {
  compiler: {
    // Strips stray console.log/console.debug from production builds, but keeps
    // the methods src/lib/logger.js writes through.
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["info", "warn", "error"] }
        : false,
  },
  reactCompiler: true,
  poweredByHeader: false,
  generateEtags: false,
  experimental: {
    // Default Server Action body limit is 1MB — too small for image uploads.
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
