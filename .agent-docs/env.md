# Frontend Environment

Use standard Next.js env files such as `.env.local`. `.env.example` lists every variable. Staging and
production set the same names at runtime from `kthaisociety/deployments`
(`projects/landingpage-frontend/project.yaml`); the image is the same in both, so nothing may be needed
at build time.

## Common Variables

- `BACKEND_URL`: backend origin, read at runtime (default `http://localhost:8080`). The server reads it
  from env; the browser gets it from `/runtime-env.js` (`src/app/runtime-env.js/route.ts`), loaded by the
  root layout before any app code. `src/config/env.ts` exports it as `API_BASE`.
- `JWT_PUBLIC_KEY`: the backend's RS256 public key, used by `src/proxy.ts` to verify the member cookie
  (skipped under `next dev`). The cookie is `__Host-jwt` in staging and production, where the API is on the
  site's own host under `/api/v1`, and `jwt` locally; `src/proxy.ts` reads either.
- `LUMA_API_KEY`: required by `src/app/api/events/*`
- `ONBOARDING_SERVICE_URL`: internal-only base URL for `onboarding-service` (no public DNS), required by `src/app/api/onboarding/*`
- `JWT_SECRET`: used only by the mock member auth route handlers (`src/app/api/member/*`)
- `NEXT_PUBLIC_API_URL`: legacy build-time fallback, used only when `BACKEND_URL` is unset

## Notes

- `frontend/process.env` only contains `NODE_ENV="development"` and should not be treated as real secret management.
- Missing `LUMA_API_KEY` breaks event route handlers.
- Missing `ONBOARDING_SERVICE_URL` breaks the `/onboarding/start` and `/onboarding/confirm` pages (their proxy routes 500 instead of reaching onboarding-service).
- `JWT_SECRET` must stay consistent across the mock auth route handlers.
- `JWT_PUBLIC_KEY` must match the backend's key pair, or `src/proxy.ts` rejects every login outside
  `next dev`.
- Only public values go in `/runtime-env.js`: anyone can read it.
