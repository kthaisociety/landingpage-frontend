/**
 * Helpers for member profile social fields.
 * Accepts pasted handles or partial URLs and normalizes to full https URLs
 * so HTML5 `type="url"` / backend URL validators don't reject common input.
 */

const LINKEDIN_HANDLE_PREFIX = "linkedin.com/in/";
// Letters (incl. common Latin diacritics), digits, underscore, hyphen.
// Broader than the application form's Swedish-only whitelist — profile edits
// should not reject valid LinkedIn handles with ü/é/etc.
const LINKEDIN_HANDLE_PATTERN = /^[\p{L}\p{N}_-]{3,100}$/u;
const GITHUB_HANDLE_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;

export function normalizeLinkedInHandle(value: string): string {
  return value
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^(www\.)?linkedin\.com\/in\//i, "")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
    .split(/[?#]/)[0];
}

export function normalizeGitHubHandle(value: string): string {
  return value
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^(www\.)?github\.com\//i, "")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
    .split(/[?#]/)[0];
}

/** Returns a full LinkedIn profile URL, or "" if empty / unusable. */
export function buildLinkedInUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const handle = normalizeLinkedInHandle(trimmed);
  if (!handle || !LINKEDIN_HANDLE_PATTERN.test(handle)) return "";
  return `https://${LINKEDIN_HANDLE_PREFIX}${handle}`;
}

/** Returns a full GitHub profile URL, or "" if empty / unusable. */
export function buildGitHubUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  // Already a full URL to somewhere on github.com — keep path as-is.
  if (/^https?:\/\/(www\.)?github\.com\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      return url.origin + url.pathname.replace(/\/+$/, "");
    } catch {
      return "";
    }
  }
  const handle = normalizeGitHubHandle(trimmed);
  if (!handle || !GITHUB_HANDLE_PATTERN.test(handle)) return "";
  return `https://github.com/${handle}`;
}

/**
 * Normalize optional social fields for PUT /profile/update.
 * Empty strings are omitted — Go URL validators often reject "".
 */
export function optionalProfileLinks(input: {
  githubLink?: string;
  linkedinLink?: string;
}): { githubLink?: string; linkedinLink?: string } {
  const githubLink = buildGitHubUrl(input.githubLink ?? "");
  const linkedinLink = buildLinkedInUrl(input.linkedinLink ?? "");
  return {
    ...(githubLink ? { githubLink } : {}),
    ...(linkedinLink ? { linkedinLink } : {}),
  };
}
