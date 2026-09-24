# AGENTS.md

## Project Overview

Frontend for the KTH AI Society site. This is a Next.js App Router application in `frontend/` using React 19, TypeScript, Tailwind CSS, TanStack Query, and a small Redux store.

Critical current constraint: this app mixes Next route handlers, direct backend calls, and `localStorage`-backed flows. Do not "normalize" those paths without confirming the corresponding backend contract exists.

## Setup Commands

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Run lint: `npm run lint`
- Build production bundle: `npm run build`
- Start production server: `npm run start`

The repo currently contains `package-lock.json`. Prefer `npm` unless the branch is intentionally migrating package management. Do not introduce a second lockfile.

## Working Rules for Agents

- When editing auth, verify both the mock JWT flow and the route protection in `src/proxy.ts`.
- When editing `src/app/api/*`, remember these handlers run on the Next server, not in the browser.
- Preserve public-facing copy, images, and brand assets unless the task explicitly asks for content/design changes.

## Verification

- `npm run lint`
- `npm run build` for changes affecting routing, server handlers, env usage, or production-only behavior

## Additional Context

- `.agent-docs/architecture.md`: folder responsibilities, runtime behavior, and current mixed data sources
- `.agent-docs/env.md`: frontend environment variables and gotchas
- `.agent-docs/workflow.md`: coding conventions, verification, and testing notes
- `.impeccable.md`: Design system

## Jules AI Agent Workflows

This repo uses [Google Jules](https://jules.google) via the [`google-labs-code/jules-invoke`](https://github.com/google-labs-code/jules-action) GitHub Action to automate issue implementation and code maintenance.

### Setup

1. Authenticate with GitHub at [jules.google.com](https://jules.google.com) and generate an API key.
2. Add the key as a repository secret named `JULES_API_KEY` under **Settings → Secrets and variables → Actions**.

### Workflows

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| Implement Issue | `.github/workflows/jules-implement-issue.yml` | Issue labeled `jules` | Reads the issue, implements it, opens a PR |
| Weekly Cleanup | `.github/workflows/jules-weekly-cleanup.yml` | Cron (Mon 2 AM UTC) / manual | Dead code, type safety, consistency, a11y |

### How It Works

1. A team member creates an issue describing the work (feature, bug, refactor, etc.).
2. The `jules` label is added to the issue.
3. Jules clones the repo in a sandboxed Google Cloud VM, reads `AGENTS.md` and `.agent-docs/*`, implements the changes, runs `npm run lint` and `npm run build`, and opens a pull request.
4. The PR references the issue with `Closes #<number>` so it auto-closes on merge.

### Commit Conventions

Jules follows [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Use for |
|--------|---------|
| `feat:` | New features |
| `fix:` | Bug fixes |
| `chore:` | Tooling, deps, config changes |
| `refactor:` | Code restructuring (no behaviour change) |
| `docs:` | Documentation-only changes |
| `style:` | Formatting, whitespace |
| `test:` | Adding or updating tests |

Include a scope when it clarifies context, e.g. `feat(auth): add OAuth flow` or `fix(newsletter): validate email format`.

### Security

- The implement-issue workflow includes a **user allowlist** to prevent untrusted users from triggering Jules. Update the `contains(fromJSON(...))` list in the workflow file with your trusted GitHub usernames.
- Jules PRs should be reviewed like any human contribution — CI (`npm run lint`, `npm run build`) runs automatically on its PRs.

### Working with Jules

- Jules reads `AGENTS.md` and `.agent-docs/*` to understand the project. Keep these files up to date.
- Each workflow prompt includes project-specific constraints (mixed data sources, auth flows, brand asset preservation).
- Write clear, specific issues with acceptance criteria for best results.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
