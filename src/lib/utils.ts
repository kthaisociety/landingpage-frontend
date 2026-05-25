import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Turn admin-entered apply/website values into valid absolute hrefs. */
export function normalizeExternalHref(
  value: string | undefined | null,
): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.includes("@") && !trimmed.includes("/")) {
    return `mailto:${trimmed}`;
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  return `https://${trimmed}`;
}
