"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarClock, Eye } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  useAdminApplicationSettings,
  usePreviewRejectionEmail,
  useTeamQuestionsTemplate,
  useUpdateApplicationSettings,
  useUpdateTeamQuestionsTemplate,
} from "@/hooks/applications";
import { ApplicationClosed } from "@/components/applications/application-closed";

// Mirrors defaultClosedHeading/defaultClosedMessage in
// internal/handlers/general_application_handler.go — shown by "Reset to
// default" without waiting on a round trip.
const DEFAULT_CLOSED_HEADING = "Applications are now closed";
const DEFAULT_CLOSED_MESSAGE =
  "Thank you to everyone who applied to KTH AI Society this year. We're reviewing every application and will follow up by email with next steps by September 22, 2026. In the meantime, join our Luma community to stay in the loop on events and future opportunities.";

// Mirrors defaultRejectionIntroText in general_application_handler.go.
const DEFAULT_REJECTION_INTRO_TEXT =
  "Thank you for applying to KTH AI Society for {{year}}.\n\n" +
  "After careful consideration, we're not able to offer you a place this time. There are a variety of reasons this can happen — you may not have been eligible for the team(s) you applied to, or you may simply not have made our top candidate list this year, when we had far more strong applicants than spots. Either way, this isn't a reflection of your potential.\n\n" +
  "We recruit new members throughout the year, so we'd love to keep you around: follow KTH AI Society on Luma, come to our events, and stay connected with our members — we'd be glad to see you apply again.";

// Renders by calling the backend, which builds the rejection email the exact
// same way a real send does — so this can never drift from the real email
// the way a hand-rolled client-side mockup could. Mirrors
// OnboardingEmailPreviewDialog's approach in onboarding-email-settings.tsx.
function RejectionEmailPreviewDialog({ introText }: { introText: string }) {
  const preview = usePreviewRejectionEmail();

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) {
          preview.mutate(introText);
        } else {
          preview.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Eye className="h-4 w-4" />
          Preview rejection email
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Rejection email</DialogTitle>
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
            title="Rejection email preview"
            srcDoc={preview.data.html}
            sandbox=""
            className="h-[500px] w-full rounded-md border bg-white"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

/** "2026-09-06T23:59", in the viewer's own local time zone, for a datetime-local input. */
function toDatetimeLocalValue(iso: string) {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function RecruitmentPeriodPanel() {
  const { data: settings, isLoading } = useAdminApplicationSettings();
  const updateSettings = useUpdateApplicationSettings();
  const { data: template, isLoading: templateLoading } = useTeamQuestionsTemplate();
  const updateTemplate = useUpdateTeamQuestionsTemplate();

  const [opensAtDraft, setOpensAtDraft] = useState("");
  const [deadlineDraft, setDeadlineDraft] = useState("");
  const [headingDraft, setHeadingDraft] = useState("");
  const [messageDraft, setMessageDraft] = useState("");
  const [rejectionIntroDraft, setRejectionIntroDraft] = useState("");
  const [initialised, setInitialised] = useState(false);

  const [tqFinalCallStartDraft, setTqFinalCallStartDraft] = useState("");
  const [tqSubmissionCutoffDraft, setTqSubmissionCutoffDraft] = useState("");
  const [tqInitialised, setTqInitialised] = useState(false);

  const savedOpensAt = settings?.recruitment_opens_at ? toDatetimeLocalValue(settings.recruitment_opens_at) : "";
  const savedDeadline = settings ? toDatetimeLocalValue(settings.submission_deadline) : "";
  const savedHeading = settings?.closed_heading ?? "";
  const savedMessage = settings?.closed_message ?? "";
  const savedRejectionIntro = settings?.rejection_intro_text ?? "";

  if (settings && !initialised) {
    setOpensAtDraft(savedOpensAt);
    setDeadlineDraft(savedDeadline);
    setHeadingDraft(savedHeading);
    setMessageDraft(savedMessage);
    setRejectionIntroDraft(savedRejectionIntro);
    setInitialised(true);
  }

  const savedTqFinalCallStart = template?.final_call_start_override
    ? toDatetimeLocalValue(template.final_call_start_override)
    : "";
  const savedTqSubmissionCutoff = template?.submission_cutoff_override
    ? toDatetimeLocalValue(template.submission_cutoff_override)
    : "";

  if (template && !tqInitialised) {
    setTqFinalCallStartDraft(savedTqFinalCallStart);
    setTqSubmissionCutoffDraft(savedTqSubmissionCutoff);
    setTqInitialised(true);
  }

  const isDirty =
    initialised &&
    (opensAtDraft !== savedOpensAt ||
      deadlineDraft !== savedDeadline ||
      headingDraft !== savedHeading ||
      messageDraft !== savedMessage ||
      rejectionIntroDraft !== savedRejectionIntro);
  const isTqDirty =
    tqInitialised &&
    (tqFinalCallStartDraft !== savedTqFinalCallStart ||
      tqSubmissionCutoffDraft !== savedTqSubmissionCutoff);

  function handleSave() {
    if (isDirty && deadlineDraft) {
      updateSettings.mutate({
        recruitmentOpensAtIso: opensAtDraft ? new Date(opensAtDraft).toISOString() : null,
        submissionDeadlineIso: new Date(deadlineDraft).toISOString(),
        closedHeading: headingDraft,
        closedMessage: messageDraft,
        rejectionIntroText: rejectionIntroDraft,
      });
    }
    if (isTqDirty) {
      // Omits the four email-template fields entirely (a partial update)
      // rather than sending the currently-fetched template through, so this
      // can never revert an email edit saved from the Team Questions tab in
      // the meantime.
      updateTemplate.mutate({
        finalCallStartOverride: tqFinalCallStartDraft ? new Date(tqFinalCallStartDraft).toISOString() : null,
        submissionCutoffOverride: tqSubmissionCutoffDraft
          ? new Date(tqSubmissionCutoffDraft).toISOString()
          : null,
      });
    }
  }

  const saving = updateSettings.isPending || updateTemplate.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarClock className="h-4 w-4" />
          Deadlines
          {settings && (
            <Badge variant={settings.is_recruitment_open ? "default" : "outline"} className="ml-1">
              Recruitment {settings.is_recruitment_open ? "open" : "closed"}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          When recruitment opens and closes, when Team Questions final calls go out and close
          entirely, and what applicants see at /apply once the application deadline passes. All
          enforced server-side too &mdash; no deploy needed to change any of this.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full max-w-xs" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="recruitment-opens">Recruitment opens at (your local time)</Label>
                {opensAtDraft && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto py-0 text-xs"
                    onClick={() => setOpensAtDraft("")}
                  >
                    Clear
                  </Button>
                )}
              </div>
              <Input
                id="recruitment-opens"
                type="datetime-local"
                className="max-w-xs"
                value={opensAtDraft}
                onChange={(e) => setOpensAtDraft(e.target.value)}
              />
              <CardDescription>
                Once this passes, the Apply buttons on the landing page appear. Leave blank to show
                them right away (as long as before the close date below).{" "}
                {settings?.recruitment_opens_at &&
                  `Currently ${format(new Date(settings.recruitment_opens_at), "EEEE, MMMM d 'at' HH:mm")}.`}
              </CardDescription>
            </div>

            <div className="space-y-2 border-t pt-6">
              <Label htmlFor="recruitment-deadline">Applications close at (your local time)</Label>
              <Input
                id="recruitment-deadline"
                type="datetime-local"
                className="max-w-xs"
                value={deadlineDraft}
                onChange={(e) => setDeadlineDraft(e.target.value)}
              />
              {settings && (
                <CardDescription>
                  Currently {format(new Date(settings.submission_deadline), "EEEE, MMMM d 'at' HH:mm")}.{" "}
                  {settings.updated_by_email
                    ? `Last updated by ${settings.updated_by_email}.`
                    : "Not yet customised — this is the default."}
                </CardDescription>
              )}
            </div>

            <div className="space-y-3 border-t pt-6">
              <Label>Team questions</Label>
              <CardDescription>
                When automatic final-call emails start going out, and when Team Questions closes
                entirely &mdash; after that, every link is invalidated and the form shows a closed
                message instead. Leave blank to use the built-in default.
                {template && !template.can_edit && " Only IT admins can edit these."}
              </CardDescription>
              {templateLoading ? (
                <Skeleton className="h-10 w-full max-w-md" />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 sm:max-w-md">
                  <div className="space-y-1">
                    <Label htmlFor="tq-final-call-start" className="text-xs text-muted-foreground">
                      Final call starts
                      {!tqFinalCallStartDraft && template && (
                        <> (default: {format(new Date(template.final_call_start), "MMM d, HH:mm")})</>
                      )}
                    </Label>
                    <Input
                      id="tq-final-call-start"
                      type="datetime-local"
                      value={tqFinalCallStartDraft}
                      onChange={(e) => setTqFinalCallStartDraft(e.target.value)}
                      disabled={!template?.can_edit}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="tq-submission-cutoff" className="text-xs text-muted-foreground">
                      Closes entirely
                      {!tqSubmissionCutoffDraft && template && (
                        <> (default: {format(new Date(template.submission_cutoff), "MMM d, HH:mm")})</>
                      )}
                    </Label>
                    <Input
                      id="tq-submission-cutoff"
                      type="datetime-local"
                      value={tqSubmissionCutoffDraft}
                      onChange={(e) => setTqSubmissionCutoffDraft(e.target.value)}
                      disabled={!template?.can_edit}
                    />
                  </div>
                </div>
              )}
              {(tqFinalCallStartDraft || tqSubmissionCutoffDraft) && template?.can_edit && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto py-0 text-xs"
                  onClick={() => {
                    setTqFinalCallStartDraft("");
                    setTqSubmissionCutoffDraft("");
                  }}
                >
                  Reset to defaults
                </Button>
              )}
            </div>

            <div className="space-y-4 border-t pt-6">
              <div className="flex items-center justify-between">
                <Label>Closed page copy</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto py-0 text-xs"
                  onClick={() => {
                    setHeadingDraft(DEFAULT_CLOSED_HEADING);
                    setMessageDraft(DEFAULT_CLOSED_MESSAGE);
                  }}
                >
                  Reset to default
                </Button>
              </div>

              <div className="space-y-1">
                <Label htmlFor="closed-heading" className="text-xs text-muted-foreground">
                  Heading
                </Label>
                <Input
                  id="closed-heading"
                  placeholder={DEFAULT_CLOSED_HEADING}
                  value={headingDraft}
                  onChange={(e) => setHeadingDraft(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="closed-message" className="text-xs text-muted-foreground">
                  Message
                </Label>
                <Textarea
                  id="closed-message"
                  placeholder={DEFAULT_CLOSED_MESSAGE}
                  className="min-h-28 resize-y"
                  value={messageDraft}
                  onChange={(e) => setMessageDraft(e.target.value)}
                />
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button type="button" size="sm" variant="outline">
                    <Eye className="h-4 w-4" />
                    Preview closed page
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Closed page preview</DialogTitle>
                    <DialogDescription>
                      What applicants see at /apply once the deadline passes
                      &mdash; the same component, live with your unsaved
                      edits.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="max-h-[70vh] overflow-y-auto rounded-md border">
                    <ApplicationClosed
                      fullScreen={false}
                      heading={headingDraft || DEFAULT_CLOSED_HEADING}
                      message={messageDraft || DEFAULT_CLOSED_MESSAGE}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4 border-t pt-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="rejection-intro">Rejection email</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto py-0 text-xs"
                  onClick={() => setRejectionIntroDraft(DEFAULT_REJECTION_INTRO_TEXT)}
                >
                  Reset to default
                </Button>
              </div>
              <CardDescription>
                Sent to every applicant who wasn&apos;t accepted — either one at a time when an
                admin rejects them during finalize recruitment, or in bulk once the phase closes
                (see the Finalize recruitment panel). Use{" "}
                <code className="rounded bg-muted px-1 text-xs">{"{{year}}"}</code> for the
                recruitment year.
              </CardDescription>
              <Textarea
                id="rejection-intro"
                placeholder={DEFAULT_REJECTION_INTRO_TEXT}
                className="min-h-40 resize-y"
                value={rejectionIntroDraft}
                onChange={(e) => setRejectionIntroDraft(e.target.value)}
              />
              <RejectionEmailPreviewDialog introText={rejectionIntroDraft} />
            </div>

            <div className="flex items-center gap-2 border-t pt-4">
              <Button disabled={(!isDirty && !isTqDirty) || saving} onClick={handleSave}>
                {saving ? "Saving…" : isDirty || isTqDirty ? "Save changes" : "Saved"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
