import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { API_URL } from "@/config";
import type {
  AdminApplicationsFilters,
  ApplicationStatus,
  CreateGeneralApplicationInput,
  CreateGeneralApplicationResponse,
  GeneralApplication,
  TeamQuestion,
  TeamQuestionsByTeam,
  TeamQuestionsForm,
  TeamQuestionsSendBulkPreview,
  TeamQuestionsSendBulkResult,
  TeamQuestionsSubmission,
  TeamQuestionsSubmitInput,
  TeamQuestionsSubmitResponse,
  TeamQuestionsTemplate,
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

async function sendInterviewInvite(id: string): Promise<GeneralApplication> {
  const response = await fetch(`${API_URL}/applications/admin/${id}/send-invite`, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error || "Failed to send interview invite");
  }
  return response.json();
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

export type ApplicationSharedNoteEntry = {
  id: string;
  application_id: string;
  author_id: string;
  author_email: string;
  text: string;
  created_at: string;
  updated_at: string;
};

async function fetchApplicationSharedNotes(id: string): Promise<ApplicationSharedNoteEntry[]> {
  const response = await fetch(`${API_URL}/applications/admin/${id}/notes/shared`, {
    credentials: "include",
  });
  if (!response.ok) return [];
  const data = (await response.json()) as { entries: ApplicationSharedNoteEntry[] };
  return data.entries;
}

async function createApplicationSharedNote({
  id,
  text,
}: {
  id: string;
  text: string;
}): Promise<ApplicationSharedNoteEntry> {
  const response = await fetch(`${API_URL}/applications/admin/${id}/notes/shared`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error || "Failed to save shared note");
  }
  return response.json();
}

async function updateApplicationSharedNote({
  id,
  noteId,
  text,
}: {
  id: string;
  noteId: string;
  text: string;
}): Promise<ApplicationSharedNoteEntry> {
  const response = await fetch(`${API_URL}/applications/admin/${id}/notes/shared/${noteId}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error || "Failed to update shared note");
  }
  return response.json();
}

async function deleteApplicationSharedNote({
  id,
  noteId,
}: {
  id: string;
  noteId: string;
}): Promise<void> {
  const response = await fetch(`${API_URL}/applications/admin/${id}/notes/shared/${noteId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error || "Failed to delete shared note");
  }
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendInterviewInvite,
    onSuccess: (updated) => {
      toast.success("Interview invite sent.");
      patchApplicationInCache(queryClient, updated);
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

export function useCreateApplicationSharedNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createApplicationSharedNote,
    onSuccess: (result, variables) => {
      queryClient.setQueryData<ApplicationSharedNoteEntry[]>(
        ["application-shared-notes", variables.id],
        (old) => [...(old ?? []), result],
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save shared note.");
    },
  });
}

export function useUpdateApplicationSharedNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateApplicationSharedNote,
    onSuccess: (result, variables) => {
      queryClient.setQueryData<ApplicationSharedNoteEntry[]>(
        ["application-shared-notes", variables.id],
        (old) => (old ?? []).map((entry) => (entry.id === result.id ? result : entry)),
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update shared note.");
    },
  });
}

export function useDeleteApplicationSharedNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteApplicationSharedNote,
    onSuccess: (_, variables) => {
      queryClient.setQueryData<ApplicationSharedNoteEntry[]>(
        ["application-shared-notes", variables.id],
        (old) => (old ?? []).filter((entry) => entry.id !== variables.noteId),
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete shared note.");
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

async function fetchTeamQuestionsForm(token: string): Promise<TeamQuestionsForm> {
  const response = await fetch(`${API_URL}/applications/team-questions/${token}`);
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error || "This link is invalid or has expired.");
  }
  return response.json();
}

async function submitTeamQuestions({
  token,
  ...input
}: TeamQuestionsSubmitInput & { token: string }): Promise<TeamQuestionsSubmitResponse> {
  const response = await fetch(`${API_URL}/applications/team-questions/${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error || "Failed to submit team questions");
  }
  return response.json();
}

export function useTeamQuestionsForm(token: string) {
  return useQuery({
    queryKey: ["team-questions-form", token],
    queryFn: () => fetchTeamQuestionsForm(token),
    enabled: !!token,
    retry: false,
  });
}

export function useSubmitTeamQuestions() {
  return useMutation({
    mutationFn: submitTeamQuestions,
  });
}

async function fetchApplicationTeamQuestions(id: string): Promise<TeamQuestionsSubmission> {
  const response = await fetch(`${API_URL}/applications/admin/${id}/team-questions`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch team questions submission");
  }
  return response.json();
}

export function useApplicationTeamQuestions(id: string, enabled = true) {
  return useQuery({
    queryKey: ["application-team-questions", id],
    queryFn: () => fetchApplicationTeamQuestions(id),
    enabled: !!id && enabled,
  });
}

async function fetchSendBulkTeamQuestionsPreview(): Promise<TeamQuestionsSendBulkPreview> {
  const response = await fetch(`${API_URL}/applications/admin/team-questions/send-bulk/preview`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to check how many applicants would be emailed");
  }
  return response.json();
}

/** How many applicants the next bulk send would actually email — same query the send itself uses. */
export function useSendBulkTeamQuestionsPreview() {
  return useQuery({
    queryKey: ["team-questions-send-bulk-preview"],
    queryFn: fetchSendBulkTeamQuestionsPreview,
  });
}

async function sendBulkTeamQuestions(): Promise<TeamQuestionsSendBulkResult> {
  const response = await fetch(`${API_URL}/applications/admin/team-questions/send-bulk`, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error || "Failed to send team questions invites");
  }
  return response.json();
}

export function useSendBulkTeamQuestions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendBulkTeamQuestions,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      queryClient.invalidateQueries({ queryKey: ["team-questions-send-bulk-preview"] });
      toast.success(
        result.failed.length > 0
          ? `Sent ${result.sent} invites, ${result.failed.length} failed.`
          : `Sent ${result.sent} team questions invites.`,
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send team questions invites.");
    },
  });
}

async function resendTeamQuestions(id: string): Promise<GeneralApplication> {
  const response = await fetch(`${API_URL}/applications/admin/${id}/team-questions/resend`, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error || "Failed to resend team questions invite");
  }
  return response.json();
}

export function useResendTeamQuestions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resendTeamQuestions,
    onSuccess: (updated) => {
      toast.success("Team questions invite sent.");
      patchApplicationInCache(queryClient, updated);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to resend team questions invite.");
    },
  });
}

async function fetchTeamQuestionsTemplate(): Promise<TeamQuestionsTemplate> {
  const response = await fetch(`${API_URL}/applications/admin/team-questions/template`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch team questions template");
  return response.json();
}

async function updateTeamQuestionsTemplate(
  templates: {
    emailTemplate: string;
    emailSubject: string;
    reminderEmailTemplate: string;
    reminderEmailSubject: string;
  },
): Promise<TeamQuestionsTemplate> {
  const response = await fetch(`${API_URL}/applications/admin/team-questions/template`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email_template: templates.emailTemplate,
      email_subject: templates.emailSubject,
      reminder_email_template: templates.reminderEmailTemplate,
      reminder_email_subject: templates.reminderEmailSubject,
    }),
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error || "Failed to save team questions template");
  }
  return response.json();
}

export function useTeamQuestionsTemplate() {
  return useQuery({
    queryKey: ["team-questions-template"],
    queryFn: fetchTeamQuestionsTemplate,
  });
}

export function useUpdateTeamQuestionsTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTeamQuestionsTemplate,
    onSuccess: (data) => {
      toast.success("Team questions template saved.");
      queryClient.setQueryData(["team-questions-template"], data);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save team questions template.");
    },
  });
}

/** Renders the team questions invite or reminder email server-side, from the same code path used to send it. */
async function previewTeamQuestionsTemplate(
  args: { emailTemplate: string; emailSubject: string; kind?: "invite" | "reminder" },
): Promise<InterviewInvitePreview> {
  const response = await fetch(`${API_URL}/applications/admin/team-questions/template/preview`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email_template: args.emailTemplate,
      email_subject: args.emailSubject,
      kind: args.kind,
    }),
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error || "Failed to render preview");
  }
  return response.json();
}

export function usePreviewTeamQuestionsTemplate() {
  return useMutation({
    mutationFn: previewTeamQuestionsTemplate,
    onError: (error: Error) => {
      toast.error(error.message || "Failed to render preview.");
    },
  });
}

async function fetchTeamQuestionDefinitions(): Promise<TeamQuestionsByTeam> {
  const response = await fetch(`${API_URL}/applications/admin/team-questions/questions`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch team questions");
  const data = (await response.json()) as { teams: TeamQuestionsByTeam };
  return data.teams;
}

export function useTeamQuestionDefinitions() {
  return useQuery({
    queryKey: ["team-question-definitions"],
    queryFn: fetchTeamQuestionDefinitions,
  });
}

async function createTeamQuestion(input: {
  team: string;
  text: string;
  required: boolean;
}): Promise<TeamQuestion> {
  const response = await fetch(`${API_URL}/applications/admin/team-questions/questions`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error || "Failed to create question");
  }
  return response.json();
}

export function useCreateTeamQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTeamQuestion,
    onSuccess: () => {
      toast.success("Question added.");
      queryClient.invalidateQueries({ queryKey: ["team-question-definitions"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create question.");
    },
  });
}

async function updateTeamQuestion({
  id,
  text,
  required,
}: {
  id: string;
  text: string;
  required: boolean;
}): Promise<TeamQuestion> {
  const response = await fetch(`${API_URL}/applications/admin/team-questions/questions/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, required }),
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error || "Failed to save question");
  }
  return response.json();
}

export function useUpdateTeamQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTeamQuestion,
    onSuccess: () => {
      toast.success("Question saved.");
      queryClient.invalidateQueries({ queryKey: ["team-question-definitions"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save question.");
    },
  });
}

async function deleteTeamQuestion(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/applications/admin/team-questions/questions/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error || "Failed to delete question");
  }
}

export function useDeleteTeamQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTeamQuestion,
    onSuccess: () => {
      toast.success("Question deleted.");
      queryClient.invalidateQueries({ queryKey: ["team-question-definitions"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete question.");
    },
  });
}

async function reorderTeamQuestions({
  team,
  orderedIds,
}: {
  team: string;
  orderedIds: string[];
}): Promise<void> {
  const response = await fetch(`${API_URL}/applications/admin/team-questions/questions/reorder`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ team, ordered_ids: orderedIds }),
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error || "Failed to reorder questions");
  }
}

export function useReorderTeamQuestions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reorderTeamQuestions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-question-definitions"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reorder questions.");
    },
  });
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
