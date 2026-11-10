const isDev = process.env.NODE_ENV !== "production";

// No nonces: they would need the proxy to run on every request and rule out
// static rendering. So inline scripts stay allowed (Next.js and next-themes
// both inject them), and the policy earns its keep elsewhere — nothing loads
// from, posts to or is framed by another origin. React needs eval in
// development only, for its debugging tools.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  // For browsers that predate `frame-ancestors`.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  // Browsers ignore it over plain HTTP, so it is harmless on localhost — but
  // there is no reason to send it from a development server either.
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains",
        },
      ]),
];

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
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        // Everything but stored files: a header set here replaces the one a
        // route handler sets itself, and /api/files answers with a stricter
        // policy of its own (`default-src 'none'; sandbox`).
        source: "/((?!api/files/).*)",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
        ],
      },
    ];
  },
};

export default nextConfig;
