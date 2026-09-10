"use client";

import { useState } from "react";
import { RotateCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useOnboardingRecords,
  useRetryOnboarding,
  useCancelOnboarding,
  useRestartOnboarding,
  useDeleteOnboardingRecord,
  useDeactivateAccount,
  useDeleteAccount,
  type OnboardingRecord,
} from "@/hooks/admin";
import { useInterviewSettings } from "@/hooks/applications";
import { ConfirmPhraseDialog } from "@/components/admin/confirm-phrase-dialog";

const STALE_AFTER_DAYS = 7;
const DELETE_ACCOUNT_CONFIRM_PHRASE = "DELETE THIS ACCOUNT";

const STATE_LABELS: Record<OnboardingRecord["state"], string> = {
  notified: "Notified",
  kth_email_submitted: "Email submitted",
  kth_email_confirmed: "Email confirmed",
  provisioned: "Provisioned",
  emailed: "Provisioned",
  complete: "Complete",
  failed: "Failed",
  cancelled: "Cancelled",
  offboarded: "Offboarded",
};

function daysSince(dateString: string): number {
  const created = new Date(dateString).getTime();
  return Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24));
}

function StateBadge({ state }: { state: OnboardingRecord["state"] }) {
  if (state === "complete") return <Badge>{STATE_LABELS[state]}</Badge>;
  if (state === "failed") {
    return <Badge variant="destructive">{STATE_LABELS[state]}</Badge>;
  }
  if (state === "cancelled" || state === "offboarded") {
    return <Badge variant="outline">{STATE_LABELS[state]}</Badge>;
  }
  return <Badge variant="secondary">{STATE_LABELS[state]}</Badge>;
}

// A confirmed destructive/consequential action awaiting the admin's "yes" —
// set from a context-menu item, rendered by the single shared AlertDialog
// below (same lifted-state pattern as the applications table's delete
// confirmation), rather than nesting a dialog inside each menu.
type PendingAction = {
  kind: "restart" | "cancel" | "delete-record" | "deactivate-account" | "delete-account";
  record: OnboardingRecord;
};

function OnboardingRowContextMenu({
  record,
  onRetry,
  onRequestConfirm,
  isActionPending,
  isHeadOfIT,
  children,
}: {
  record: OnboardingRecord;
  onRetry: (record: OnboardingRecord) => void;
  onRequestConfirm: (action: PendingAction) => void;
  isActionPending: boolean;
  isHeadOfIT: boolean;
  children: React.ReactNode;
}) {
  const canRetry = record.state === "failed" || record.state === "kth_email_confirmed";
  // Restarting means "send a new onboarding email" — never appropriate
  // once someone's been fully offboarded, same as while still complete.
  const canRestart = record.state !== "complete" && record.state !== "offboarded";
  // Cancel doubles as "clear a stale record" here: a delete via the member
  // offboarding flow now marks the record offboarded automatically going
  // forward, but a record that completed before that existed (or was
  // deleted through some other path) can still be stuck at "complete"
  // indefinitely with no other way to acknowledge it. Only the two
  // already-terminal states are excluded.
  const canCancel = record.state !== "cancelled" && record.state !== "offboarded";
  // Only once a record is done with — the backend refuses anything still
  // in progress, so this can't destroy the only tracking of an active
  // onboarding.
  const canDelete =
    record.state === "complete" ||
    record.state === "cancelled" ||
    record.state === "offboarded" ||
    record.state === "failed";
  // kthais_email is only ever set once provisioning actually created the
  // real Google Workspace/Mattermost account — independent of most state,
  // since that account exists (and needs an offboarding path) whether the
  // record is still "complete", already "failed" downstream, or anything
  // else. Deliberately not restricted to signed-in members: this is exactly
  // the "provisioned but never logged into the site" case the Members
  // tab's own Deactivate/Delete account actions can't reach, since that
  // list only shows real signed-in Users. "offboarded" is the one
  // exception: onboarding-service's own Delete handler best-effort marks
  // the record offboarded once the real account is actually gone, so at
  // that point there's nothing left here to deactivate or delete again.
  const canOffboardAccount =
    isHeadOfIT && Boolean(record.kthais_email) && record.state !== "offboarded";
  const name = `${record.first_name} ${record.last_name}`;

  if (!canRetry && !canRestart && !canCancel && !canDelete && !canOffboardAccount) {
    return children;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuLabel>{name}</ContextMenuLabel>
        <ContextMenuSeparator />
        {canRetry && (
          <ContextMenuItem disabled={isActionPending} onClick={() => onRetry(record)}>
            <RotateCw className="mr-2 h-4 w-4" />
            Retry
          </ContextMenuItem>
        )}
        {canRestart && (
          <ContextMenuItem
            disabled={isActionPending}
            onClick={() => onRequestConfirm({ kind: "restart", record })}
          >
            Restart from scratch
          </ContextMenuItem>
        )}
        {canCancel && (
          <ContextMenuItem
            disabled={isActionPending}
            className="text-destructive focus:text-destructive"
            onClick={() => onRequestConfirm({ kind: "cancel", record })}
          >
            Cancel onboarding
          </ContextMenuItem>
        )}
        {canDelete && (
          <>
            {(canRetry || canRestart || canCancel) && <ContextMenuSeparator />}
            <ContextMenuItem
              disabled={isActionPending}
              className="text-destructive focus:text-destructive"
              onClick={() => onRequestConfirm({ kind: "delete-record", record })}
            >
              Delete record
            </ContextMenuItem>
          </>
        )}
        {canOffboardAccount && (
          <>
            {(canRetry || canRestart || canCancel || canDelete) && <ContextMenuSeparator />}
            <ContextMenuItem
              disabled={isActionPending}
              onClick={() => onRequestConfirm({ kind: "deactivate-account", record })}
            >
              Deactivate account
            </ContextMenuItem>
            <ContextMenuItem
              disabled={isActionPending}
              className="text-destructive focus:text-destructive"
              onClick={() => onRequestConfirm({ kind: "delete-account", record })}
            >
              Delete account
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

export function OnboardingRecordsList() {
  const { data: records = [], isLoading, isError } = useOnboardingRecords();
  const { data: interviewSettings } = useInterviewSettings();
  const isHeadOfIT = interviewSettings?.is_head_of_it === true;
  const { mutate: retryOnboarding, isPending: isRetrying } = useRetryOnboarding();
  const { mutate: cancelOnboarding, isPending: isCancelling } = useCancelOnboarding();
  const { mutate: restartOnboarding, isPending: isRestarting } = useRestartOnboarding();
  const { mutate: deleteRecord, isPending: isDeleting } = useDeleteOnboardingRecord();
  const deactivateAccount = useDeactivateAccount();
  const deleteAccount = useDeleteAccount();
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const isActionPending =
    isRetrying ||
    isCancelling ||
    isRestarting ||
    isDeleting ||
    deactivateAccount.isPending ||
    deleteAccount.isPending;

  if (isLoading) {
    return (
      <p className="py-4 text-sm text-muted-foreground">
        Loading onboarding records...
      </p>
    );
  }
  if (isError) {
    return (
      <p className="py-4 text-sm text-destructive">
        Failed to load onboarding records.
      </p>
    );
  }
  if (records.length === 0) {
    return (
      <p className="py-4 text-sm text-muted-foreground">
        No onboardings have been started yet.
      </p>
    );
  }

  const sorted = [...records].sort(
    (a, b) => new Date(a.CreatedAt).getTime() - new Date(b.CreatedAt).getTime(),
  );
  const pendingName = pendingAction
    ? `${pendingAction.record.first_name} ${pendingAction.record.last_name}`
    : "";

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Right-click a row for retry/restart/cancel (or focus it with Tab and press the menu key / Shift+F10).
      </p>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Days pending</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((record) => {
              const days = daysSince(record.CreatedAt);
              const isStale =
                record.state !== "complete" &&
                record.state !== "cancelled" &&
                record.state !== "offboarded" &&
                days >= STALE_AFTER_DAYS;
              return (
                <OnboardingRowContextMenu
                  key={record.ID}
                  record={record}
                  onRetry={(r) => retryOnboarding(r.ID)}
                  onRequestConfirm={setPendingAction}
                  isActionPending={isActionPending}
                  isHeadOfIT={isHeadOfIT}
                >
                  <TableRow
                    tabIndex={0}
                    className={
                      isStale
                        ? "bg-destructive/5 focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2"
                        : "focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2"
                    }
                  >
                    <TableCell className="font-medium">
                      {record.first_name} {record.last_name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {record.kthais_email || record.kth_email || record.personal_email}
                    </TableCell>
                    <TableCell>{record.assigned_team}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {record.application_id ? "Recruitment" : "Manual"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <StateBadge state={record.state} />
                        {record.state === "failed" && record.failure_reason && (
                          <span className="text-xs text-muted-foreground">
                            {record.failure_reason}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className={isStale ? "font-medium text-destructive" : undefined}>
                      {days} {days === 1 ? "day" : "days"}
                      {isStale && " — needs follow-up"}
                    </TableCell>
                  </TableRow>
                </OnboardingRowContextMenu>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={pendingAction !== null && pendingAction.kind !== "delete-account"}
        onOpenChange={(open) => !open && setPendingAction(null)}
      >
        <AlertDialogContent>
          {pendingAction?.kind === "restart" && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Restart onboarding for {pendingName}?</AlertDialogTitle>
                <AlertDialogDescription>
                  They&apos;ll get a new &quot;start onboarding&quot; email and need to reconfirm
                  their kth.se address. If an account already exists, it won&apos;t be duplicated.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={isActionPending}
                  onClick={() => {
                    restartOnboarding(pendingAction.record.ID);
                    setPendingAction(null);
                  }}
                >
                  Yes, restart
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
          {pendingAction?.kind === "cancel" && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel onboarding for {pendingName}?</AlertDialogTitle>
                <AlertDialogDescription>
                  {pendingAction.record.state === "complete"
                    ? "Clears this stale record without touching anything else — use this when the member's account was already removed some other way (e.g. before member offboarding tracked this automatically), so this record stops sitting at \"Complete\" indefinitely."
                    : "They won't receive any further onboarding emails. If a Google Workspace or Mattermost account was already created, it needs to be cleaned up manually — this doesn't touch either."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Never mind</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isActionPending}
                  onClick={() => {
                    cancelOnboarding(pendingAction.record.ID);
                    setPendingAction(null);
                  }}
                >
                  Yes, cancel
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
          {pendingAction?.kind === "delete-record" && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this onboarding record for {pendingName}?</AlertDialogTitle>
                <AlertDialogDescription>
                  Removes it from this list entirely — it won&apos;t show up in search or
                  filters anymore. Only removes this tracking record; if a Google Workspace or
                  Mattermost account exists, it&apos;s untouched.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Never mind</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isActionPending}
                  onClick={() => {
                    deleteRecord(pendingAction.record.ID);
                    setPendingAction(null);
                  }}
                >
                  Yes, delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
          {pendingAction?.kind === "deactivate-account" && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Deactivate {pendingAction.record.kthais_email}?</AlertDialogTitle>
                <AlertDialogDescription>
                  Suspends their Google Workspace account and deactivates their Mattermost
                  account. Reversible any time from each system&apos;s own admin console.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={isActionPending}
                  onClick={() => {
                    deactivateAccount.mutate(pendingAction.record.kthais_email);
                    setPendingAction(null);
                  }}
                >
                  Yes, deactivate
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>

      <ConfirmPhraseDialog
        open={pendingAction?.kind === "delete-account"}
        onOpenChange={(open) => { if (!open) setPendingAction(null); }}
        title={`Permanently delete ${pendingAction?.record.kthais_email}?`}
        description={
          <>
            Permanently deletes their Google Workspace account, attempts to permanently
            delete their Mattermost account, and removes their local record (if any) from
            this site. This cannot be undone. Type{" "}
            <span className="font-mono font-semibold">{DELETE_ACCOUNT_CONFIRM_PHRASE}</span>{" "}
            exactly to confirm.
          </>
        }
        phrase={DELETE_ACCOUNT_CONFIRM_PHRASE}
        isPending={deleteAccount.isPending}
        onConfirm={() => {
          if (pendingAction) {
            deleteAccount.mutate({
              email: pendingAction.record.kthais_email,
              confirm: DELETE_ACCOUNT_CONFIRM_PHRASE,
            });
          }
        }}
      />
    </div>
  );
}
