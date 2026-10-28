import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { LumaEvent } from "@/app/api/events/route";
import { API_URL } from "@/config";

// Matches the exact JSON structure returned by GET /profile/me
export interface MemberProfile {
  userId: string;
  /** Profile row UUID when the backend includes it */
  id?: string;
  /** Public URL slug when the backend includes it */
  slug?: string;
  exists: boolean;
  roles: string[];
  firstName: string;
  lastName: string;
  email: string;
  university?: string;
  programme?: string;
  graduationYear?: number;
  githubLink?: string;
  linkedInLink?: string;
  aboutMe?: string;
  profilePicture?: string;
}

export interface UpdateMemberProfileData {
  firstName: string;
  lastName: string;
  email: string;
  university?: string;
  programme?: string;
  graduationYear?: number;
  githubLink?: string;
  linkedinLink?: string; // PUT expects lowercase 'i'
  aboutMe?: string;
}

async function readErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const body = (await response.json()) as {
      error?: string;
      message?: string;
    };
    return body.error || body.message || fallback;
  } catch {
    return fallback;
  }
}

async function fetchMemberProfile(): Promise<MemberProfile> {
  const response = await fetch(`${API_URL}/profile/me`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(
        response,
        `Failed to fetch member profile: ${response.status}`,
      ),
    );
  }
  return response.json();
}

async function updateMemberProfile(
  data: UpdateMemberProfileData,
): Promise<MemberProfile> {
  // Omit empty optional strings — backend URL validators reject "".
  const payload: Record<string, string | number> = {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
  };
  if (data.university?.trim()) payload.university = data.university.trim();
  if (data.programme?.trim()) payload.programme = data.programme.trim();
  if (data.graduationYear != null && !Number.isNaN(data.graduationYear)) {
    payload.graduationYear = data.graduationYear;
  }
  if (data.githubLink?.trim()) payload.githubLink = data.githubLink.trim();
  if (data.linkedinLink?.trim()) payload.linkedinLink = data.linkedinLink.trim();
  if (data.aboutMe?.trim()) payload.aboutMe = data.aboutMe.trim();

  const response = await fetch(`${API_URL}/profile/update`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(
        response,
        `Failed to update member profile: ${response.status}`,
      ),
    );
  }

  return response.json();
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




