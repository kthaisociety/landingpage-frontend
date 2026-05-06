import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL } from "@/config";

export interface TeamMember {
  profileId: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
  role: string;
  department: string;
  academicYear: string;
  aboutMe: string;
  githubLink: string;
  linkedinLink: string;
}

export interface TeamEntry {
  id: number;
  role: string;
  department: string;
  academicYear: string;
}

export interface PublicProfile {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
  university: string;
  programme: string;
  graduationYear: number;
  githubLink: string;
  linkedinLink: string;
  aboutMe: string;
  teamHistory: TeamEntry[];
  projects: {
    id: string;
    title: string;
    oneLineDescription: string;
    status: string;
    coverImage: string;
  }[];
}

// Fetch team members filtered by year and/or department
async function fetchTeamMembers(year?: string, department?: string): Promise<TeamMember[]> {
  const params = new URLSearchParams();
  if (year) params.set("year", year);
  if (department && department !== "All") params.set("department", department);
  const res = await fetch(`${API_URL}/team/members?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch team members");
  return res.json();
}

// Fetch all distinct academic years that have team entries
async function fetchTeamYears(): Promise<string[]> {
  const res = await fetch(`${API_URL}/team/years`);
  if (!res.ok) throw new Error("Failed to fetch years");
  return res.json();
}

// Fetch a single public profile by profile UUID
async function fetchPublicProfile(profileId: string): Promise<PublicProfile> {
  const res = await fetch(`${API_URL}/profile/public/${profileId}`);
  if (!res.ok) throw new Error("Profile not found");
  return res.json();
}

// Add own team entry
async function addMyTeamEntry(data: {
  role: string;
  department: string;
  academicYear: string;
}): Promise<TeamEntry> {
  const res = await fetch(`${API_URL}/team/member`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to add team entry");
  return res.json();
}

// Remove own team entry
async function removeMyTeamEntry(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/team/member/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to remove team entry");
}

export function useTeamMembers(year?: string, department?: string) {
  return useQuery<TeamMember[]>({
    queryKey: ["team-members", year, department],
    queryFn: () => fetchTeamMembers(year, department),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTeamYears() {
  return useQuery<string[]>({
    queryKey: ["team-years"],
    queryFn: fetchTeamYears,
    staleTime: 10 * 60 * 1000,
  });
}

export function usePublicProfile(profileId: string) {
  return useQuery<PublicProfile>({
    queryKey: ["public-profile", profileId],
    queryFn: () => fetchPublicProfile(profileId),
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAddMyTeamEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addMyTeamEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      queryClient.invalidateQueries({ queryKey: ["team-years"] });
    },
  });
}

export function useRemoveMyTeamEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeMyTeamEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      queryClient.invalidateQueries({ queryKey: ["team-years"] });
    },
  });
}
