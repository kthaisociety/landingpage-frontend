export type AppMode = "development" | "production" | "test";

const VALID_MODES = ["development", "production", "test"] as const;

function parseMode(value: unknown): AppMode {
  if (VALID_MODES.includes(value as AppMode)) {
    return value as AppMode;
  }
  return "development";
}

export const MODE: AppMode = parseMode(process.env.NODE_ENV);

declare global {
  interface Window {
    // Set by /runtime-env.js (src/app/runtime-env.js/route.ts), which the
    // root layout loads before any app code.
    RUNTIME_ENV?: { BACKEND_URL?: string };
  }
}

// The backend's public origin is read at runtime, so one image serves staging
// and production: BACKEND_URL on the server, and the same value from
// window.RUNTIME_ENV in the browser. NEXT_PUBLIC_API_URL is the build-time
// fallback for builds that still bake it in.
function runtimeBackendURL(): string | undefined {
  const value =
    typeof window === "undefined"
      ? process.env.BACKEND_URL
      : window.RUNTIME_ENV?.BACKEND_URL;
  return value || undefined;
}

export const API_BASE =
  runtimeBackendURL() ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8080";
