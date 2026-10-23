import type { NextConfig } from "next";

/**
 * cacheComponents / partialPrefetching are deliberately OFF (D014): with them, event
 * URLs not prerendered at build time are answered as "postponed" streams whose
 * HTTP status is fixed at 200 before the page can call notFound(). Plain dynamic
 * rendering lets /eventi/[slug] return a real 404 from one in-page check.
 */
const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
