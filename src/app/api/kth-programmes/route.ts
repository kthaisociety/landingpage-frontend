import { NextResponse } from "next/server";
import { isUsableKthProgrammeTitle } from "@/lib/kth-programmes";

const KTH_PROGRAMMES_URL =
  "https://api.kth.se/api/kopps/v2/programmes/all?l=en";

type KoppsProgramme = { title?: string };

export async function GET() {
  try {
    const res = await fetch(KTH_PROGRAMMES_URL, {
      next: { revalidate: 24 * 60 * 60 },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: "KTH programmes request failed" },
        { status: 502 }
      );
    }
    const data = (await res.json()) as KoppsProgramme[];
    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: "Unexpected programmes payload" },
        { status: 502 }
      );
    }
    const titles = new Set<string>();
    for (const p of data) {
      const t = p.title?.trim();
      if (t && isUsableKthProgrammeTitle(t)) titles.add(t);
    }
    const sorted = [...titles].sort((a, b) => a.localeCompare(b, "en"));
    return NextResponse.json(sorted);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch programmes" },
      { status: 502 }
    );
  }
}
