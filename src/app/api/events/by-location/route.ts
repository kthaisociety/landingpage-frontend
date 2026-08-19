import { NextResponse } from "next/server";
import type { LumaEvent } from "../route";

const LUMA_API_BASE = "https://public-api.luma.com/v1";

export async function GET(request: Request) {
  try {
    const apiKey = process.env.LUMA_API_KEY;
    const { searchParams } = new URL(request.url);
    const locationName = searchParams.get("location");

    if (!apiKey) {
      return NextResponse.json(
        { error: "LUMA_API_KEY is not configured" },
        { status: 500 }
      );
    }

    if (!locationName) {
      return NextResponse.json(
        { error: "Location name is required" },
        { status: 400 }
      );
    }

    // Fetch all events from LUMA API
    const response = await fetch(`${LUMA_API_BASE}/calendar/list-events`, {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-luma-api-key": apiKey,
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch events: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Filter events by location name. entry.api_id is the calendar-event
    // listing id, distinct from entry.event.api_id (the actual event
    // resource) — use the latter, same as /api/events.
    const events: LumaEvent[] = data.entries
      .map((entry: { api_id: string; event: LumaEvent }) => entry.event)
      .filter((event: Record<string, unknown> & { location?: { venue_name?: string; name?: string } }) => {
        const eventLocation = event.location?.venue_name || event.location?.name || "";
        return eventLocation.toLowerCase().includes(locationName.toLowerCase());
      });

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching events by location:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

