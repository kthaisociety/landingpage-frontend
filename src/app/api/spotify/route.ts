import { NextResponse } from "next/server";

type ItunesSong = {
  trackName?: string;
  artistName?: string;
  artworkUrl100?: string;
  trackViewUrl?: string;
};

const CACHE_DAY = { next: { revalidate: 24 * 60 * 60 } };

function artworkUrl(value: string) {
  return value.replace("100x100bb", "600x600bb");
}

function metaContents(html: string, key: string) {
  const pattern = new RegExp(
    `<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']|<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["']`,
    "gi",
  );
  return [...html.matchAll(pattern)]
    .map((match) => (match[1] || match[2] || "").replaceAll("&amp;", "&").replaceAll("&quot;", "\"").replaceAll("&#39;", "'").trim())
    .filter(Boolean);
}

async function titleAndArtistFromSpotify(value: string) {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return null;
  }
  if (!parsed.hostname.endsWith("spotify.com")) return null;
  const parts = parsed.pathname.split("/").filter(Boolean);
  const kindIndex = parts.findIndex((part) => part === "track");
  const id = kindIndex >= 0 ? parts[kindIndex + 1] : "";
  if (!id) return null;

  const res = await fetch(`https://open.spotify.com/track/${id}`, {
    headers: { "user-agent": "facebookexternalhit/1.1" },
    ...CACHE_DAY,
  });
  if (!res.ok) return null;
  const html = await res.text();
  const title = metaContents(html, "og:title")[0] ?? "";
  const artist = metaContents(html, "music:musician_description").join(" ");
  if (!title || !artist) return null;
  return { title, artist };
}

async function searchItunes(title: string, artist: string) {
  const term = [title, artist].filter(Boolean).join(" ");
  const endpoint = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=1`;
  const res = await fetch(endpoint, CACHE_DAY);
  if (!res.ok) return null;
  const data = (await res.json()) as { results?: ItunesSong[] };
  return data.results?.[0] ?? null;
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  let title = params.get("title")?.trim() ?? "";
  let artist = params.get("artist")?.trim() ?? "";
  const spotifyUrl = params.get("url")?.trim() ?? "";

  try {
    if ((!title || !artist) && spotifyUrl) {
      const extracted = await titleAndArtistFromSpotify(spotifyUrl);
      if (!extracted) {
        return NextResponse.json({ error: "Invalid Spotify link" }, { status: 400 });
      }
      title = title || extracted.title;
      artist = artist || extracted.artist;
    }

    if (!title) {
      return NextResponse.json({ error: "Song title is required" }, { status: 400 });
    }

    const song = await searchItunes(title, artist);
    if (!song?.trackName) {
      return NextResponse.json({ error: "Song could not be found" }, { status: 404 });
    }

    return NextResponse.json({
      href: song.trackViewUrl || spotifyUrl,
      title: song.trackName,
      artist: song.artistName || artist,
      image: song.artworkUrl100 ? artworkUrl(song.artworkUrl100) : "",
    });
  } catch {
    return NextResponse.json({ error: "Song could not be loaded" }, { status: 502 });
  }
}
