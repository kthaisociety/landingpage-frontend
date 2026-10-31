import { NextResponse } from "next/server";

type SpotifyImage = { url?: string; maxHeight?: number };
type SpotifyEntity = {
  title?: string;
  name?: string;
  artists?: { name?: string }[];
  audioPreview?: { url?: string };
  visualIdentity?: { image?: SpotifyImage[] };
};

function spotifyEmbedUrl(value: string) {
  try {
    const url = new URL(value);
    if (!url.hostname.endsWith("spotify.com")) return "";
    const parts = url.pathname.split("/").filter(Boolean);
    const kinds = ["track", "album", "playlist", "episode", "artist"];
    const kindIndex = parts.findIndex((part) => kinds.includes(part));
    const id = kindIndex >= 0 ? parts[kindIndex + 1] : "";
    if (!id) return "";
    return `https://open.spotify.com/embed/${parts[kindIndex]}/${id}`;
  } catch {
    return "";
  }
}

export async function GET(request: Request) {
  const embedUrl = spotifyEmbedUrl(new URL(request.url).searchParams.get("url") ?? "");
  if (!embedUrl) {
    return NextResponse.json({ error: "Invalid Spotify link" }, { status: 400 });
  }

  try {
    const res = await fetch(embedUrl, { next: { revalidate: 24 * 60 * 60 } });
    if (!res.ok) {
      return NextResponse.json({ error: "Spotify link could not be loaded" }, { status: 502 });
    }
    const html = await res.text();
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
    if (!match) {
      return NextResponse.json({ error: "Spotify link could not be loaded" }, { status: 502 });
    }
    const entity = JSON.parse(match[1])?.props?.pageProps?.state?.data?.entity as SpotifyEntity | undefined;
    const images = entity?.visualIdentity?.image ?? [];
    const image = [...images].sort((a, b) => (b.maxHeight ?? 0) - (a.maxHeight ?? 0))[0]?.url ?? "";
    const title = entity?.title || entity?.name || "";
    if (!title || !image) {
      return NextResponse.json({ error: "Spotify link could not be loaded" }, { status: 502 });
    }
    const artist = (entity?.artists ?? []).map((person) => person.name?.trim() || "").filter(Boolean).join(", ");
    return NextResponse.json({
      href: embedUrl.replace("/embed/", "/"),
      title,
      artist,
      image,
      preview: entity?.audioPreview?.url ?? "",
    });
  } catch {
    return NextResponse.json({ error: "Spotify link could not be loaded" }, { status: 502 });
  }
}
