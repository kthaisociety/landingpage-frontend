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
