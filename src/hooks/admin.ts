import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  AdminProfileData,
  UpdateAdminUserProfileData,
  AdminUser,
} from "@/types/admin";
import { API_URL } from "@/config";


// Users

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

async function deleteUser(userId: string) {
  const response = await fetch(`${API_URL}/admin/users/${encodeURIComponent(userId)}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error || "Failed to delete user");
  }
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

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success("User deleted.");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete user.");
    },
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

/** One row from GET /team/admin/user-entries (matches models.TeamMember JSON). */
export interface AdminTeamMemberRow {
  id: number;
  role: string;
  team: string;
  academic_year: string;
}

async function fetchAdminUserTeamEntries(
  userId: string,
): Promise<AdminTeamMemberRow[]> {
  const res = await fetch(
    `${API_URL}/team/admin/user-entries?userId=${encodeURIComponent(userId)}`,
    { credentials: "include" },
  );
  if (!res.ok) {
    throw new Error("Failed to fetch team entries");
  }
  return res.json();
}

export function useAdminUserTeamEntries(userId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["admin-user-team-entries", userId],
    queryFn: () => fetchAdminUserTeamEntries(userId),
    enabled: Boolean(userId) && enabled,
  });
}

async function adminAddTeamEntry(input: {
  profileId: string;
  role: string;
  department: string;
  academicYear: string;
}) {
  const res = await fetch(`${API_URL}/team/admin/member`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      profileId: input.profileId,
      role: input.role,
      department: input.department,
      academicYear: input.academicYear,
    }),
  });
  if (!res.ok) throw new Error("Failed to add team entry");
  return res.json();
}

export function useAdminAddTeamEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminAddTeamEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-team-entries"] });
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      queryClient.invalidateQueries({ queryKey: ["team-years"] });
    },
  });
}

async function adminRemoveTeamEntry(entryId: number) {
  const res = await fetch(`${API_URL}/team/admin/member/${entryId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to remove team entry");
}

export function useAdminRemoveTeamEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminRemoveTeamEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-team-entries"] });
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      queryClient.invalidateQueries({ queryKey: ["team-years"] });
    },
  });
}

// Projects

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


// Companies

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
    enabled: !!id, 
  });
}



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

/// Jobs

export interface ContactDTO {
  name: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
}

export interface JobPostInput {
  title: string;
  description: string;
  salary: string;
  location: {
    place: string;
    tag: string;
  };
  jobType: string;
  companyId: string;
  startdate: string;
  enddate: string;
  appurl: string;
  contacts: ContactDTO[];
}

export interface SmallJobListing {
  id: string;
  title: string;
  company: string;
  companyId: string;
  salary: string;
  jobType: string;
  location: string;
  applyClickCount: number;
}


export interface FullJobListing {
  id: string;
  title: string;
  description: string;
  salary: string;
  location: string;
  jobType: string;
  company: string;
  startdate: string;
  enddate: string;
  appurl: string;
  contact: string;
  applyClickCount: number;
}

/**
 * Fire-and-forget: records a click on a job listing's Apply button/link.
 * Endpoint: POST /joblistings/click?id={id}
 */
export function trackJobApplyClick(id: string) {
  fetch(`${API_URL}/joblistings/click?id=${encodeURIComponent(id)}`, {
    method: "POST",
    keepalive: true,
  }).catch(() => {});
}

export function useJobs() {
  return useQuery<SmallJobListing[]>({
    queryKey: ["jobs"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/joblistings/all`);
      if (!res.ok) throw new Error("Failed to fetch jobs");
      const data = await res.json();
      return data || [];
    },
  });
}

/**
 * Fetches a single job for the detailed view
 * Endpoint: GET /joblistings/job?id={id}
 */
export function useJob(id: string) {
  return useQuery<FullJobListing>({
    queryKey: ["jobs", id],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/joblistings/job?id=${id}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("Job not found");
        throw new Error("Failed to fetch job details");
      }
      return res.json();
    },
    enabled: !!id,
  });
}

const formatJobPayload = (data: JobPostInput) => {
  const validContacts = data.contacts.filter(
    (c) => c.name || c.lastName || c.email,
  );

  return {
    title: data.title,
    description: data.description,
    salary: data.salary,
    jobType: data.jobType,
    appurl: data.appurl,
    company: data.companyId, 
    startdate: new Date(data.startdate).toISOString(),
    enddate: new Date(data.enddate).toISOString(),
    location: JSON.stringify(data.location),
    contact: JSON.stringify(validContacts),
  };
};


export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: JobPostInput) => {
      const payload = formatJobPayload(data);

      const response = await fetch(`${API_URL}/joblistings/admin/new`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to create job post");
      return response.json();
    },
    onSuccess: () => {
      toast.success("Job created successfully!");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (error: Error) => {
      console.error("Error creating job:", error);
      toast.error(error.message || "Failed to create job");
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: JobPostInput }) => {
      const payload = formatJobPayload(data);

      const response = await fetch(
        `${API_URL}/joblistings/admin/update?id=${id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Failed to update job post");
      return response.json();
    },
    onSuccess: (_, variables) => {
      toast.success("Job updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["jobs", variables.id] });
    },
    onError: (error: Error) => {
      console.error("Error updating job:", error);
      toast.error(error.message || "Failed to update job");
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(
        `${API_URL}/joblistings/admin/delete?id=${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to delete job post");
      return response.json();
    },
    onSuccess: () => {
      toast.success("Job deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (error: Error) => {
      console.error("Error deleting job:", error);
      toast.error(error.message || "Failed to delete job");
    },
  });
}