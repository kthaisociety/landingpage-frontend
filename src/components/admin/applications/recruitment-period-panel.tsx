"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarClock, Eye } from "lucide-react";
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

  const [deadlineDraft, setDeadlineDraft] = useState("");
  const [headingDraft, setHeadingDraft] = useState("");
  const [messageDraft, setMessageDraft] = useState("");
  const [initialised, setInitialised] = useState(false);

  const [tqFinalCallStartDraft, setTqFinalCallStartDraft] = useState("");
  const [tqSubmissionCutoffDraft, setTqSubmissionCutoffDraft] = useState("");
  const [tqInitialised, setTqInitialised] = useState(false);

  const savedDeadline = settings ? toDatetimeLocalValue(settings.submission_deadline) : "";
  const savedHeading = settings?.closed_heading ?? "";
  const savedMessage = settings?.closed_message ?? "";

  if (settings && !initialised) {
    setDeadlineDraft(savedDeadline);
    setHeadingDraft(savedHeading);
    setMessageDraft(savedMessage);
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
    (deadlineDraft !== savedDeadline ||
      headingDraft !== savedHeading ||
      messageDraft !== savedMessage);
  const isTqDirty =
    tqInitialised &&
    (tqFinalCallStartDraft !== savedTqFinalCallStart ||
      tqSubmissionCutoffDraft !== savedTqSubmissionCutoff);

  function handleSave() {
    if (isDirty && deadlineDraft) {
      updateSettings.mutate({
        submissionDeadlineIso: new Date(deadlineDraft).toISOString(),
        closedHeading: headingDraft,
        closedMessage: messageDraft,
      });
    }
    if (isTqDirty && template) {
      updateTemplate.mutate({
        emailTemplate: template.email_template,
        emailSubject: template.email_subject,
        reminderEmailTemplate: template.reminder_email_template,
        reminderEmailSubject: template.reminder_email_subject,
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
        </CardTitle>
        <CardDescription>
          When applications close, when Team Questions final calls go out and close entirely, and
          what applicants see at /apply once the application deadline passes. All enforced
          server-side too &mdash; no deploy needed to change any of this.
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
