"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useEvents } from "@/hooks/events";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const MEMBER_EVENT_SELECTION_STORAGE_KEY = "member-selected-event-ids";

export function MemberEventSelection() {
  const { toast } = useToast();
  const { data: events, isLoading: eventsLoading } = useEvents();
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // TODO(api): Replace localStorage preload with a backend request that fetches
    // the member's existing event associations, e.g. GET /api/v1/member/events.
    const storedIds = localStorage.getItem(MEMBER_EVENT_SELECTION_STORAGE_KEY);
    if (!storedIds) return;

    try {
      const parsed = JSON.parse(storedIds) as string[];
      const frame = requestAnimationFrame(() => {
        setSelectedEvents(new Set(parsed));
      });
      return () => cancelAnimationFrame(frame);
    } catch {
      localStorage.removeItem(MEMBER_EVENT_SELECTION_STORAGE_KEY);
    }
  }, []);

  const handleEventToggle = (eventId: string) => {
    const newSelected = new Set(selectedEvents);
    if (newSelected.has(eventId)) {
      newSelected.delete(eventId);
    } else {
      newSelected.add(eventId);
    }
    setSelectedEvents(newSelected);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // TODO(api): Replace localStorage save with backend persistence,
      // e.g. PUT /api/v1/member/events with selected event IDs.
      localStorage.setItem(
        MEMBER_EVENT_SELECTION_STORAGE_KEY,
        JSON.stringify(Array.from(selectedEvents))
      );
      toast({
        title: "Events updated",
        description: "Your event selections were saved locally for now.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to save event selections.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = eventsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading events...</span>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No events available. Events are fetched from Luma.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Select the events where you have been part of the organizing or working team.
        </p>

        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {events.map((event) => (
            <div
              key={event.api_id}
              className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <Checkbox
                id={`event-${event.api_id}`}
                checked={selectedEvents.has(event.api_id)}
                onCheckedChange={() => handleEventToggle(event.api_id)}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <Label
                  htmlFor={`event-${event.api_id}`}
                  className="font-medium cursor-pointer block"
                >
                  {event.name}
                </Label>
                {event.start_at && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(event.start_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
                {event.url && (
                  <a
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline mt-1 inline-block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View on Luma →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Event Selections"}
        </Button>
      </div>
    </div>
  );
}
