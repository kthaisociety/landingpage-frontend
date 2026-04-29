# Frontend Workflow

## Setup

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Run lint: `npm run lint`
- Build production bundle: `npm run build`
- Start production server: `npm run start`
- Clear build output: `npm run clean`

Prefer `npm` in this package because the repo already contains `package-lock.json`.

## Code Conventions

- Use named exports by default; `page.tsx` and `layout.tsx` are the usual exceptions.
- Use the `@/` path alias instead of deep relative imports.
- Keep reusable UI out of `src/app`.
- Use `import type` where appropriate.
- Avoid `any` outside the existing UI exceptions.
- Add `"use client"` only when hooks or browser APIs require it.

## Verification

Minimum checks for most frontend changes:

- `npm run lint`
- `npm run build` for routing, server handler, env, or production-path changes

Manual checks that matter here:

- public pages render without runtime errors
- member login/dashboard/admin redirects still work
- local-storage-backed admin panels still persist across refreshes
- backend-backed member flows still point to the expected `NEXT_PUBLIC_API_URL`

## Testing Notes

There is no dedicated frontend unit or e2e suite checked into this package right now. Treat lint and production builds as the baseline verification, and add automated tests if you introduce non-trivial logic or a new test framework.
