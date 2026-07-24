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
  appendTrimmed(formData, "university", input.university);
  appendTrimmed(formData, "programme", input.programme);
  formData.append("graduationYear", String(input.graduationYear));
  appendTrimmed(formData, "linkedinUrl", input.linkedinUrl);
  input.additionalLinks.forEach((link) =>
    appendTrimmed(formData, "additionalLinks", link),
  );
  input.teams.forEach((team) => formData.append("teams", team));
  input.interests.forEach((interest) => formData.append("interests", interest));
  appendTrimmed(
    formData,
    "teamInterestReason",
    `Ranked selected team preferences: ${input.teams.join(", ")}`,
  );
  appendTrimmed(formData, "availability", input.availability);
  appendTrimmed(formData, "contribution", input.contribution);
  formData.append(
    "dataRetentionConsent",
    input.dataRetentionConsent ? "true" : "false",
  );
  formData.append("newsletterOptIn", input.newsletterOptIn ? "true" : "false");
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

async function deleteApplication(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/applications/admin/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;
    throw new Error(data?.error || "Failed to delete application");
  }
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

export function useDeleteApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteApplication,
    onSuccess: () => {
      toast.success("Application deleted.");
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete application.");
    },
  });
}

async function cancelInterview(id: string): Promise<GeneralApplication> {
  const response = await fetch(`${API_URL}/applications/admin/${id}/cancel-interview`, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error || "Failed to cancel interview");
  }
  return response.json();
}

async function markIneligible(id: string): Promise<GeneralApplication> {
  const response = await fetch(`${API_URL}/applications/admin/${id}/ineligible`, {
    method: "PATCH",
    credentials: "include",
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error || "Failed to mark as ineligible");
  }
  return response.json();
}

async function restoreApplication(id: string): Promise<GeneralApplication> {
  const response = await fetch(`${API_URL}/applications/admin/${id}/restore`, {
    method: "PATCH",
    credentials: "include",
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error || "Failed to restore application");
  }
  return response.json();
}

async function claimApplication(id: string): Promise<GeneralApplication> {
  const response = await fetch(`${API_URL}/applications/admin/${id}/claim`, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error || "Failed to claim application");
  }
  return response.json();
}

async function releaseApplication(id: string): Promise<GeneralApplication> {
  const response = await fetch(`${API_URL}/applications/admin/${id}/release`, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error || "Failed to release application");
  }
  return response.json();
}

async function sendInterviewInvite(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/applications/admin/${id}/send-invite`, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error || "Failed to send interview invite");
  }
}

async function fetchApplicationNotes(id: string): Promise<string> {
  const response = await fetch(`${API_URL}/applications/admin/${id}/notes`, {
    credentials: "include",
  });
  if (!response.ok) return "";
  const data = (await response.json()) as { note: string };
  return data.note;
}

async function updateApplicationNotes({ id, note }: { id: string; note: string }): Promise<string> {
  const response = await fetch(`${API_URL}/applications/admin/${id}/notes`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ note }),
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error || "Failed to save notes");
  }
  const data = (await response.json()) as { note: string };
  return data.note;
}

export type ApplicationSharedNote = {
  note: string;
  last_edited_email: string;
  updated_at: string | null;
};

async function fetchApplicationSharedNotes(id: string): Promise<ApplicationSharedNote> {
  const response = await fetch(`${API_URL}/applications/admin/${id}/notes/shared`, {
    credentials: "include",
  });
  if (!response.ok) return { note: "", last_edited_email: "", updated_at: null };
  return response.json();
}

async function updateApplicationSharedNotes({
  id,
  note,
}: {
  id: string;
  note: string;
}): Promise<ApplicationSharedNote> {
  const response = await fetch(`${API_URL}/applications/admin/${id}/notes/shared`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ note }),
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error || "Failed to save shared notes");
  }
  return response.json();
}

export type InterviewSettings = {
  booking_page_url: string;
  interview_email_template: string;
  /** The team this admin declared themselves head of, or "none" if advisor/no team, or "" if unset. */
  admin_team: string;
};

async function fetchInterviewSettings(): Promise<InterviewSettings> {
  const response = await fetch(`${API_URL}/profile/me/interview-settings`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch interview settings");
  return response.json();
}

async function updateInterviewSettings(settings: InterviewSettings): Promise<InterviewSettings> {
  const response = await fetch(`${API_URL}/profile/me/interview-settings`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error || "Failed to save interview settings");
  }
  return response.json();
}

export type InterviewInvitePreview = {
  subject: string;
  html: string;
};

/** Renders the interview invite email server-side, from the same code path used to send it. */
async function previewInterviewSettings(
  settings: Pick<InterviewSettings, "booking_page_url" | "interview_email_template">,
): Promise<InterviewInvitePreview> {
  const response = await fetch(`${API_URL}/profile/me/interview-settings/preview`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error || "Failed to render preview");
  }
  return response.json();
}

/** Patch a single application in every admin-applications cache entry. */
function patchApplicationInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  updated: GeneralApplication,
) {
  queryClient.setQueriesData<GeneralApplication[]>(
    { queryKey: ["admin-applications"] },
    (prev) => prev?.map((a) => (a.id === updated.id ? updated : a)),
  );
  void queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
}

export function useClaimApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: claimApplication,
    onSuccess: (updated) => {
      toast.success("Application claimed.");
      patchApplicationInCache(queryClient, updated);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to claim application.");
    },
  });
}

export function useReleaseApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: releaseApplication,
    onSuccess: (updated) => {
      toast.success("Application released.");
      patchApplicationInCache(queryClient, updated);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to release application.");
    },
  });
}

export function useCancelInterview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelInterview,
    onSuccess: (updated) => {
      toast.success("Interview cancelled.");
      patchApplicationInCache(queryClient, updated);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel interview.");
    },
  });
}

export function useMarkIneligible() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markIneligible,
    onSuccess: (updated) => {
      toast.success("Application marked as ineligible.");
      patchApplicationInCache(queryClient, updated);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to mark as ineligible.");
    },
  });
}

export function useRestoreApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restoreApplication,
    onSuccess: (updated) => {
      toast.success("Application restored to available.");
      patchApplicationInCache(queryClient, updated);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to restore application.");
    },
  });
}

export function useSendInterviewInvite() {
  return useMutation({
    mutationFn: sendInterviewInvite,
    onSuccess: () => {
      toast.success("Interview invite sent.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send interview invite.");
    },
  });
}

export function useApplicationNotes(id: string) {
  return useQuery({
    queryKey: ["application-notes", id],
    queryFn: () => fetchApplicationNotes(id),
    enabled: !!id,
  });
}

export function useUpdateApplicationNotes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateApplicationNotes,
    onSuccess: (_, variables) => {
      toast.success("Notes saved.");
      queryClient.setQueryData(["application-notes", variables.id], variables.note);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save notes.");
    },
  });
}

export function useApplicationSharedNotes(id: string) {
  return useQuery({
    queryKey: ["application-shared-notes", id],
    queryFn: () => fetchApplicationSharedNotes(id),
    enabled: !!id,
  });
}

export function useUpdateApplicationSharedNotes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateApplicationSharedNotes,
    onSuccess: (result, variables) => {
      toast.success("Shared notes saved.");
      queryClient.setQueryData(["application-shared-notes", variables.id], result);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save shared notes.");
    },
  });
}

export function useInterviewSettings() {
  return useQuery({
    queryKey: ["interview-settings"],
    queryFn: fetchInterviewSettings,
  });
}

export function useUpdateInterviewSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateInterviewSettings,
    onSuccess: (data) => {
      toast.success("Interview settings saved.");
      queryClient.setQueryData(["interview-settings"], data);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save interview settings.");
    },
  });
}

export function usePreviewInterviewSettings() {
  return useMutation({
    mutationFn: previewInterviewSettings,
    onError: (error: Error) => {
      toast.error(error.message || "Failed to render preview.");
    },
  });
}

export function getApplicationResumeUrl(id: string) {
  return `${API_URL}/applications/admin/${id}/resume`;
}

export async function downloadApplicationResume(
  application: Pick<GeneralApplication, "id" | "resume_file_name">,
) {
  try {
    const response = await fetch(getApplicationResumeUrl(application.id), {
      credentials: "include",
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      throw new Error(data?.error || "Failed to download resume");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = application.resume_file_name || "resume";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  } catch (error) {
    toast.error(
      error instanceof Error ? error.message : "Failed to download resume",
    );
  }
}
