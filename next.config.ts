import type { NextConfig } from "next";

/**
 * The app is exported as static files and served from GitHub Pages at
 * https://mrakaza12.github.io/MY-DOMAIN/ — hence the basePath.
 */
const nextConfig: NextConfig = {
  output: "export",
  basePath: "/MY-DOMAIN",
  trailingSlash: true,
  images: { unoptimized: true },
  allowedDevOrigins: ["*.e2b.app", "*.arena.ai", "localhost"],
};

export default nextConfig;
