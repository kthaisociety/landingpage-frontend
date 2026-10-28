import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  isValidSpotifyOpenUrl,
  normalizeSpotifyOpenUrl,
  type SpotifyEarworm,
} from "@/lib/spotify-earworm";

/**
 * POC store for profile "personal touches" (Spotify earworms).
 * Module-level Map — fine for a single-instance / draft proof of concept.
 * Replace with a real backend field once Sam green-lights the feature.
 */
const earwormsByKey = new Map<string, SpotifyEarworm>();

function hasSessionCookie(request: NextRequest): boolean {
  return Boolean(
    request.cookies.get("jwt")?.value ||
      request.cookies.get("auth_token")?.value,
  );
}

function normalizeKey(key: string): string {
  return key.trim().toLowerCase();
}

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  if (!key?.trim()) {
    return NextResponse.json(
      { error: "Missing key (profile slug, id, or userId)" },
      { status: 400 },
    );
  }

  const earworm = earwormsByKey.get(normalizeKey(key)) ?? null;
  return NextResponse.json({ earworm });
}

export async function PUT(request: NextRequest) {
  if (!hasSessionCookie(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { key, url, label, clear } = body as {
    key?: string;
    url?: string;
    label?: string;
    clear?: boolean;
  };

  if (!key?.trim()) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  const storageKey = normalizeKey(key);

  if (clear || !url?.trim()) {
    earwormsByKey.delete(storageKey);
    return NextResponse.json({ earworm: null });
  }

  if (!isValidSpotifyOpenUrl(url)) {
    return NextResponse.json(
      {
        error:
          "Paste an open.spotify.com track, album, playlist, or episode link",
      },
      { status: 400 },
    );
  }

  const earworm: SpotifyEarworm = {
    url: normalizeSpotifyOpenUrl(url),
    label: label?.trim().slice(0, 80) || undefined,
    updatedAt: new Date().toISOString(),
  };

  earwormsByKey.set(storageKey, earworm);

  // Mirror under alternate keys so public /members/[slug] and dashboard
  // (userId) lookups both hit the same earworm during the POC.
  const { aliases } = body as { aliases?: string[] };
  if (Array.isArray(aliases)) {
    for (const alias of aliases) {
      if (typeof alias === "string" && alias.trim()) {
        earwormsByKey.set(normalizeKey(alias), earworm);
      }
    }
  }

  return NextResponse.json({ earworm });
}
