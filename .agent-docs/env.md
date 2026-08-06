# Frontend Environment

Use standard Next.js env files such as `.env.local`.

## Common Variables

- `NEXT_PUBLIC_API_URL`: backend origin, defaults to `http://localhost:8080`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: required by the Google OAuth provider wrapper
- `JWT_SECRET`: used by the mock member auth route handlers and `src/proxy.ts`
- `LUMA_API_KEY`: required by `src/app/api/events/*`

## Notes

- `frontend/process.env` only contains `NODE_ENV="development"` and should not be treated as real secret management.
- Missing `LUMA_API_KEY` breaks event route handlers.
- Missing `NEXT_PUBLIC_GOOGLE_CLIENT_ID` breaks the Google OAuth provider wrapper.
- `JWT_SECRET` must stay consistent across the mock auth route handlers and middleware-like route protection behavior.
