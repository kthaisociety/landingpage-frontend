"use client";

import { useState } from "react";
import { ChevronDown, Eye, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  useOnboardingEmailSettings,
  useUpdateOnboardingEmailSettings,
  usePreviewOnboardingEmailSettings,
  type OnboardingEmailKind,
  type OnboardingEmailSettings,
} from "@/hooks/admin";

const DEFAULT_START_INTRO =
  "Congratulations on being accepted to KTH AI Society! You've been placed on the {{team}} team.";
const DEFAULT_CONFIRM_INTRO =
  "Please confirm this is your KTH email address to continue setting up your KTH AI Society account.";
const DEFAULT_MATTERMOST_INTRO =
  "You've been invited to the KTH AI Society Mattermost workspace — check your new @kthais.com inbox for an invite link to get started.";

// Renders by calling the backend, which builds it the exact same way the
// real email is built — so this can never drift from the real email the
// way a hand-rolled client-side mockup could.
function OnboardingEmailPreviewDialog({
  kind,
  title,
  introText,
}: {
  kind: OnboardingEmailKind;
  title: string;
  introText: string;
}) {
  const preview = usePreviewOnboardingEmailSettings();

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) {
          preview.mutate({ kind, introText });
        } else {
          preview.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Eye className="h-4 w-4" />
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
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
            title={title}
            srcDoc={preview.data.html}
            sandbox=""
            className="h-[500px] w-full rounded-md border bg-white"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

type EmailSection = {
  kind: OnboardingEmailKind;
  label: string;
  description: React.ReactNode;
  placeholder: string;
  defaultValue: string;
};

const SECTIONS: EmailSection[] = [
  {
    kind: "start",
    label: "Start-onboarding email",
    description: (
      <>
        The first message a new member sees, right after they&apos;re accepted. The greeting and the
        numbered next-steps list are added automatically — just write the paragraph in between.
      </>
    ),
    placeholder: DEFAULT_START_INTRO,
    defaultValue: DEFAULT_START_INTRO,
  },
  {
    kind: "confirm",
    label: "Confirm-KTH-email email",
    description: (
      <>
        Sent once they submit their kth.se address, with the link that confirms it. The
        anti-scanner explanation below the link is added automatically — just write the paragraph
        in between.
      </>
    ),
    placeholder: DEFAULT_CONFIRM_INTRO,
    defaultValue: DEFAULT_CONFIRM_INTRO,
  },
  {
    kind: "account",
    label: "Account-credentials email",
    description: (
      <>
        Sent once their @kthais.com account is created. An optional personal note before the
        credentials — leave it blank for just the credentials, no intro paragraph.
      </>
    ),
    placeholder: "Optional — leave blank for no intro paragraph",
    defaultValue: "",
  },
  {
    kind: "mattermost",
    label: "Mattermost getting-started email",
    description: <>Sent right after the account-credentials email.</>,
    placeholder: DEFAULT_MATTERMOST_INTRO,
    defaultValue: DEFAULT_MATTERMOST_INTRO,
  },
];

const FIELD_BY_KIND: Record<OnboardingEmailKind, keyof OnboardingEmailSettings> = {
  start: "start_intro_text",
  confirm: "confirm_intro_text",
  account: "account_intro_text",
  mattermost: "mattermost_intro_text",
};

export function OnboardingEmailSettingsPanel() {
  const { data: settings, isLoading, isError, refetch, isRefetching } = useOnboardingEmailSettings();
  const updateSettings = useUpdateOnboardingEmailSettings();
  const [open, setOpen] = useState(false);
  const [drafts, setDrafts] = useState<OnboardingEmailSettings>({
    start_intro_text: "",
    confirm_intro_text: "",
    account_intro_text: "",
    mattermost_intro_text: "",
  });
  const [initialised, setInitialised] = useState(false);

  const saved: OnboardingEmailSettings = settings ?? {
    start_intro_text: "",
    confirm_intro_text: "",
    account_intro_text: "",
    mattermost_intro_text: "",
  };

  if (settings && !initialised) {
    setDrafts(saved);
    setInitialised(true);
  }

  const isDirty =
    initialised &&
    (drafts.start_intro_text !== saved.start_intro_text ||
      drafts.confirm_intro_text !== saved.confirm_intro_text ||
      drafts.account_intro_text !== saved.account_intro_text ||
      drafts.mattermost_intro_text !== saved.mattermost_intro_text);

  function setField(field: keyof OnboardingEmailSettings, value: string) {
    setDrafts((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    updateSettings.mutate(drafts);
  }

  // Collapsing with unsaved edits discards them — reverting to the last
  // saved values here (rather than leaving them sitting in memory) means
  // there's never an invisible unsaved draft lingering after you close this.
  function handleToggle() {
    if (open && isDirty) {
      setDrafts(saved);
    }
    setOpen((v) => !v);
  }

  return (
    <Card>
      <CardHeader className="cursor-pointer select-none" onClick={handleToggle}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="h-4 w-4" />
            Onboarding emails
          </CardTitle>
          <ChevronDown
            className="h-4 w-4 text-muted-foreground transition-transform"
            style={{ transform: open ? "rotate(180deg)" : undefined }}
          />
        </div>
        {!open && (
          <CardDescription>
            The four emails sent over the course of an onboarding. Click to view or edit.
          </CardDescription>
        )}
      </CardHeader>
      {open && (
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : isError ? (
            <div className="space-y-2">
              <p className="text-sm text-destructive">Failed to load the current onboarding email settings.</p>
              <Button type="button" variant="outline" size="sm" disabled={isRefetching} onClick={() => refetch()}>
                {isRefetching ? "Retrying…" : "Try again"}
              </Button>
            </div>
          ) : (
            <>
              {SECTIONS.map((section) => {
                const field = FIELD_BY_KIND[section.kind];
                const value = drafts[field];
                return (
                  <div key={section.kind} className="space-y-2 border-b pb-6 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`onboarding-${section.kind}-intro`}>{section.label}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto py-0 text-xs"
                        onClick={() => setField(field, section.defaultValue)}
                      >
                        {section.defaultValue ? "Reset to default message" : "Clear"}
                      </Button>
                    </div>
                    <CardDescription>
                      {section.description} Use{" "}
                      <code className="rounded bg-muted px-1 text-xs">{"{{first_name}}"}</code> to
                      address the new member by name
                      {section.kind === "start" ? (
                        <>
                          {" "}
                          and <code className="rounded bg-muted px-1 text-xs">{"{{team}}"}</code>{" "}
                          for the team they were assigned to
                        </>
                      ) : null}
                      .
                    </CardDescription>
                    <Textarea
                      id={`onboarding-${section.kind}-intro`}
                      placeholder={section.placeholder}
                      className="min-h-[100px] resize-y font-mono text-sm"
                      value={value}
                      onChange={(e) => setField(field, e.target.value)}
                    />
                    <OnboardingEmailPreviewDialog kind={section.kind} title={section.label} introText={value} />
                  </div>
                );
              })}
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" disabled={!isDirty || updateSettings.isPending} onClick={handleSave}>
                  {updateSettings.isPending ? "Saving…" : isDirty ? "Save changes" : "Saved"}
                </Button>
                {isDirty && !updateSettings.isPending && (
                  <span className="text-xs text-muted-foreground">
                    Unsaved - collapsing this without saving will discard your changes.
                  </span>
                )}
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}
