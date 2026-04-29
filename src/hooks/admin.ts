import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {AdminProfileData,UpdateAdminUserProfileData, AdminUser} from "@/types/admin"

const API_URL = `${
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
}/api/v1`;


async function fetchAllUsers(): Promise<AdminUser[]> {
  const response = await fetch(`${API_URL}/admin/users`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
}

async function promoteAdmin(userId: string) {
  const response = await fetch(`${API_URL}/admin/setadmin`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId }),
  });
  if (!response.ok) throw new Error("Failed to promote user");
  return response.json();
}

async function demoteAdmin(userId: string) {
  const response = await fetch(`${API_URL}/admin/unsetadmin`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId }),
  });
  if (!response.ok) throw new Error("Failed to demote user");
  return response.json();
}

export function useAdminUsers() {
  return useQuery<AdminUser[]>({
    queryKey: ["admin-users"],
    queryFn: fetchAllUsers,
  });
}

export function usePromoteAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: promoteAdmin,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });
}

export function useDemoteAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: demoteAdmin,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });
}



// Fetch a single profile as an admin
async function fetchAdminUserProfile(
  userId: string,
): Promise<AdminProfileData> {
  const response = await fetch(`${API_URL}/profile/admin/${userId}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    // if (response.status === 404) return null as any; // Handle "No profile yet" gracefully
    throw new Error(`Failed to fetch profile: ${response.status}`);
  }
  const test = response.json()
  console.log(test)
  return test;
//   return response.json();
}

// Update a profile as an admin
async function updateAdminUserProfile({
  userId,
  data,
}: {
  userId: string;
  data: UpdateAdminUserProfileData;
}) {
  const response = await fetch(`${API_URL}/profile/admin/${userId}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update profile: ${response.status}`);
  }
  return response.json();
}

export function useAdminUserProfile(userId: string) {
  return useQuery({
    queryKey: ["admin-profile", userId],
    queryFn: () => fetchAdminUserProfile(userId),
    enabled: !!userId, // Only run if userId exists
    retry: 1,
  });
}

export function useUpdateAdminUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAdminUserProfile,
    onSuccess: (_, variables) => {
      // Invalidate the specific user's cache so it re-fetches
      queryClient.invalidateQueries({
        queryKey: ["admin-profile", variables.userId],
      });
    },
  });
}