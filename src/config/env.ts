export type AppMode = "development" | "production" | "test";

const VALID_MODES = ["development", "production", "test"] as const;

function parseMode(value: unknown): AppMode {
  if (VALID_MODES.includes(value as AppMode)) {
    return value as AppMode;
  }
  return "development";
}

export const MODE: AppMode = parseMode(process.env.NODE_ENV);

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
