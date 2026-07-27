import type { ApplicationStatus } from "@/types/applications";

export const STATUS_BADGE_VARIANT: Record<
  ApplicationStatus,
  "default" | "destructive" | "secondary" | "outline"
> = {
  pending: "secondary",
  available: "outline",
  interviewing: "default",
  ineligible: "destructive",
  withdrawn: "secondary",
};

// Plain "secondary" reads as a dead/disabled grey, which is the wrong signal for
// "pending" — it's an active, awaiting-action state, so it gets its own warm
// amber treatment instead of blending in with muted/inactive statuses.
export const STATUS_BADGE_CLASSNAME: Partial<Record<ApplicationStatus, string>> = {
  pending:
    "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
};

const INTERVIEWING_BY_YOU_CLASSNAME =
  "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300";
const INTERVIEWING_BY_OTHER_CLASSNAME =
  "border-violet-500/30 bg-violet-500/15 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400";

export type StatusBadgeStyle = {
  variant: "default" | "destructive" | "secondary" | "outline";
  className?: string;
  label: string;
};

/**
 * Single source of truth for status badge styling and label, shared by the
 * General Information table/detail view and the Team Questions table, so
 * "pending" (or any other status) always looks identical wherever it's shown.
 *
 * Pass interviewingByEmail/currentAdminEmail when known so "interviewing"
 * distinguishes a row claimed by you from one claimed by someone else — a
 * table full of interviewing rows shouldn't all look equally actionable when
 * most of them aren't yours to touch.
 */
export function getStatusBadgeStyle(
  status: ApplicationStatus,
  context?: { interviewingByEmail?: string; currentAdminEmail?: string },
): StatusBadgeStyle {
  if (status === "interviewing" && context?.currentAdminEmail) {
    const isMine = context.interviewingByEmail === context.currentAdminEmail;
    return {
      variant: "outline",
      className: isMine ? INTERVIEWING_BY_YOU_CLASSNAME : INTERVIEWING_BY_OTHER_CLASSNAME,
      label: isMine ? "interviewing (you)" : "interviewing (other)",
    };
  }

  return {
    variant: STATUS_BADGE_VARIANT[status] ?? "outline",
    className: STATUS_BADGE_CLASSNAME[status],
    label: status,
  };
}
