import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { LumaEvent } from "@/app/api/events/route";
import { API_URL } from "@/config";

// Matches the JSON structure returned by GET /profile/
// When no profile exists yet, the backend still returns 200 with
// `{ userId, exists: false }` so the rest of the fields are optional.
export interface MemberProfile {
  userId: string;
  exists: boolean;
  roles?: string[];
  firstName?: string;
  lastName?: string;
  email?: string;
  university?: string;
  programme?: string;
  graduationYear?: number;
  githubLink?: string;
  linkedInLink?: string;
  aboutMe?: string;
}

export interface UpdateMemberProfileData {
  firstName: string;
  lastName: string;
  email: string;
  university?: string;
  programme?: string;
  graduationYear?: number;
  githubLink?: string;
  // NOTE: backend PUT body uses lowercase "i" (linkedinLink),
  // while GET responses use "linkedInLink". Keep both casings explicit.
  linkedinLink?: string;
  aboutMe?: string;
}

export class ProfileApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ProfileApiError";
    this.status = status;
    this.code = code;
  }
}

async function parseErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const data = (await response.clone().json()) as {
      error?: string;
      message?: string;
    };
    return data.error || data.message || fallback;
  } catch {
    const text = await response.text().catch(() => "");
    return text || fallback;
  }
}

async function fetchMemberProfile(): Promise<MemberProfile> {
  const response = await fetch(`${API_URL}/profile/`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.status === 401) {
    throw new ProfileApiError("Not authenticated", 401, "unauthenticated");
  }

  if (!response.ok) {
    const message = await parseErrorMessage(
      response,
      `Failed to fetch member profile (${response.status})`,
    );
    throw new ProfileApiError(message, response.status);
  }

  return response.json();
}

async function updateMemberProfile(
  data: UpdateMemberProfileData,
): Promise<MemberProfile> {
  // Per backend spec: PUT /profile/ updates the profile and creates it
  // if it does not yet exist, so we use a single endpoint for save.
  const response = await fetch(`${API_URL}/profile/`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (response.ok) {
    const updated = (await response.json()) as MemberProfile;
    // Backend returns the new/updated profile object without the `exists`
    // discriminator on the write path; normalize it so the form can rely on it.
    return { ...updated, exists: true };
  }

  let fallback: string;
  switch (response.status) {
    case 400:
      fallback = "Invalid profile information. Please check your input.";
      break;
    case 401:
      fallback = "You need to be signed in to update your profile.";
      break;
    case 404:
      fallback = "User not found.";
      break;
    case 500:
      fallback = "Server error while saving your profile. Please try again.";
      break;
    default:
      fallback = `Failed to update member profile (${response.status})`;
  }

  const message = await parseErrorMessage(response, fallback);
  throw new ProfileApiError(message, response.status);
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


async function fetchMemberEvents(): Promise<LumaEvent[]> {
  const response = await fetch(`${API_URL}/event`, {
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
  const response = await fetch(`${API_URL}/event`, {
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




