"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ChevronDown, Eye, Mail, Send, Settings } from "lucide-react";
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

const DEFAULT_TEAM_QUESTIONS_TEMPLATE =
  "Thanks for applying to KTH AI Society! To move forward, we need you to answer a few extra questions about the team(s) you applied to.\n\nIt only takes a few minutes.";

// Renders the invite by calling the backend, which builds it with the exact same
// email.RenderTeamQuestionsInvite used when actually sending — so this can never drift
// from the real email the way a hand-rolled client-side mockup could.
function TeamQuestionsPreviewDialog({ emailTemplate }: { emailTemplate: string }) {
  const preview = usePreviewTeamQuestionsTemplate();

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) {
          preview.mutate(emailTemplate || DEFAULT_TEAM_QUESTIONS_TEMPLATE);
        } else {
          preview.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" size="lg">
          <Eye className="h-4 w-4" />
          Preview email
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Team questions invite preview</DialogTitle>
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
            title="Team questions invite email preview"
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
  const [initialised, setInitialised] = useState(false);

  const savedEmailTemplate = template ? template.email_template || DEFAULT_TEAM_QUESTIONS_TEMPLATE : "";

  if (template && !initialised) {
    setEmailTemplate(savedEmailTemplate);
    setInitialised(true);
  }

  const isDirty = initialised && emailTemplate !== savedEmailTemplate;

  function handleSave() {
    updateTemplate.mutate(emailTemplate);
  }

  // Collapsing with unsaved edits discards them — reverting to the last
  // saved value here means there's never an invisible unsaved draft
  // lingering after you close this.
  function handleToggle() {
    if (open && isDirty) {
      setEmailTemplate(savedEmailTemplate);
    }
    setOpen((v) => !v);
  }

  return (
    <Card>
      <CardHeader className="cursor-pointer select-none" onClick={handleToggle}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="h-4 w-4" />
            Team questions invite
          </CardTitle>
          <ChevronDown
            className="h-4 w-4 text-muted-foreground transition-transform"
            style={{ transform: open ? "rotate(180deg)" : undefined }}
          />
        </div>
        {!open && (
          <CardDescription>
            The message sent to applicants when they&apos;re invited to answer team questions. Shared
            by all admins, click to view or edit.
            {template && !template.can_edit && " Only IT admins can edit it."}
          </CardDescription>
        )}
      </CardHeader>
      {open && (
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <>
              <CardDescription>
                This is sent to every applicant once they&apos;ve been screened. The form link is
                added automatically as a button below your message. Use{" "}
                <code className="rounded bg-muted px-1 text-xs">{"{{first_name}}"}</code> to
                address the candidate by name.
                {template?.updated_by_email && (
                  <> Last updated by {template.updated_by_email}.</>
                )}
              </CardDescription>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="tq-email-template">Message</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto py-0 text-xs"
                    onClick={() => setEmailTemplate(DEFAULT_TEAM_QUESTIONS_TEMPLATE)}
                    disabled={!template?.can_edit}
                  >
                    Reset to default message
                  </Button>
                </div>
                <Textarea
                  id="tq-email-template"
                  placeholder={DEFAULT_TEAM_QUESTIONS_TEMPLATE}
                  className="min-h-[180px] resize-y font-mono text-sm"
                  value={emailTemplate}
                  onChange={(e) => setEmailTemplate(e.target.value)}
                  disabled={!template?.can_edit}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <TeamQuestionsPreviewDialog emailTemplate={emailTemplate} />
                {template?.can_edit && (
                  <>
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
                  </>
                )}
              </div>
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
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={sendBulk.isPending || previewLoading || nothingToSend}>
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
    </div>
  );
}

export function TeamQuestionsAdminPanel({ currentAdminEmail }: { currentAdminEmail: string }) {
  const { data: applications = [], isLoading } = useAdminApplications({ year: 2026 });

  return (
    <section className="space-y-6">
      <TeamQuestionsSendBulkCard />
      <TeamQuestionsTemplatePanel />
      <TeamQuestionDefinitionsPanel />

      <Card>
        <CardHeader>
          <CardTitle>Applicants</CardTitle>
          <CardDescription>
            Resend the invite to stragglers, or review what an applicant submitted.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
              {!isLoading &&
                applications
                  .filter((application) => application.status !== "ineligible")
                  .map((application) => (
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
      </Card>
    </section>
  );
}
