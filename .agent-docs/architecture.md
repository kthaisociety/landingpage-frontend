# Frontend Architecture

## Stack

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS
- TanStack Query
- Redux Toolkit for a small shared store

## Main Folders

- `src/app`: routes, layouts, and Next server route handlers
- `src/components`: reusable feature components
- `src/components/ui`: shared UI primitives
- `src/hooks`: domain hooks and client data access
- `src/lib`: utilities, RTK Query setup, helper code
- `src/types`: shared TypeScript types
- `public`: static assets

## Current Data Model

The frontend is not fully backed by a single API source. It currently mixes:

- Next route handlers in `src/app/api/*`
- direct backend calls through `NEXT_PUBLIC_API_URL`
- `localStorage` for some unfinished admin/member flows

Treat that as intentional until the corresponding backend contract is ready.

## Important Runtime Behavior

- `src/proxy.ts` protects `/member/dashboard` and `/member/admin` using the `auth_token` cookie.
- `src/app/api/member/auth/route.ts` is a mock login flow that issues a local JWT and currently hardcodes an admin role.
- `src/hooks/member.ts` calls the Go backend at `${NEXT_PUBLIC_API_URL}/api/v1`.
- `src/hooks/companies.ts`, `src/hooks/projects.ts`, and most of `src/hooks/jobs.ts` use `localStorage`.
- Event/newsletter/jobs route handlers in Next are separate integration surfaces from the Go backend.

## Change Guidance

- Do not replace local-storage-backed flows with backend calls without confirming the backend endpoint exists.
- When changing auth, inspect both the mock auth routes and `src/proxy.ts`.
- When changing image behavior, keep `next.config.ts` remote image allowlists aligned.
