import { NextResponse } from "next/server";

const LUMA_API_BASE = "https://public-api.luma.com/v1";

export interface LumaEvent {
  api_id: string;
  name: string;
  start_at: string;
  cover_url?: string;
  url: string;
}

export interface LumaEventDetail extends LumaEvent {
  description?: string;
  description_html?: string;
  end_at?: string;
  duration_minutes?: number;
  host?: {
    name?: string;
    email?: string;
    display_name?: string;
  };
  host_profile?: {
    name?: string;
    email?: string;
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const apiKey = process.env.LUMA_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "LUMA_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const { id: eventId } = await params;

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    // Fetch single event from LUMA API
    // Endpoint: /event/get
    const response = await fetch(
      `${LUMA_API_BASE}/event/get?id=${encodeURIComponent(eventId)}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          "x-luma-api-key": apiKey,
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      let errorText: string;
      try {
        const errorData = await response.json();
        errorText = JSON.stringify(errorData);
      } catch {
        errorText = await response.text();
      }
      console.error("LUMA API error:", response.status, "eventId:", eventId, errorText);
      return NextResponse.json(
        {
          error: `Failed to fetch event: ${response.status}`,
          details: errorText,
        },
        { status: response.status }
      );
    }

    const apiResponse = await response.json();
    
    // The Luma API returns { event: {...}, hosts: [...] }
    const eventData = apiResponse.event;
    
    if (!eventData || (!eventData.api_id && !eventData.id)) {
      console.error("Invalid API response:", apiResponse);
      return NextResponse.json(
        { error: "Invalid event data received from API" },
        { status: 500 }
      );
    }
    
    // Handle hosts array if present
    const { hosts = [] } = apiResponse;

    // Calculate end_at from duration if not provided
    let { end_at } = eventData;
    if (!end_at && eventData.start_at && eventData.duration_minutes) {
      const startDate = new Date(eventData.start_at);
      startDate.setMinutes(startDate.getMinutes() + eventData.duration_minutes);
      end_at = startDate.toISOString();
    }

    // Map the API response to our expected structure
    // Use id if api_id is not present (Luma API uses 'id' field)
    const mappedEventId = eventData.api_id || eventData.id || eventId;
    
    // Get host info from hosts array or event.host
    const hostInfo = hosts.length > 0 ? hosts[0] : eventData.host;
    
    const event: LumaEventDetail = {
      api_id: mappedEventId,
      name: eventData.name || "Untitled Event",
      start_at: eventData.start_at || "",
      cover_url: eventData.cover_url,
      url: eventData.url || "",
      description: eventData.description_html || eventData.description,
      description_html: eventData.description_html,
      end_at: end_at,
      duration_minutes: eventData.duration_minutes,
      host: hostInfo ? {
        name: hostInfo.display_name || hostInfo.name,
        email: hostInfo.email,
        display_name: hostInfo.display_name,
      } : undefined,
      host_profile: eventData.host_profile ? {
        name: eventData.host_profile.name,
        email: eventData.host_profile.email,
      } : undefined,
    };

    return NextResponse.json({ event });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

