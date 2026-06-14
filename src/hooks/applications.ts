import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { API_URL } from "@/config";
import type {
  AdminApplicationsFilters,
  ApplicationStatus,
  CreateGeneralApplicationInput,
  CreateGeneralApplicationResponse,
  GeneralApplication,
} from "@/types/applications";

function appendTrimmed(formData: FormData, key: string, value: string) {
  formData.append(key, value.trim());
}

async function submitGeneralApplication(
  input: CreateGeneralApplicationInput,
): Promise<CreateGeneralApplicationResponse> {
  const formData = new FormData();
  appendTrimmed(formData, "firstName", input.firstName);
  appendTrimmed(formData, "lastName", input.lastName);
  appendTrimmed(formData, "email", input.email);
  appendTrimmed(formData, "gender", input.gender);
  appendTrimmed(formData, "programme", input.programme);
  formData.append("graduationYear", String(input.graduationYear));
  appendTrimmed(formData, "linkedinUrl", input.linkedinUrl);
  input.additionalLinks.forEach((link) =>
    appendTrimmed(formData, "additionalLinks", link),
  );
  input.teams.forEach((team) => formData.append("teams", team));
  appendTrimmed(formData, "teamInterestReason", input.teamInterestReason);
  appendTrimmed(formData, "availability", input.availability);
  appendTrimmed(formData, "contribution", input.contribution);
  formData.append(
    "dataRetentionConsent",
    input.dataRetentionConsent ? "true" : "false",
  );
  formData.append("resume", input.resume);

  const response = await fetch(`${API_URL}/applications/general`, {
    method: "POST",
    body: formData,
  });

  const data = (await response.json().catch(() => null)) as
    | { error?: string }
    | CreateGeneralApplicationResponse
    | null;

  if (!response.ok) {
    const message =
      data && "error" in data && data.error
        ? data.error
        : "Failed to submit application";
    const error = new Error(message);
    error.name = response.status === 409 ? "DuplicateApplicationError" : "Error";
    throw error;
  }

  return data as CreateGeneralApplicationResponse;
}

function buildAdminApplicationsUrl(filters: AdminApplicationsFilters) {
  const params = new URLSearchParams();
  params.set("year", String(filters.year ?? 2026));
  if (filters.status && filters.status !== "all") {
    params.set("status", filters.status);
  }
  if (filters.team && filters.team !== "all") {
    params.set("team", filters.team);
  }
  if (filters.q?.trim()) {
    params.set("q", filters.q.trim());
  }
  return `${API_URL}/applications/admin?${params.toString()}`;
}

async function fetchAdminApplications(
  filters: AdminApplicationsFilters,
): Promise<GeneralApplication[]> {
  const response = await fetch(buildAdminApplicationsUrl(filters), {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch applications");
  }
  return response.json();
}

async function updateApplicationStatus({
  id,
  status,
}: {
  id: string;
  status: ApplicationStatus;
}): Promise<GeneralApplication> {
  const response = await fetch(`${API_URL}/applications/admin/${id}/status`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;
    throw new Error(data?.error || "Failed to update application status");
  }

  return response.json();
}

export function useSubmitGeneralApplication() {
  return useMutation({
    mutationFn: submitGeneralApplication,
  });
}

export function useAdminApplications(filters: AdminApplicationsFilters) {
  return useQuery({
    queryKey: ["admin-applications", filters],
    queryFn: () => fetchAdminApplications(filters),
  });
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateApplicationStatus,
    onSuccess: () => {
      toast.success("Application status updated.");
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update application status.");
    },
  });
}

export function getApplicationResumeUrl(id: string) {
  return `${API_URL}/applications/admin/${id}/resume`;
}
