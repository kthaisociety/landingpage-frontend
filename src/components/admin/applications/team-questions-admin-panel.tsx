"use client";

import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { ChevronDown, Eye, Mail, Search, Send, Settings } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  useAdminApplications,
  useApplicationTeamQuestions,
  usePreviewTeamQuestionsTemplate,
  useResendTeamQuestions,
  useSendBulkTeamQuestions,
  useSendBulkTeamQuestionsPreview,
  useTeamQuestionDefinitions,
  useTeamQuestionsTemplate,
  useUpdateTeamQuestionsTemplate,
} from "@/hooks/applications";
import {
  APPLICATION_TEAM_LABELS,
  type ApplicationTeam,
  type GeneralApplication,
} from "@/types/applications";
import { getStatusBadgeStyle } from "@/components/admin/applications/status-badge";
import { TeamQuestionDefinitionsPanel } from "@/components/admin/applications/team-question-definitions-panel";
import { TeamQuestionsDeliveryActivityCard } from "@/components/admin/applications/team-questions-delivery-events";

const DEFAULT_TEAM_QUESTIONS_TEMPLATE =
  "Thanks for applying to KTH AI Society! To move forward, we need you to answer a few extra questions about the team(s) you applied to.\n\nIt only takes a few minutes.";

const DEFAULT_TEAM_QUESTIONS_SUBJECT = "{{first_name}}'s application for {{teams}}";

const DEFAULT_TEAM_QUESTIONS_REMINDER_TEMPLATE =
  "Just a reminder — we still haven't received your answers to the team questions for your KTH AI Society application. Please complete them so we can move your application forward.\n\nYour previous link has expired; use the button below instead.";

const DEFAULT_TEAM_QUESTIONS_REMINDER_SUBJECT =
  "Reminder: {{first_name}}'s application for {{teams}}";

// Renders the invite/reminder by calling the backend, which builds it with the exact same
// email.RenderTeamQuestionsInvite / RenderTeamQuestionsReminder used when actually sending —
// so this can never drift from the real email the way a hand-rolled client-side mockup could.
function TeamQuestionsPreviewDialog({
  emailTemplate,
  emailSubject,
  kind,
  label,
}: {
  emailTemplate: string;
  emailSubject: string;
  kind: "invite" | "reminder";
  label: string;
}) {
  const preview = usePreviewTeamQuestionsTemplate();
  const fallbackTemplate =
    kind === "reminder" ? DEFAULT_TEAM_QUESTIONS_REMINDER_TEMPLATE : DEFAULT_TEAM_QUESTIONS_TEMPLATE;
  const fallbackSubject =
    kind === "reminder" ? DEFAULT_TEAM_QUESTIONS_REMINDER_SUBJECT : DEFAULT_TEAM_QUESTIONS_SUBJECT;

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) {
          preview.mutate({
            emailTemplate: emailTemplate || fallbackTemplate,
            emailSubject: emailSubject || fallbackSubject,
            kind,
          });
        } else {
          preview.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          <Eye className="h-4 w-4" />
          Preview {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{label} preview</DialogTitle>
          <DialogDescription>
            {preview.data
              ? `Subject: ${preview.data.subject}`
              : "Rendered server-side by the same code that sends the real email."}
          </DialogDescription>
        </DialogHeader>
        {preview.isPending && <Skeleton className="h-[500px] w-full" />}
        {preview.isError && (
          <p className="text-sm text-destructive">Couldn&apos;t render the preview. Try again.</p>
        )}
        {preview.data && (
          <iframe
            title={`${label} email preview`}
            srcDoc={preview.data.html}
            sandbox=""
            className="h-[500px] w-full rounded-md border bg-white"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function TeamQuestionsTemplatePanel() {
  const { data: template, isLoading } = useTeamQuestionsTemplate();
  const updateTemplate = useUpdateTeamQuestionsTemplate();
  const [open, setOpen] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [reminderEmailTemplate, setReminderEmailTemplate] = useState("");
  const [reminderEmailSubject, setReminderEmailSubject] = useState("");
  const [initialised, setInitialised] = useState(false);

  const savedEmailTemplate = template ? template.email_template || DEFAULT_TEAM_QUESTIONS_TEMPLATE : "";
  const savedEmailSubject = template ? template.email_subject || DEFAULT_TEAM_QUESTIONS_SUBJECT : "";
  const savedReminderEmailTemplate = template
    ? template.reminder_email_template || DEFAULT_TEAM_QUESTIONS_REMINDER_TEMPLATE
    : "";
  const savedReminderEmailSubject = template
    ? template.reminder_email_subject || DEFAULT_TEAM_QUESTIONS_REMINDER_SUBJECT
    : "";

  if (template && !initialised) {
    setEmailTemplate(savedEmailTemplate);
    setEmailSubject(savedEmailSubject);
    setReminderEmailTemplate(savedReminderEmailTemplate);
    setReminderEmailSubject(savedReminderEmailSubject);
    setInitialised(true);
  }

  const isDirty =
    initialised &&
    (emailTemplate !== savedEmailTemplate ||
      emailSubject !== savedEmailSubject ||
      reminderEmailTemplate !== savedReminderEmailTemplate ||
      reminderEmailSubject !== savedReminderEmailSubject);

  // Deadline overrides live on this same backend settings row but are edited
  // from the Settings tab's Deadlines card (recruitment-period-panel.tsx),
  // alongside the general application deadline — pass the currently-saved
  // values through unchanged here rather than clearing them.
  function handleSave() {
    updateTemplate.mutate({
      emailTemplate,
      emailSubject,
      reminderEmailTemplate,
      reminderEmailSubject,
      finalCallStartOverride: template?.final_call_start_override ?? null,
      submissionCutoffOverride: template?.submission_cutoff_override ?? null,
    });
  }

  // Collapsing with unsaved edits discards them — reverting to the last
  // saved value here means there's never an invisible unsaved draft
  // lingering after you close this.
  function handleToggle() {
    if (open && isDirty) {
      setEmailTemplate(savedEmailTemplate);
      setEmailSubject(savedEmailSubject);
      setReminderEmailTemplate(savedReminderEmailTemplate);
      setReminderEmailSubject(savedReminderEmailSubject);
    }
    setOpen((v) => !v);
  }

  return (
    <Card>
      <CardHeader className="cursor-pointer select-none" onClick={handleToggle}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="h-4 w-4" />
            Team questions emails
          </CardTitle>
          <ChevronDown
            className="h-4 w-4 text-muted-foreground transition-transform"
            style={{ transform: open ? "rotate(180deg)" : undefined }}
          />
        </div>
        {!open && (
          <CardDescription>
            The invite sent when applicants are asked to answer team questions, and the automatic
            reminder sent 7 days later if they haven&apos;t. Shared by all admins, click to view or
            edit.
            {template && !template.can_edit && " Only IT admins can edit it."} Deadlines are set
            under the Settings tab.
          </CardDescription>
        )}
      </CardHeader>
      {open && (
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="tq-email-template">Invite message</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto py-0 text-xs"
                    onClick={() => {
                      setEmailTemplate(DEFAULT_TEAM_QUESTIONS_TEMPLATE);
                      setEmailSubject(DEFAULT_TEAM_QUESTIONS_SUBJECT);
                    }}
                    disabled={!template?.can_edit}
                  >
                    Reset to default message
                  </Button>
                </div>
                <CardDescription>
                  Sent to every applicant once they&apos;ve been screened. The form link is added
                  automatically as a button below your message. Use{" "}
                  <code className="rounded bg-muted px-1 text-xs">{"{{first_name}}"}</code> to
                  address the candidate by name, and{" "}
                  <code className="rounded bg-muted px-1 text-xs">{"{{teams}}"}</code> in the
                  subject for the team(s) they applied to.
                </CardDescription>
                <div className="space-y-1">
                  <Label htmlFor="tq-email-subject" className="text-xs text-muted-foreground">
                    Subject
                  </Label>
                  <Input
                    id="tq-email-subject"
                    placeholder={DEFAULT_TEAM_QUESTIONS_SUBJECT}
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    disabled={!template?.can_edit}
                  />
                </div>
                <Textarea
                  id="tq-email-template"
                  placeholder={DEFAULT_TEAM_QUESTIONS_TEMPLATE}
                  className="min-h-[140px] resize-y font-mono text-sm"
                  value={emailTemplate}
                  onChange={(e) => setEmailTemplate(e.target.value)}
                  disabled={!template?.can_edit}
                />
                <TeamQuestionsPreviewDialog
                  emailTemplate={emailTemplate}
                  emailSubject={emailSubject}
                  kind="invite"
                  label="invite"
                />
              </div>

              <div className="space-y-2 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="tq-reminder-template">Reminder message</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto py-0 text-xs"
                    onClick={() => {
                      setReminderEmailTemplate(DEFAULT_TEAM_QUESTIONS_REMINDER_TEMPLATE);
                      setReminderEmailSubject(DEFAULT_TEAM_QUESTIONS_REMINDER_SUBJECT);
                    }}
                    disabled={!template?.can_edit}
                  >
                    Reset to default message
                  </Button>
                </div>
                <CardDescription>
                  Sent automatically, once, to anyone who hasn&apos;t submitted 7 days after their
                  invite. Also gets a fresh form link — the original one still isn&apos;t reused.
                </CardDescription>
                <div className="space-y-1">
                  <Label htmlFor="tq-reminder-subject" className="text-xs text-muted-foreground">
                    Subject
                  </Label>
                  <Input
                    id="tq-reminder-subject"
                    placeholder={DEFAULT_TEAM_QUESTIONS_REMINDER_SUBJECT}
                    value={reminderEmailSubject}
                    onChange={(e) => setReminderEmailSubject(e.target.value)}
                    disabled={!template?.can_edit}
                  />
                </div>
                <Textarea
                  id="tq-reminder-template"
                  placeholder={DEFAULT_TEAM_QUESTIONS_REMINDER_TEMPLATE}
                  className="min-h-[140px] resize-y font-mono text-sm"
                  value={reminderEmailTemplate}
                  onChange={(e) => setReminderEmailTemplate(e.target.value)}
                  disabled={!template?.can_edit}
                />
                <TeamQuestionsPreviewDialog
                  emailTemplate={reminderEmailTemplate}
                  emailSubject={reminderEmailSubject}
                  kind="reminder"
                  label="reminder"
                />
              </div>

              {template?.updated_by_email && (
                <CardDescription>Last updated by {template.updated_by_email}.</CardDescription>
              )}

              {template?.can_edit && (
                <div className="flex flex-wrap items-center gap-2 border-t pt-4">
                  <Button
                    variant="outline"
                    disabled={!isDirty || updateTemplate.isPending}
                    onClick={handleSave}
                  >
                    {updateTemplate.isPending ? "Saving…" : isDirty ? "Save changes" : "Saved"}
                  </Button>
                  {isDirty && !updateTemplate.isPending && (
                    <span className="text-xs text-muted-foreground">
                      Unsaved - collapsing this without saving will discard your changes.
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}

function TeamQuestionsSendBulkCard() {
  const sendBulk = useSendBulkTeamQuestions();
  const { data: preview, isLoading: previewLoading } = useSendBulkTeamQuestionsPreview();
  const count = preview?.count ?? 0;
  const nothingToSend = !previewLoading && count === 0;
  // Absent while the preview is still loading — default to blocked rather
  // than flashing an enabled button that a moment later turns out gated.
  const canSend = preview?.can_send ?? false;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Mail className="h-4 w-4" />
          Send team questions invites
        </CardTitle>
        <CardDescription>
          Emails every pending applicant who hasn&apos;t been sent this invite yet. Applicants
          who already have an invite (sent or submitted) are untouched. Use Resend for those.
          {preview?.next_send_at && (
            <>
              {" "}Next emails will be sent at{" "}
              {format(new Date(preview.next_send_at), "EEE, MMM d 'at' HH:mm")}.
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={sendBulk.isPending || previewLoading || nothingToSend || !canSend}>
              <Send className="h-4 w-4" />
              {previewLoading
                ? "Send to all pending applicants"
                : `Send to all pending applicants (${count})`}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Send team questions invites?</AlertDialogTitle>
              <AlertDialogDescription>
                This will email {count} pending applicant{count === 1 ? "" : "s"} who
                {count === 1 ? " hasn't" : " haven't"} received this invite yet. This cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => sendBulk.mutate()}>
                Send invites
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {!previewLoading && !canSend && (
          <p className="text-xs text-muted-foreground">
            Only the head of IT can send this. Ask them, or wait for the automatic send.
          </p>
        )}
        {nothingToSend && (
          <p className="text-xs text-muted-foreground">
            There are no pending applicants waiting on this invite right now.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function ApplicantName(application: GeneralApplication) {
  return `${application.first_name} ${application.last_name}`;
}

function SubmissionDialog({ application }: { application: GeneralApplication }) {
  const [open, setOpen] = useState(false);
  const { data: submission, isLoading } = useApplicationTeamQuestions(application.id, open);
  const { data: definitions } = useTeamQuestionDefinitions();

  function questionText(team: string, questionId: string): string {
    const questions = definitions?.[team as ApplicationTeam]?.questions ?? [];
    return questions.find((question) => question.id === questionId)?.text ?? questionId;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{ApplicantName(application)}&apos;s team questions</DialogTitle>
          <DialogDescription>{application.email}</DialogDescription>
        </DialogHeader>
        {isLoading && <Skeleton className="h-40 w-full" />}
        {submission && !submission.submitted && (
          <p className="text-sm text-muted-foreground">Not submitted yet.</p>
        )}
        {submission?.submitted && (
          <div className="max-h-[60vh] space-y-4 overflow-y-auto">
            {submission.withdrawn_teams.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Withdrew from: {submission.withdrawn_teams.join(", ")}
              </p>
            )}
            {Object.entries(submission.answers).map(([team, answers]) => (
              <div key={team} className="space-y-2">
                <p className="font-medium">{APPLICATION_TEAM_LABELS[team as keyof typeof APPLICATION_TEAM_LABELS] ?? team}</p>
                {Object.entries(answers).map(([questionId, answer]) => (
                  <div key={questionId} className="rounded-md border p-2 text-sm">
                    <p className="text-xs text-muted-foreground">
                      {questionText(team, questionId)}
                    </p>
                    <p className="whitespace-pre-wrap">{answer}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Labeled "Send" the first time (no prior team_questions_invite_sent_at) and
// "Resend" after that — otherwise every never-invited pending applicant would
// misleadingly show a "Resend" button for an invite they never received.
function TeamQuestionsInviteButton({ application }: { application: GeneralApplication }) {
  const resend = useResendTeamQuestions();
  const alreadySent = Boolean(application.team_questions_invite_sent_at);

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant={alreadySent ? "outline" : "default"}
        size="sm"
        disabled={resend.isPending}
        onClick={() => resend.mutate(application.id)}
      >
        <Mail className="h-4 w-4" />
        {alreadySent ? "Resend" : "Send"}
      </Button>
      {alreadySent && application.team_questions_invite_sent_at && (
        <span className="text-xs text-muted-foreground">
          Sent {formatDistanceToNow(new Date(application.team_questions_invite_sent_at))} ago
        </span>
      )}
      {application.team_questions_reminder_sent_at && (
        <span className="text-xs text-muted-foreground">
          Reminded {formatDistanceToNow(new Date(application.team_questions_reminder_sent_at))} ago
        </span>
      )}
      {application.team_questions_final_call_sent_at && (
        <span className="text-xs text-muted-foreground">
          Final call sent {formatDistanceToNow(new Date(application.team_questions_final_call_sent_at))} ago
        </span>
      )}
    </div>
  );
}

function matchesApplicantSearch(application: GeneralApplication, query: string) {
  const haystack = `${ApplicantName(application)} ${application.email}`.toLowerCase();
  return haystack.includes(query.trim().toLowerCase());
}

function ApplicantsCard({ currentAdminEmail }: { currentAdminEmail: string }) {
  const { data: applications = [], isLoading } = useAdminApplications({ year: 2026 });
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const visibleApplications = applications.filter(
    (application) => application.status !== "ineligible",
  );
  const filteredApplications = search.trim()
    ? visibleApplications.filter((application) => matchesApplicantSearch(application, search))
    : visibleApplications;

  return (
    <Card>
      <CardHeader className="cursor-pointer select-none" onClick={() => setOpen((v) => !v)}>
        <div className="flex items-center justify-between">
          <CardTitle>Applicants</CardTitle>
          <ChevronDown
            className="h-4 w-4 text-muted-foreground transition-transform"
            style={{ transform: open ? "rotate(180deg)" : undefined }}
          />
        </div>
        {!open && (
          <CardDescription>
            {isLoading ? "Loading…" : `${visibleApplications.length} applicant${visibleApplications.length === 1 ? "" : "s"}`}
            . Click to search and manage &mdash; resend the invite to stragglers, or review what
            an applicant submitted.
          </CardDescription>
        )}
      </CardHeader>
      {open && (
        <CardContent className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Teams</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                ["a", "b", "c", "d", "e", "f"].map((key) => (
                  <TableRow key={key}>
                    <TableCell colSpan={4}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))}
              {!isLoading && filteredApplications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                    No applicants match &quot;{search}&quot;.
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                filteredApplications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div className="font-medium">{ApplicantName(application)}</div>
                      <div className="text-sm text-muted-foreground">{application.email}</div>
                    </TableCell>
                    <TableCell>{application.teams.join(", ")}</TableCell>
                    <TableCell>
                      {(() => {
                        const badge = getStatusBadgeStyle(application.status, {
                          interviewingByEmail: application.interviewing_by_email,
                          currentAdminEmail,
                          fastTracked: application.fast_tracked,
                        });
                        return (
                          <Badge variant={badge.variant} className={badge.className}>
                            {badge.label}
                          </Badge>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="flex justify-end gap-2">
                      {application.status === "pending" && (
                        <TeamQuestionsInviteButton application={application} />
                      )}
                      <SubmissionDialog application={application} />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      )}
    </Card>
  );
}

export function TeamQuestionsAdminPanel({ currentAdminEmail }: { currentAdminEmail: string }) {
  return (
    <section className="space-y-6">
      <TeamQuestionsSendBulkCard />
      <TeamQuestionsDeliveryActivityCard />
      <TeamQuestionsTemplatePanel />
      <TeamQuestionDefinitionsPanel />
      <ApplicantsCard currentAdminEmail={currentAdminEmail} />
    </section>
  );
}
