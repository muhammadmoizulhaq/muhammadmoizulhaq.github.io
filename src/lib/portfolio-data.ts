/**
 * portfolio-data.ts
 * ------------------------------------------------------------------
 * Single source of truth for ALL portfolio content.
 *
 * The actual data lives in JSON files under `src/data/`:
 *   - bio.json         (name, contact, links, bio, stats, skills, interests)
 *   - experience.json  (work history)
 *   - projects.json    (showcase + showreels)
 *
 * To update the portfolio, edit those JSON files — no code changes needed.
 * The website imports from THIS module, so components stay decoupled from
 * the storage format (JSON today, CMS/database tomorrow).
 *
 * This module:
 *   1. Imports the JSON (typed via `as const`-equivalent type assertions).
 *   2. Re-exports strongly-typed consts (PROFILE, EXPERIENCES, PROJECTS, …).
 *   3. Exposes lookup helpers (getProjectById, getLinkByPlatform, …).
 *
 * Backend API routes (`/api/portfolio/[type]`) also read the same JSON
 * files, so the website can be driven either by direct import (fast, SEO-
 * friendly, no loading flash) or by fetching the API (for future headless
 * CMS / external consumers).
 * ------------------------------------------------------------------
 */

import bioData from "@/data/bio.json";
import experienceData from "@/data/experience.json";
import projectsData from "@/data/projects.json";

/* ------------------------------------------------------------------ */
/* Types — mirror the JSON shapes so consumers get full IntelliSense.  */
/* ------------------------------------------------------------------ */

export type Accent = "amber" | "orange" | "magenta" | "green";

export type SocialLink = {
  id: string;
  label: string;
  /** Machine platform key — maps to a Lucide icon in the UI. */
  platform: "github" | "linkedin" | "twitter" | "website" | "email" | "phone";
  url: string;
  handle?: string;
};

export type Stat = { label: string; value: string };

export type Skill = {
  name: string;
  level: number; // 0-100
  accent: Accent;
};

export type Interest = {
  name: string;
  /** Lucide icon name key — see Interests.tsx for the icon map. */
  icon: string;
};

export type Bio = {
  name: string;
  displayName: { first: string; last: string; full: string };
  monogram: string;
  title: string;
  tagline: string;
  role: string;
  stack: string;
  focus: string;
  status: string;
  email: string;
  phone: string;
  location: string;
  locationShort: string;
  resumeFile: string;
  bio: string[];
  tags: string[];
  stats: Stat[];
  marquee: string[];
  links: SocialLink[];
  skills: Skill[];
  interests: Interest[];
};

export type Experience = {
  id: string;
  company: string;
  role: string;
  period: string;
  location: string;
  current?: boolean;
  accent: Accent;
  highlights: string[];
};

export type Project = {
  id: string;
  title: string;
  category: "Game" | "Experience" | "Tool" | "Video";
  description: string;
  url: string;
  kind: "site" | "store" | "marketplace" | "video";
  tags: string[];
  accent: Accent;
  initials: string;
  /** Optional longer-form details shown in the project modal. */
  details?: string[];
};

/* ------------------------------------------------------------------ */
/* Typed data exports — cast the parsed JSON to our domain types.      */
/* ------------------------------------------------------------------ */

export const BIO: Bio = bioData as Bio;

export const EXPERIENCES: Experience[] = (
  experienceData as { items: Experience[] }
).items;

export const PROJECTS: Project[] = (projectsData as { items: Project[] }).items;

export const SKILLS: Skill[] = BIO.skills;

export const INTERESTS: Interest[] = BIO.interests;

export const STATS: Stat[] = BIO.stats;

/**
 * PROFILE — a flat projection of the most commonly used bio fields, kept
 * for backward-compatibility with components that import `{ PROFILE }`.
 * Prefer `BIO` for new code; `PROFILE` is a stable convenience surface.
 */
export const PROFILE = {
  name: BIO.name,
  monogram: BIO.monogram,
  title: BIO.title,
  tagline: BIO.tagline,
  role: BIO.role,
  stack: BIO.stack,
  focus: BIO.focus,
  status: BIO.status,
  email: BIO.email,
  phone: BIO.phone,
  location: BIO.location,
  locationShort: BIO.locationShort,
  resumeFile: BIO.resumeFile,
  bio: BIO.bio,
  tags: BIO.tags,
  links: BIO.links,
  displayName: BIO.displayName,
} as const;

/* ------------------------------------------------------------------ */
/* Lookup helpers — make components declarative.                       */
/* ------------------------------------------------------------------ */

/** Find a project by id (returns undefined if not found). */
export function getProjectById(id: string): Project | undefined {
  return PROJECTS.find((p) => p.id === id);
}

/** Find an experience by id (returns undefined if not found). */
export function getExperienceById(id: string): Experience | undefined {
  return EXPERIENCES.find((e) => e.id === id);
}

/** Find a social link by platform key (e.g. "github"). */
export function getLinkByPlatform(platform: SocialLink["platform"]): SocialLink | undefined {
  return BIO.links.find((l) => l.platform === platform);
}

/** All non-video projects (used by the project grid). */
export function getFeaturedProjects(): Project[] {
  return PROJECTS.filter((p) => p.category !== "Video");
}

/** All video/showreel projects. */
export function getShowreels(): Project[] {
  return PROJECTS.filter((p) => p.category === "Video");
}
