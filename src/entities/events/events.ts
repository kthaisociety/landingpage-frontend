import { useQuery } from "@tanstack/react-query";
import type { LumaEvent } from "@/app/api/events/route";
import type { LumaEventDetail } from "@/app/api/events/[id]/route";

export function useEvents() {
  return useQuery<LumaEvent[]>({
    queryKey: ["events"],
    queryFn: async () => {
      const response = await fetch("/api/events");

      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.status}`);
      }

      const data = await response.json();
      return data.events || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes - cache persists for 30 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
  });
}

export function useEvent(eventId: string | undefined) {
  return useQuery<LumaEventDetail>({
    queryKey: ["event", eventId],
    queryFn: async () => {
      if (!eventId) {
        throw new Error("Event ID is required");
      }

      const response = await fetch(`/api/events/${eventId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch event: ${response.status}`);
      }

      const data = await response.json();
      return data.event;
    },
    enabled: !!eventId, // Only run query if eventId exists
    staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes - cache persists for 30 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
    refetchOnReconnect: false, // Don't refetch on reconnect
    retry: 2, // Retry failed requests up to 2 times
    retryDelay: 1000, // Wait 1 second between retries
  });
}
