# Deploying to GitHub Pages

This portfolio is a **fully static site** (`output: "export"` in `next.config.ts`) and ships with a GitHub Actions workflow that builds and deploys automatically.

---

## Windows Quick Start

Everything in this project runs on Windows with **[Bun](https://bun.sh)** — no WSL, no Git Bash, no Linux required. Install Bun first (PowerShell, one line):

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Then in your project folder (PowerShell or cmd.exe — both work):

```bash
bun install
bun run dev              # development server at http://localhost:3000
bun run build:gh-pages   # production static build → out/
bun run serve            # preview the static build at http://127.0.0.1:4173
```

> **Do NOT open `out\index.html` by double-clicking it.** It will look broken (no CSS). See the section below — it must be served over HTTP via `bun run serve`.

To deploy: commit + push to GitHub. The included workflow (`.github/workflows/deploy.yml`) builds and deploys automatically — it runs on GitHub's servers (Linux runners provided by GitHub Actions), so your machine's OS doesn't matter for deployment.

---

## ⚠️ Read this first — why `out/index.html` looks broken when you open it directly

If you ran `bun run build:gh-pages` and then **double-clicked `out/index.html`** (or opened it via `file://`), you saw a page with **no styling and no data**. That is **not a bug** — it is how every Next.js static export works.

### Why it happens

`out/index.html` references its CSS, JS, and JSON assets with **absolute paths**:

```html
<link href="/_next/static/chunks/37275345654cc4bb.css" rel="stylesheet">
<script src="/_next/static/chunks/771dedee3f5e1621.js"></script>
```

When you open the file via `file:///.../out/index.html`, the browser resolves `/_next/...` to `file:///_next/...` — which **does not exist** on your filesystem. So every asset request fails, and you get raw unstyled HTML.

### How to preview it correctly

Serve the `out/` folder over HTTP. A helper script is included. **These commands work identically on Windows, macOS, and Linux** (they're just `bun run` scripts):

```bash
bun run build:gh-pages     # builds static export into out/
bun run serve              # serves out/ at http://127.0.0.1:4173
```

Or in one command:

```bash
bun run preview:gh-pages   # build + serve
```

Then open `http://127.0.0.1:4173/` in your browser. Press `Ctrl+C` in the terminal to stop the server.

To simulate a project site (basePath under `/<repo>/`), you need to set an environment variable before building. The syntax differs by shell:

**Windows — PowerShell** (default on Windows 10/11):
```powershell
$env:NEXT_PUBLIC_BASE_PATH="/your-repo"; bun run build:gh-pages
bun run serve --base /your-repo
```

**Windows — Command Prompt (cmd.exe):**
```cmd
set NEXT_PUBLIC_BASE_PATH=/your-repo && bun run build:gh-pages
bun run serve --base /your-repo
```

**macOS / Linux:**
```bash
NEXT_PUBLIC_BASE_PATH=/your-repo bun run build:gh-pages
bun run serve --base /your-repo
```

> Note: You normally **don't** need to set `NEXT_PUBLIC_BASE_PATH` locally. The GitHub Actions workflow sets it automatically based on your repo name. Only set it locally if you want to preview exactly how a project-site URL will behave.

Over HTTP every asset returns 200 and the page renders exactly as it will on GitHub Pages.

---

## How GitHub Pages serves your site

GitHub Pages does **not** look for `index.html` at your repo root. It serves files from one of two places:

1. **The `gh-pages` branch root** (if you deploy from a branch), OR
2. **A GitHub Actions artifact** (if you deploy via Actions) — this is what this project uses.

With the included workflow (`.github/workflows/deploy.yml`), on every push to `main`/`master`:

1. The workflow checks out the code and installs dependencies with Bun.
2. It **auto-derives `basePath`** from the repo name:
   - Project site `https://<user>.github.io/<repo>/` → `basePath = "/<repo>"`
   - User/org site `https://<user>.github.io/<user>.github.io/` → `basePath = ""` (root)
3. It runs `bun run build:gh-pages`, producing the `out/` directory.
4. It adds a `.nojekyll` file so GitHub Pages serves the `_next/` folder (Jekyll would otherwise drop it).
5. It uploads `out/` as a Pages artifact and deploys it.

The site goes live at `https://<user>.github.io/<repo>/` (or `https://<user>.github.io/` for user sites).

### One-time setup

1. **Push the repo to GitHub** (if not already).
2. In the repo, go to **Settings → Pages → Build and deployment → Source** and select **"GitHub Actions"** (not "Deploy from a branch").
3. That's it. Push to `main` and the workflow does the rest.

---

## Updating content

Edit the JSON files — no code changes, no redeploy config needed:

| File | What it controls |
|---|---|
| `src/data/bio.json` | Name, phone, email, social links, bio text, skills, stats |
| `src/data/experience.json` | Work history |
| `src/data/projects.json` | Projects & showreels |

Commit and push — the workflow rebuilds and redeploys automatically.

---

## Static API (data access)

Since GitHub Pages has no server runtime, the dynamic `/api/portfolio/*` routes are replaced by **static JSON files** generated at build time:

- `https://<user>.github.io/<repo>/api/portfolio/bio.json`
- `https://<user>.github.io/<repo>/api/portfolio/experience.json`
- `https://<user>.github.io/<repo>/api/portfolio/projects.json`
- `https://<user>.github.io/<repo>/api/portfolio/skills.json`
- `https://<user>.github.io/<repo>/api/portfolio/interests.json`
- `https://<user>.github.io/<repo>/api/portfolio/stats.json`
- `https://<user>.github.io/<repo>/api/portfolio/all.json`
- `https://<user>.github.io/<repo>/api/portfolio/index.json`

Run `bun run gen-api` locally to regenerate them into `public/api/portfolio/` (also runs automatically via `prebuild`).

---

## Notes / constraints

- **No server runtime:** everything is client-side. The site uses only client components + localStorage — no server actions, no API fetches. ✅
- **`next/font/google`:** fonts are downloaded and inlined at build time (requires network on the build runner, which GitHub Actions has).
- **Resume PDF:** lives in `public/resume/` and is served as a static file. Links use `withBasePath()` so they resolve correctly under any basePath.
- **Images:** `next/image` is disabled (`images.unoptimized: true`). This project uses no `<Image>` components, so no impact.
