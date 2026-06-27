#!/usr/bin/env bun
/**
 * gen-static-api.mjs
 * ------------------------------------------------------------------
 * Generates static JSON files under `public/api/portfolio/` that mirror
 * the shape of the (now-removed) dynamic API routes. This lets the same
 * `/api/portfolio/<type>.json` URLs work on GitHub Pages (pure static
 * hosting) — no server runtime required.
 *
 * Run automatically before `next build` (see package.json `prebuild`).
 * The generated files are committed-friendly but gitignored to avoid
 * drift; the build always regenerates them fresh from src/data/*.json.
 *
 * Output:
 *   public/api/portfolio/bio.json
 *   public/api/portfolio/experience.json
 *   public/api/portfolio/projects.json
 *   public/api/portfolio/skills.json
 *   public/api/portfolio/interests.json
 *   public/api/portfolio/stats.json
 *   public/api/portfolio/all.json
 *   public/api/portfolio/index.json   (the index/discovery document)
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const dataDir = resolve(root, "src/data");
const outDir = resolve(root, "public/api/portfolio");

mkdirSync(outDir, { recursive: true });

const readJson = (p) => JSON.parse(readFileSync(resolve(dataDir, p), "utf8"));

const bio = readJson("bio.json");
const experience = readJson("experience.json");
const projects = readJson("projects.json");

// Derive the same shapes the dynamic routes used to return.
const skills = { items: bio.skills };
const interests = { items: bio.interests };
const stats = { items: bio.stats };
const all = {
  bio,
  experience: experience.items,
  projects: projects.items,
  skills: bio.skills,
  interests: bio.interests,
  stats: bio.stats,
};
const index = {
  service: "portfolio-data-api",
  description:
    "JSON backend for the Muhammad Moiz portfolio (static). Edit src/data/*.json to update content.",
  endpoints: {
    bio: "/api/portfolio/bio.json",
    experience: "/api/portfolio/experience.json",
    projects: "/api/portfolio/projects.json",
    skills: "/api/portfolio/skills.json",
    interests: "/api/portfolio/interests.json",
    stats: "/api/portfolio/stats.json",
    all: "/api/portfolio/all.json",
  },
  sourceFiles: ["src/data/bio.json", "src/data/experience.json", "src/data/projects.json"],
};

const write = (name, obj) => {
  const path = resolve(outDir, name);
  writeFileSync(path, JSON.stringify(obj, null, 2) + "\n", "utf8");
  console.log(`  ✓ ${name}`);
};

console.log("Generating static portfolio API JSON → public/api/portfolio/");
write("bio.json", bio);
write("experience.json", experience);
write("projects.json", projects);
write("skills.json", skills);
write("interests.json", interests);
write("stats.json", stats);
write("all.json", all);
write("index.json", index);
console.log("Done.");
