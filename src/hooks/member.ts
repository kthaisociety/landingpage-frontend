import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { LumaEvent } from "@/app/api/events/route";

const API_URL = `${
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
}/api/v1`;

export interface MemberProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  linkedin?: string;
  studyProgram?: string;
  description?: string;
}

export interface UpdateMemberProfileData {
  firstName: string;
  lastName: string;
  email: string;
  linkedin?: string;
  studyProgram?: string;
  description?: string;
}

async function fetchMemberProfile(): Promise<MemberProfile> {
  const response = await fetch(`${API_URL}/member/profile`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch member profile: ${response.status}`);
  }

  return response.json();
}

async function updateMemberProfile(
  data: UpdateMemberProfileData
): Promise<MemberProfile> {
  const response = await fetch(`${API_URL}/member/profile`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update member profile: ${response.status}`);
  }

  return response.json();
}

async function fetchMemberEvents(): Promise<LumaEvent[]> {
  const response = await fetch(`${API_URL}/member/events`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch member events: ${response.status}`);
  }

  const data = await response.json();
  return data.events || [];
}

async function updateMemberEvents(eventIds: string[]): Promise<LumaEvent[]> {
  const response = await fetch(`${API_URL}/member/events`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ eventIds }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update member events: ${response.status}`);
  }

  const data = await response.json();
  return data.events || [];
}

export function useMemberProfile() {
  return useQuery<MemberProfile>({
    queryKey: ["member-profile"],
    queryFn: fetchMemberProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

export function useUpdateMemberProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMemberProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member-profile"] });
    },
  });
}

export function useMemberEvents() {
  return useQuery<LumaEvent[]>({
    queryKey: ["member-events"],
    queryFn: fetchMemberEvents,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

export function useUpdateMemberEvents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMemberEvents,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member-events"] });
    },
  });
}
