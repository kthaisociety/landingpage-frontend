import { NextResponse } from "next/server";

type ItunesSong = {
  trackId?: number;
  trackName?: string;
  artistName?: string;
  artworkUrl100?: string;
  trackViewUrl?: string;
};

function artworkUrl(value: string) {
  return value.replace("100x100bb", "600x600bb");
}

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const endpoint = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=8`;
    const res = await fetch(endpoint, { next: { revalidate: 60 * 60 } });
    if (!res.ok) {
      return NextResponse.json({ error: "Song search failed" }, { status: 502 });
    }
    const data = (await res.json()) as { results?: ItunesSong[] };
    const results = (data.results ?? []).flatMap((song) => {
      if (!song.trackId || !song.trackName) return [];
      return [
        {
          id: String(song.trackId),
          title: song.trackName,
          artist: song.artistName ?? "",
          image: song.artworkUrl100 ? artworkUrl(song.artworkUrl100) : "",
          href: song.trackViewUrl ?? "",
        },
      ];
    });
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "Song search failed" }, { status: 502 });
  }
}
