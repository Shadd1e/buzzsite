import path from "node:path";
import type { NextConfig } from "next";

// The app and its fixtures (test-data/) share the repo root.
const repoRoot = path.join(__dirname);

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  outputFileTracingRoot: repoRoot,
  images: {
    // Editorial stock listed in assets/IMAGE-CREDITS.md (licence check pending)
    remotePatterns: [{ protocol: "https", hostname: "images.pexels.com", pathname: "/photos/**" }],
  },
  turbopack: {
    root: repoRoot,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
