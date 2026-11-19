import path from "node:path";
import type { NextConfig } from "next";

// The fixtures live in ../test-data (next to this app, not inside it), so the
// Turbopack root is the repo folder. Keep it to this one level: a broader root
// makes Turbopack watch far more files than it needs to.
const repoRoot = path.join(__dirname, "..");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  outputFileTracingRoot: repoRoot,
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
