import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The sandbox preview and any custom domain proxy requests from a different
  // origin; allow the dev server to answer them instead of blocking them.
  allowedDevOrigins: ["*.e2b.app", "*.arena.ai", "localhost"],

  // PGlite ships WebAssembly/FS assets that must not be bundled by Turbopack.
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
