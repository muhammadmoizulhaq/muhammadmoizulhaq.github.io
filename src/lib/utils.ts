import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * withBasePath — prefix a root-relative URL with the configured deployment
 * basePath. Required for GitHub Pages project sites (served under
 * `/<repo-name>/`) so that static assets like `/resume/...` resolve
 * correctly to `/<repo-name>/resume/...`.
 *
 * The basePath is injected at build time via `NEXT_PUBLIC_BASE_PATH`
 * (see next.config.ts). On a root deployment (user pages or local dev)
 * the env var is empty and the path is returned unchanged.
 *
 * Use this for `window.open(path)`, dynamically-created `<a>` elements,
 * and any absolute `href` that Next.js doesn't auto-prefix (Next.js only
 * auto-prefixes `<Link>` and `next/image`).
 */
export function withBasePath(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  if (!path.startsWith("/")) return path; // leave external/hash URLs alone
  return `${base}${path}`;
}
