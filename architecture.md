# Frontend Architecture

This document gives a high-level overview of the current frontend architecture.
It is focused on folder responsibilities and runtime flow, not every individual file.

## Tech Stack

- Next.js App Router (`src/app`)
- React + TypeScript
- Tailwind CSS + custom UI components in `src/components/ui`
- TanStack Query for client data fetching/caching
- Local storage for temporary admin/member content management where backend endpoints are not fully available yet

## Top-Level Structure

```text
frontend/
  public/                 # Static assets (images, icons, video)
  src/
    app/                  # Routes, layouts, middleware, API route handlers
    components/           # UI and feature components
    hooks/                # Data/state hooks and local persistence hooks
    lib/                  # Shared utilities, models, integration clients
    validators/           # Validation schemas
```

## `src/app` (Routing + API Layer)

App Router pages and route handlers live here.

- `layout.tsx`, `globals.css`: root app shell and global styles
- `page.tsx`: home page
- `auth/*`: login/signup pages and auth layout
- `member/*`:
  - `member/dashboard/page.tsx`: member-facing management page
  - `member/admin/page.tsx`: admin workspace rendered in member-aligned design
  - `member/login/page.tsx`, `member/profile/page.tsx`: existing member/auth profile views
- Domain pages:
  - `events/*`
  - `projects/*`
  - `business/jobs/*`
  - `alumni/*`
  - `legal/*`
- `api/*`: server route handlers for events, jobs, newsletter
- `middleware.ts`: request gating/redirect logic (auth/access control)
- `testServerApi/*`: temporary/dev auth/logout test routes

## `src/components` (UI Composition Layer)

Feature-oriented components are grouped by domain:

- `components/member/*`
  - Member profile editor
  - Member event association selector
  - Member project association selector
- `components/admin/*`
  - `admin-workspace.tsx` section switcher
  - `companies/company-admin-panel.tsx`
  - `jobs/job-admin-panel.tsx`
  - `projects/project-admin-panel.tsx`
- `components/ui/*`: reusable primitives (button, card, input, tabs, checkbox, etc.)
- `components/providers/*`: app providers (query, auth initializer, Google OAuth)
- Other feature folders (`home`, `auth`, `alumni`, `jobs`, `events`, `navbar`, etc.) support public site sections.

## `src/hooks` (Client Data + Persistence)

Hooks are split by domain:

- `auth.ts`: login/register/logout/session behavior
- `events.ts`: fetch Luma event list/details through API routes
- `companies.ts`, `jobs.ts`, `projects.ts`: admin data creation/persistence (currently local storage-backed)
- `member.ts`: member profile/event API hook placeholders (backend-dependent)
- `use-toast.ts`: UI feedback helper

## `src/lib` (Shared Utilities / Integration)

- `integration/api-client.ts`: external/backend auth API client
- `data/projects.ts`: project dataset used by UI flows
- `model/*`: Redux store and slices (legacy/shared state setup)
- `utils.ts`: utility helpers (class merging, etc.)

## Current Data Flow Notes

- Public/member UI fetches data through hooks.
- Some admin/member management flows intentionally persist to local storage for now.
- Several components include TODO comments where backend endpoints should replace local storage logic.

## Current Route Intent

- Member users manage profile, event associations, and project associations in `member/dashboard`.
- Admin users manage companies/jobs/projects in `member/admin`.
- Admin functionality itself is centered in `components/admin`, while page-level visual framing is in `app/member/admin/page.tsx`.

