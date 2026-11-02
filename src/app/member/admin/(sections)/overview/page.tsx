"use client";

import Link from "next/link";
import { differenceInCalendarDays, format, subDays } from "date-fns";
import { ArrowRight, CalendarClock } from "lucide-react";
import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import { useAdminUsers, useOnboardingRecords } from "@/hooks/admin";
import { useAdminApplications, useApplicationSettings } from "@/hooks/applications";
import { useMemberProfile } from "@/hooks/member";
import { cn } from "@/lib/utils";

// Same year the Applications page loads by default.
const APPLICATION_YEAR = 2026;

const ONBOARDING_IN_PROGRESS = new Set([
  "notified",
  "kth_email_submitted",
  "kth_email_confirmed",
  "provisioned",
  "emailed",
]);

type AttentionItem = {
  label: string;
  hint: string;
  href: string;
  count: number | undefined;
  isError: boolean;
  urgent?: boolean;
};

function AttentionRow({ label, hint, href, count, isError, urgent }: AttentionItem) {
  const done = count === 0;
  // Something waiting gets the society blue (red if it's a failure), so the
  // rows that need you stand out from the faded ones at zero.
  const waiting = !done && count !== undefined && !isError;
  const accent = waiting && (urgent ? "text-destructive" : "text-primary");
  return (
    <li>
      <Link
        href={href}
        className={cn(
          "flex items-center gap-6 py-3 pr-4 pl-2 transition-colors hover:bg-secondary/60",
          done && "opacity-50",
        )}
      >
        <span
          className={cn(
            "w-10 shrink-0 text-right text-2xl font-semibold tabular-nums",
            accent,
          )}
        >
          {isError ? "!" : (count ?? "–")}
        </span>
        <span className="min-w-0 flex-1">
          <span className={cn("block font-medium", accent && ["font-bold", accent])}>
            {label}
          </span>
          <span className="block text-sm text-muted-foreground">
            {isError ? "Couldn't load this. Try refreshing the page." : hint}
          </span>
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </Link>
    </li>
  );
}

function RecruitmentStatus({
  is_recruitment_open,
  submission_deadline,
}: {
  is_recruitment_open: boolean;
  submission_deadline: string;
}) {
  const deadline = new Date(submission_deadline);
  const daysLeft = differenceInCalendarDays(deadline, new Date());
  const when = format(deadline, "d MMM yyyy, HH:mm");

  let detail: string;
  if (is_recruitment_open) {
    detail =
      daysLeft <= 0
        ? `Closes today at ${format(deadline, "HH:mm")}`
        : `Closes ${when} · ${daysLeft} day${daysLeft === 1 ? "" : "s"} left`;
  } else if (deadline < new Date()) {
    detail = `Closed on ${when}`;
  } else {
    detail = `Deadline set to ${when}`;
  }

  return (
    <Link
      href="/member/admin/applications"
      className="flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors hover:bg-secondary/60"
    >
      <CalendarClock className="h-5 w-5 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1">
        <span className="block font-medium">
          Recruitment is {is_recruitment_open ? "open" : "closed"}
        </span>
        <span className="block text-sm text-muted-foreground">{detail}</span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}

export default function AdminOverviewPage() {
  const { data: profile } = useMemberProfile();
  const applications = useAdminApplications({ year: APPLICATION_YEAR });
  const onboarding = useOnboardingRecords();
  const users = useAdminUsers();
  const { data: settings } = useApplicationSettings();

  const apps = applications.data;
  const records = onboarding.data;

  const attention: AttentionItem[] = [
    {
      label: "Your interviews in progress",
      hint: "Applicants you picked up and still need to decide on.",
      href: "/member/admin/applications",
      count: apps?.filter(
        (a) => a.status === "interviewing" && a.interviewing_by_email === profile?.email,
      ).length,
      isError: applications.isError,
    },
    {
      label: "Pending applications",
      hint: "Submitted and not picked up by anyone yet.",
      href: "/member/admin/applications",
      count: apps?.filter((a) => a.status === "pending").length,
      isError: applications.isError,
    },
    {
      label: "Failed onboarding",
      hint: "Account setup stopped with an error and needs a retry.",
      href: "/member/admin/members?tab=onboarding",
      count: records?.filter((r) => r.state === "failed").length,
      isError: onboarding.isError,
      urgent: true,
    },
    {
      label: "Onboarding in progress",
      hint: "Invited, but they haven't finished setting up their account.",
      href: "/member/admin/members?tab=onboarding",
      count: records?.filter((r) => ONBOARDING_IN_PROGRESS.has(r.state)).length,
      isError: onboarding.isError,
    },
  ];

  const weekAgo = subDays(new Date(), 7);
  const stats = [
    {
      label: "Active members",
      value: users.data?.filter((u) => !u.deactivated_at).length,
      href: "/member/admin/members",
    },
    {
      label: `Applications ${APPLICATION_YEAR}`,
      value: apps?.length,
      href: "/member/admin/applications",
    },
    {
      label: "New applications this week",
      value: apps?.filter((a) => new Date(a.created_at) >= weekAgo).length,
      href: "/member/admin/applications",
    },
  ];

  const nothingToDo = attention.every((item) => item.count === 0);

  return (
    <>
      <AdminSectionHeader
        title="Overview"
        description={
          profile?.firstName
            ? `Hi ${profile.firstName}! Here's what needs your attention today.`
            : "Hi! Here's what needs your attention today."
        }
      />

      <div className="space-y-8">
        {settings && <RecruitmentStatus {...settings} />}

        <section aria-labelledby="attention-heading" className="space-y-3">
          <h3 id="attention-heading" className="text-sm font-medium text-muted-foreground">
            Needs attention
          </h3>
          {nothingToDo ? (
            <p className="rounded-lg border px-4 py-6 text-sm text-muted-foreground">
              Nothing is waiting on you right now.
            </p>
          ) : (
            <ul className="divide-y rounded-lg border">
              {attention.map((item) => (
                <AttentionRow key={item.label} {...item} />
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="numbers-heading" className="space-y-3">
          <h3 id="numbers-heading" className="text-sm font-medium text-muted-foreground">
            Key numbers
          </h3>
          <ul className="grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <li key={stat.label}>
                <Link
                  href={stat.href}
                  className="block h-full rounded-lg border px-4 py-3 transition-colors hover:bg-secondary/60"
                >
                  <span className="block text-sm text-muted-foreground">{stat.label}</span>
                  <span className="mt-1 block text-2xl font-semibold tabular-nums">
                    {stat.value ?? "–"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
