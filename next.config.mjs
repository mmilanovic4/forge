const nextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
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
