import { NextResponse } from "next/server";

const LUMA_API_BASE = "https://public-api.luma.com/v1";

export interface LumaEvent {
  api_id: string;
  name: string;
  start_at: string;
  cover_url?: string;
  url: string;
}

export interface EventData {
  api_id: string;
  event: LumaEvent;
}

interface LumaApiResponse {
  entries: EventData[];
}

export async function GET() {
  try {
    const apiKey = process.env.LUMA_API_KEY;

    if (!apiKey) {
      console.error("LUMA_API_KEY is not configured in environment variables");
      return NextResponse.json(
        { error: "LUMA_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // Fetch events from LUMA API
    // Endpoint: /calendar/list-events
    const response = await fetch(`${LUMA_API_BASE}/calendar/list-events`, {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-luma-api-key": apiKey,
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      let errorText: string;
      try {
        const errorData = await response.json();
        errorText = JSON.stringify(errorData);
      } catch {
        errorText = await response.text();
      }
      console.error("LUMA API error:", response.status, errorText);
      return NextResponse.json(
        { 
          error: `Failed to fetch events: ${response.status}`,
          details: errorText 
        },
        { status: response.status }
      );
    }

    const data = (await response.json()) as LumaApiResponse;

    // Extract events from entries array. Each entry has its own top-level
    // api_id (the calendar-event listing) distinct from entry.event.api_id
    // (the actual event resource) — event/get and everything else that takes
    // an event id needs the latter, not the former.
    const events: LumaEvent[] = data.entries.map((entry) => entry.event);

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}



