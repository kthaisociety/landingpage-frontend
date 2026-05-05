import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  AdminProfileData,
  UpdateAdminUserProfileData,
  AdminUser,
} from "@/types/admin";
import { API_URL } from "@/config";

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

async function fetchAdminUserProfile(
  userId: string,
): Promise<AdminProfileData> {
  const response = await fetch(`${API_URL}/profile/admin/${userId}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch profile: ${response.status}`);
  }
  return response.json();
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
    enabled: !!userId,
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

export interface CreateProjectDTO {
  title: string;
  oneLineDescription: string;
  categories: string;
  techStack: string;
  problemImpact: string;
  keyFeatures: string;
  status: string;
  screenshots: string; // JSON.stringify'd array
  repoUrl: string;
  contributors: string[]; // JSON.stringify'd object
  affiliations: string;
  timeline: string; // JSON.stringify'd object
  maintenancePlan: string;
  contact: string;
  teamName: string;
}

async function postProject(projectData: CreateProjectDTO) {
  const response = await fetch(`${API_URL}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(projectData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Failed to create project");
  }

  return response.json();
}

export function useProjectPosts() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: postProject,
    onSuccess: () => {
      // Optional: Invalidate and refetch the projects list if you have a query for it
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => {
      console.error("Error creating project:", error);
    },
  });

  return {
    createProject: mutation.mutate, // Use this for fire-and-forget
    createProjectAsync: mutation.mutateAsync, // Use this if you need to await the result in your component
    isCreating: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
}

// Delete a project
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_URL}/projects/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete project");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

// Update a project
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateProjectDTO>;
    }) => {
      const response = await fetch(`${API_URL}/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update project");
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects", variables.id] });
    },
  });
}

export type CompanyInput = {
  name: string;
  description: string;
  websiteUrl: string;
  logoFile: File | null;
  removeLogo: boolean;
};

export type Company = {
  id: string;
  name: string;
  description: string;
  logo: string;
  websiteUrl: string;
};


export function useCompanies() {
  return useQuery<Company[]>({
    queryKey: ["companies"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/company/getAllCompanies`);
      if (!res.ok) throw new Error("Failed to fetch companies");
      const data = await res.json();
      return data || [];
    },
  });
}

export function useCompany(id: string) {
  return useQuery<Company>({
    queryKey: ["companies", id],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/company/getCompany?id=${id}`);
      if (!res.ok) throw new Error("Failed to fetch company");
      return res.json();
    },
    enabled: !!id, // Only fetch if an ID is provided
  });
}

// --- MUTATIONS ---

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CompanyInput) => {
      const formData = new FormData();
      formData.append("name", input.name);
      formData.append("description", input.description);
      formData.append("websiteUrl", input.websiteUrl);
      if (input.logoFile) {
        formData.append("logo", input.logoFile);
      }

      const res = await fetch(`${API_URL}/company/admin/addCompany`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to create company");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/company/admin/delete?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete company");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Company deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete company");
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: CompanyInput }) => {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("name", input.name);
      formData.append("description", input.description);
      formData.append("websiteUrl", input.websiteUrl);

      if (input.removeLogo) {
        formData.append("removeLogo", "true");
      }

      if (input.logoFile) {
        formData.append("logo", input.logoFile);
      }

      const res = await fetch(`${API_URL}/company/admin/update`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to update company");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["companies", variables.id] });
      toast.success("Company updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update company.");
    },
  });
}