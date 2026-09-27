# Frontend Environment

Use standard Next.js env files such as `.env.local`.

## Common Variables

- `NEXT_PUBLIC_API_URL`: backend origin, defaults to `http://localhost:8080`
- `JWT_SECRET`: used by the mock member auth route handlers (`src/app/api/member/*`)
- `JWT_PUBLIC_KEY`: the backend's RS256 public key, used by `src/proxy.ts` to verify the member `jwt` cookie (skipped under `next dev`). The old name `JWTValidatingKey` is still accepted as a fallback.
- `LUMA_API_KEY`: required by `src/app/api/events/*`
- `ONBOARDING_SERVICE_URL`: internal-only base URL for `onboarding-service` (no public DNS), required by `src/app/api/onboarding/*`

## Notes

- `frontend/process.env` only contains `NODE_ENV="development"` and should not be treated as real secret management.
- Missing `LUMA_API_KEY` breaks event route handlers.
- Missing `ONBOARDING_SERVICE_URL` breaks the `/onboarding/start` and `/onboarding/confirm` pages (their proxy routes 500 instead of reaching onboarding-service).
- `JWT_SECRET` must stay consistent across the mock auth route handlers.
- `JWT_PUBLIC_KEY` must match the backend's key pair, or `src/proxy.ts` rejects every login outside `next dev`.
