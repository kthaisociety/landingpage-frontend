"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ActivityIcon, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminApplications, useTeamQuestionsDeliveryEvents } from "@/hooks/applications";
import type { TeamQuestionsDeliveryEvent, TeamQuestionsDeliveryOutcome } from "@/types/applications";

const KIND_LABELS: Record<TeamQuestionsDeliveryEvent["kind"], string> = {
  invite: "Invite",
  reminder: "Reminder",
  final_call: "Final call",
};

function outcomeBadge(outcome: TeamQuestionsDeliveryOutcome) {
  switch (outcome) {
    case "sent":
      return <Badge variant="outline">Sent</Badge>;
    case "failed":
      return <Badge variant="destructive">Failed</Badge>;
    case "superseded":
      return <Badge variant="secondary">Superseded</Badge>;
    case "delivered_not_recorded":
      return (
        <Badge
          variant="outline"
          className="border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300"
        >
          Needs review
        </Badge>
      );
  }
}

// "Superseded" means something else (a concurrent resend/reminder/final-call)
// already covers the same applicant — not a failure, nothing to act on.
// "Needs review" means the email almost certainly went out but a database
// write afterward failed, so the backend can't tell whether it was recorded —
// check manually before resending, since resending risks a duplicate email.
function outcomeExplanation(outcome: TeamQuestionsDeliveryOutcome): string | null {
  if (outcome === "superseded") {
    return "Skipped — a concurrent send already covered this applicant.";
  }
  if (outcome === "delivered_not_recorded") {
    return "The email was very likely sent, but recording it failed. Verify manually before resending.";
  }
  return null;
}

export function TeamQuestionsDeliveryActivityCard() {
  const [open, setOpen] = useState(false);
  const { data: events = [], isLoading } = useTeamQuestionsDeliveryEvents();
  const { data: applications = [] } = useAdminApplications({ year: 2026 });

  const applicantNameById = new Map(
    applications.map((application) => [application.id, `${application.first_name} ${application.last_name}`]),
  );

  const needsReviewCount = events.filter((event) => event.outcome === "delivered_not_recorded").length;

  return (
    <Card>
      <CardHeader className="cursor-pointer select-none" onClick={() => setOpen((v) => !v)}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <ActivityIcon className="h-4 w-4" />
            Recent delivery activity
          </CardTitle>
          <ChevronDown
            className="h-4 w-4 text-muted-foreground transition-transform"
            style={{ transform: open ? "rotate(180deg)" : undefined }}
          />
        </div>
        {!open && (
          <CardDescription>
            What the automatic invite/reminder/final-call emails actually did — sent, failed,
            skipped, or needing manual review.
            {needsReviewCount > 0 && (
              <span className="ml-1 font-medium text-amber-700 dark:text-amber-300">
                {needsReviewCount} need{needsReviewCount === 1 ? "s" : ""} review.
              </span>
            )}
          </CardDescription>
        )}
      </CardHeader>
      {open && (
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : events.length === 0 ? (
            <CardDescription>No sends recorded yet.</CardDescription>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Kind</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead>Sent by</TableHead>
                    <TableHead>When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => {
                    const explanation = outcomeExplanation(event.outcome);
                    return (
                      <TableRow key={event.ID}>
                        <TableCell className="font-medium">
                          {applicantNameById.get(event.application_id) ?? event.application_id}
                        </TableCell>
                        <TableCell>{KIND_LABELS[event.kind]}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            {outcomeBadge(event.outcome)}
                            {explanation && (
                              <span className="text-xs text-muted-foreground">{explanation}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {event.automatic ? "Automatic" : "Admin"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(event.CreatedAt))} ago
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
