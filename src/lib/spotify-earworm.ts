/** Spotify track / album / playlist / episode URL helpers for profile earworms. */

const SPOTIFY_PATH =
  /^https?:\/\/open\.spotify\.com\/(intl-[a-z]{2}\/)?(track|album|playlist|episode)\/([a-zA-Z0-9]+)(?:[/?#].*)?$/i;

export type SpotifyEarworm = {
  /** open.spotify.com URL the member pasted */
  url: string;
  /** Optional short label, e.g. song title */
  label?: string;
  updatedAt: string;
};

export function parseSpotifyOpenUrl(raw: string): {
  kind: "track" | "album" | "playlist" | "episode";
  id: string;
} | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const match = trimmed.match(SPOTIFY_PATH);
  if (!match) return null;
  return {
    kind: match[2].toLowerCase() as "track" | "album" | "playlist" | "episode",
    id: match[3],
  };
}

export function isValidSpotifyOpenUrl(raw: string): boolean {
  return parseSpotifyOpenUrl(raw) !== null;
}

/** Convert an open.spotify.com URL into an embeddable player URL. */
export function toSpotifyEmbedUrl(raw: string): string | null {
  const parsed = parseSpotifyOpenUrl(raw);
  if (!parsed) return null;
  return `https://open.spotify.com/embed/${parsed.kind}/${parsed.id}?utm_source=generator&theme=0`;
}

export function normalizeSpotifyOpenUrl(raw: string): string {
  const parsed = parseSpotifyOpenUrl(raw);
  if (!parsed) return raw.trim();
  return `https://open.spotify.com/${parsed.kind}/${parsed.id}`;
}
