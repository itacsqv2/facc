import { networkInterfaces } from "node:os";
import type { NextConfig } from "next";

/**
 * Dev only (ignored by `next build`/`next start`): hostnames allowed to load dev assets
 * and HMR besides localhost. Includes this machine's own private IPv4 addresses, so the
 * app can be opened from a phone on the same LAN (http://<pc-ip>:3000), plus optional
 * extra hostnames: NEXT_DEV_ALLOWED_ORIGINS=my-tunnel.example.com,other.local
 */
function ownLanAddresses(): string[] {
  return Object.values(networkInterfaces())
    .flat()
    .filter((net) => net && net.family === "IPv4" && !net.internal)
    .map((net) => net!.address)
    .filter((ip) => /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip));
}

const allowedDevOrigins = [
  ...ownLanAddresses(),
  ...(process.env.NEXT_DEV_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
];

/**
 * cacheComponents / partialPrefetching are deliberately OFF (D014): with them, event
 * URLs not prerendered at build time are answered as "postponed" streams whose
 * HTTP status is fixed at 200 before the page can call notFound(). Plain dynamic
 * rendering lets /eventi/[slug] return a real 404 from one in-page check.
 */
const nextConfig: NextConfig = {
  allowedDevOrigins,
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
