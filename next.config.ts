import type { NextConfig } from "next";

/**
 * Static-export configuration for GitHub Pages.
 * ------------------------------------------------------------------
 * The portfolio is a fully static site — no server runtime needed.
 * `output: "export"` produces a self-contained `out/` directory that
 * GitHub Pages can serve directly.
 *
 * `basePath` is read from NEXT_PUBLIC_BASE_PATH so the same build works
 * for both project sites (https://<user>.github.io/<repo>/ → basePath
 * "/<repo>") and user/org sites (https://<user>.github.io/ → basePath "").
 * The GitHub Actions workflow derives and sets this env var automatically.
 *
 * `trailingSlash: true` makes directory-style URLs work on GitHub Pages
 * (e.g. /about/ serves out/about/index.html), and `images.unoptimized`
 * disables the Next.js Image Optimization API (not available on static
 * hosting). This project doesn't use next/image, but the flag is set for
 * safety / future-proofing.
 */
//const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const basePath = "";

const nextConfig: NextConfig = {
  output: "export",
  basePath: basePath || undefined,
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
