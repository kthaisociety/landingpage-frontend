"use client";

import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Lock, ShieldAlert, ShieldCheck } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getStatusBadgeStyle } from "@/components/admin/applications/status-badge";
import {
  useAdminApplications,
  useCloseFinalizePhase,
  useFinalizeDecision,
  useFinalizePhaseStatus,
  useOpenFinalizePhase,
} from "@/hooks/applications";
import {
  APPLICATION_TEAM_LABELS,
  isFinalizePhaseOpen,
  type GeneralApplication,
} from "@/types/applications";

const OPEN_CONFIRM_PHRASE = "OPEN FINALIZE PHASE";
const CLOSE_CONFIRM_PHRASE = "CLOSE FINALIZE PHASE";

function applicantName(application: GeneralApplication) {
  return `${application.first_name} ${application.last_name}`.trim();
}

function ConfirmPhraseDialog({
  trigger,
  title,
  description,
  phrase,
  isPending,
  onConfirm,
}: {
  trigger: React.ReactNode;
  title: string;
  description: React.ReactNode;
  phrase: string;
  isPending: boolean;
  onConfirm: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setDraft("");
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={phrase}
        />
        <DialogFooter>
          <Button
            variant="destructive"
            disabled={draft !== phrase || isPending}
            onClick={() => {
              onConfirm();
              setOpen(false);
              setDraft("");
            }}
          >
            {isPending ? "Working…" : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AcceptButton({
  application,
  myTeam,
  isPending,
  onConfirm,
}: {
  application: GeneralApplication;
  myTeam: string;
  isPending: boolean;
  onConfirm: () => void;
}) {
  if (!myTeam) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button size="sm" disabled>
              Accept
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          You need a team assigned to your profile to accept applicants.
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm">Accept</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Accept {applicantName(application)}?</AlertDialogTitle>
          <AlertDialogDescription>
            This records them as accepted onto your team,{" "}
            <strong>{APPLICATION_TEAM_LABELS[myTeam as keyof typeof APPLICATION_TEAM_LABELS] ?? myTeam}</strong>,
            and immediately emails them the acceptance notice. This can&apos;t
            be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={isPending} onClick={onConfirm}>
            {isPending ? "Accepting…" : "Confirm acceptance"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function RejectButton({
  application,
  isPending,
  onConfirm,
}: {
  application: GeneralApplication;
  isPending: boolean;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="outline">
          Reject
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reject {applicantName(application)}?</AlertDialogTitle>
          <AlertDialogDescription>
            They&apos;ll immediately receive a rejection email. This can&apos;t
            be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={isPending} onClick={onConfirm}>
            {isPending ? "Rejecting…" : "Confirm rejection"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function FinalizeRecruitmentPanel({
  isITAdmin,
  isHeadOfIT,
  myTeam,
}: {
  isITAdmin: boolean;
  isHeadOfIT: boolean;
  myTeam: string;
}) {
  const { data: phase, isLoading: phaseLoading } = useFinalizePhaseStatus();
  const openPhase = useOpenFinalizePhase();
  const closePhase = useCloseFinalizePhase();
  const finalizeDecision = useFinalizeDecision();
  const { data: interviewingApps = [], isLoading: interviewingLoading } =
    useAdminApplications({ status: "interviewing" });
  // An applicant who cycled back to "available" after at least one interview
  // (released post-interview, or still claimable by a second team they also
  // applied to) is just as finalize-eligible as one still "interviewing" —
  // the backend accepts both (see isFinalizeEligible). One never interviewed
  // is excluded: they haven't been through the round yet.
  const { data: availableApps = [], isLoading: availableLoading } =
    useAdminApplications({ status: "available" });
  const candidates = useMemo(
    () => [
      ...interviewingApps,
      ...availableApps.filter((application) => application.interviewed_by.length > 0),
    ],
    [interviewingApps, availableApps],
  );
  const isLoading = interviewingLoading || availableLoading;
  const [pendingId, setPendingId] = useState<string | null>(null);

  const isOpen = isFinalizePhaseOpen(phase);

  function decide(applicationId: string, decision: "accepted" | "rejected") {
    setPendingId(applicationId);
    finalizeDecision.mutate({ id: applicationId, decision });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {isOpen ? (
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          ) : (
            <ShieldAlert className="h-4 w-4" />
          )}
          Finalize recruitment
        </CardTitle>
        <CardDescription>
          Accept or reject interviewed applicants. Requires the phase to be
          open. Each decision emails the applicant immediately.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 rounded-md border p-3">
          {phaseLoading ? (
            <Skeleton className="h-6 w-48" />
          ) : isOpen ? (
            <>
              <Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                Phase open
              </Badge>
              <span className="text-sm text-muted-foreground">
                Opened by {phase?.opened_by_email}
                {phase?.opened_at && (
                  <> · {formatDistanceToNow(new Date(phase.opened_at), { addSuffix: true })}</>
                )}
              </span>
              {isHeadOfIT ? (
                <ConfirmPhraseDialog
                  trigger={
                    <Button variant="destructive" size="sm" className="ml-auto">
                      Close finalize phase
                    </Button>
                  }
                  title="Close the finalize phase"
                  description={
                    <>
                      This solidifies the list of accepted members and starts
                      onboarding. No further accept/reject decisions can be
                      made afterward unless the phase is reopened. Type{" "}
                      <span className="font-mono font-semibold">{CLOSE_CONFIRM_PHRASE}</span>{" "}
                      exactly to confirm.
                    </>
                  }
                  phrase={CLOSE_CONFIRM_PHRASE}
                  isPending={closePhase.isPending}
                  onConfirm={() => closePhase.mutate(CLOSE_CONFIRM_PHRASE)}
                />
              ) : (
                <span className="ml-auto text-xs text-muted-foreground">
                  Only the head of IT can close it.
                </span>
              )}
            </>
          ) : (
            <>
              <span className="text-sm text-muted-foreground">
                Finalize phase is closed — accept/reject is locked.
                {phase?.closed_by_email && (
                  <> Last closed by {phase.closed_by_email}.</>
                )}
              </span>
              {isITAdmin ? (
                <ConfirmPhraseDialog
                  trigger={
                    <Button variant="destructive" className="ml-auto">
                      Open finalize phase
                    </Button>
                  }
                  title="Open the finalize phase"
                  description={
                    <>
                      This lets every admin accept or reject interviewed
                      applicants — accepting immediately emails them and
                      records it onto the deciding admin&apos;s own team. Type{" "}
                      <span className="font-mono font-semibold">{OPEN_CONFIRM_PHRASE}</span>{" "}
                      exactly to confirm.
                    </>
                  }
                  phrase={OPEN_CONFIRM_PHRASE}
                  isPending={openPhase.isPending}
                  onConfirm={() => openPhase.mutate(OPEN_CONFIRM_PHRASE)}
                />
              ) : (
                <span className="ml-auto text-xs text-muted-foreground">
                  Only IT admins can open it.
                </span>
              )}
            </>
          )}
        </div>

        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : candidates.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No applicants are currently interviewing or available after an interview.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Team preferences</TableHead>
                  <TableHead>Interviewed by</TableHead>
                  <TableHead className="text-right">Decision</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((application) => {
                  const statusBadge = getStatusBadgeStyle(application.status, {
                    interviewedByMyTeam: application.interviewed_by.length > 0,
                  });
                  const isPending =
                    finalizeDecision.isPending && pendingId === application.id;
                  return (
                    <TableRow key={application.id}>
                      <TableCell>
                        <Badge variant={statusBadge.variant} className={statusBadge.className}>
                          {statusBadge.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{applicantName(application)}</p>
                        <p className="text-xs text-muted-foreground">{application.email}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {application.teams.map((team) => (
                            <Badge key={team} variant="outline">
                              {APPLICATION_TEAM_LABELS[team]}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {application.interviewed_by.map((email) => (
                            <Badge key={email} variant="secondary">
                              {email}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {isOpen ? (
                          <div className="flex justify-end gap-2">
                            <AcceptButton
                              application={application}
                              myTeam={myTeam}
                              isPending={isPending}
                              onConfirm={() => decide(application.id, "accepted")}
                            />
                            <RejectButton
                              application={application}
                              isPending={isPending}
                              onConfirm={() => decide(application.id, "rejected")}
                            />
                          </div>
                        ) : (
                          <div className="flex justify-end">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Lock className="h-3 w-3" />
                                  Locked
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                Open the finalize phase to accept or reject.
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
