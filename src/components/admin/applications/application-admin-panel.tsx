"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type SortingState,
  type Table as ReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  AlertCircle,
  ArrowUpDown,
  Ban,
  ChevronDown,
  Download,
  Eye,
  Lock,
  Mail,
  RotateCcw,
  Search,
  Settings,
  Trash2,
  Unlock,
  XCircle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { TeamQuestionsAdminPanel } from "@/components/admin/applications/team-questions-admin-panel";
import { getStatusBadgeStyle } from "@/components/admin/applications/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  downloadApplicationResume,
  useAdminApplications,
  useApplicationNotes,
  useApplicationSharedNotes,
  useApplicationTeamQuestions,
  useCancelInterview,
  useClaimApplication,
  useRestoreApplication,
  useDeleteApplication,
  useInterviewSettings,
  useMarkIneligible,
  usePreviewInterviewSettings,
  useReleaseApplication,
  useSendInterviewInvite,
  useTeamQuestionDefinitions,
  useUpdateApplicationNotes,
  useUpdateApplicationSharedNotes,
  useUpdateInterviewSettings,
} from "@/hooks/applications";
import {
  APPLICATION_AVAILABILITY,
  APPLICATION_STATUSES,
  APPLICATION_TEAM_LABELS,
  APPLICATION_TEAMS,
  type AdminApplicationsFilters,
  type ApplicationAvailability,
  type ApplicationStatus,
  type ApplicationTeam,
  type GeneralApplication,
} from "@/types/applications";
import { useAdminUserTeamEntries } from "@/hooks/admin";
import { useAuth } from "@/lib/providers/auth-provider/authProvider";

const SKELETON_ROWS = [
  "loading-1",
  "loading-2",
  "loading-3",
  "loading-4",
  "loading-5",
  "loading-6",
  "loading-7",
  "loading-8",
] as const;

const COLUMN_LABELS: Record<string, string> = {
  created_at: "Submitted",
  applicant: "Applicant",
  programme: "Programme",
  graduation_year: "Year",
  selected_team_rank: "Selected rank",
  teams: "Team preferences",
  availability: "Availability",
  status: "Status",
  team_preferences_ranked: "Preference type",
};


type ApplicationStatusFilter = ApplicationStatus | "all";
type ApplicationTeamFilter = ApplicationTeam | "all";
type ApplicationRankFilter = "all" | "1" | "2" | "3" | "4" | "5";
type ApplicationAvailabilityFilter = ApplicationAvailability | "all";
type ApplicationPreferenceTypeFilter = "all" | "ranked" | "legacy";

function formatDate(value: string) {
  if (!value) return "Unknown";
  return new Intl.DateTimeFormat("en-SE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function applicationName(application: GeneralApplication) {
  return `${application.first_name} ${application.last_name}`.trim();
}

function csvCell(value: string | number | boolean | string[] | null | undefined) {
  const text = Array.isArray(value) ? value.join("; ") : String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function formatTeamPreferences(application: GeneralApplication) {
  if (application.team_preferences_ranked === true) {
    return application.teams
      .map((team, index) => `${index + 1}. ${APPLICATION_TEAM_LABELS[team]}`)
      .join("; ");
  }
  return `Legacy unranked: ${application.teams
    .map((team) => APPLICATION_TEAM_LABELS[team])
    .join("; ")}`;
}

function getTeamRank(
  application: GeneralApplication,
  team: ApplicationTeamFilter,
) {
  if (team === "all" || application.team_preferences_ranked !== true) {
    return null;
  }
  const index = application.teams.indexOf(team);
  return index === -1 ? null : index + 1;
}

function exportApplicationsCsv({
  applications,
  year,
  status,
  team,
}: {
  applications: GeneralApplication[];
  year: number;
  status: ApplicationStatusFilter;
  team: ApplicationTeamFilter;
}) {
  const headers = [
    "Submitted",
    "Status",
    "First name",
    "Last name",
    "Email",
    "Gender",
    "Programme",
    "Graduation year",
    "Team preferences",
    "Team preferences ranked",
    "Availability",
    "LinkedIn",
    "Additional links",
    "Resume file",
    "Team interest reason",
    "Areas of interest",
    "Contribution",
    "Interviewing by",
    "Interviewed by",
  ];
  const rows = applications.map((application) => [
    application.created_at,
    application.status,
    application.first_name,
    application.last_name,
    application.email,
    application.gender,
    application.programme,
    application.graduation_year,
    formatTeamPreferences(application),
    application.team_preferences_ranked === true,
    application.availability,
    application.linkedin_url,
    application.additional_links ?? [],
    application.resume_file_name,
    application.team_interest_reason,
    application.interests ?? [],
    application.contribution,
    application.interviewing_by_email,
    application.interviewed_by,
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map(csvCell).join(","))
    .join("\r\n");
  const blob = new Blob([`\uFEFF${csv}`], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `applications-${year}-${status}-${team}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function getApplicationSearchText(application: GeneralApplication) {
  return [
    applicationName(application),
    application.email,
    application.gender,
    application.university,
    application.programme,
    application.linkedin_url,
    application.availability,
    application.status,
    application.interviewing_by_email,
    ...application.interviewed_by,
    ...application.teams,
    ...application.teams.map((team) => APPLICATION_TEAM_LABELS[team]),
    ...(application.interests ?? []),
  ]
    .join(" ")
    .toLowerCase();
}

function applicationGlobalFilter(
  row: Row<GeneralApplication>,
  _columnId: string,
  filterValue: string,
) {
  const search = filterValue.trim().toLowerCase();
  if (!search) return true;
  return getApplicationSearchText(row.original).includes(search);
}

function DataTableColumnHeader<TData>({
  column,
  title,
  className,
}: {
  column: Column<TData, unknown>;
  title: string;
  className?: string;
}) {
  if (!column.getCanSort()) {
    return <div className={className}>{title}</div>;
  }
  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
    </Button>
  );
}

function TeamPreferenceBadges({
  application,
}: {
  application: GeneralApplication;
}) {
  return (
    <div className="flex max-w-56 flex-wrap gap-1">
      {application.team_preferences_ranked === true ? (
        application.teams.map((team, index) => (
          <Badge key={team} variant="outline">
            {index + 1}. {APPLICATION_TEAM_LABELS[team]}
          </Badge>
        ))
      ) : (
        <>
          <Badge variant="secondary">Legacy unranked</Badge>
          {application.teams.map((team) => (
            <Badge key={team} variant="outline">
              {APPLICATION_TEAM_LABELS[team]}
            </Badge>
          ))}
        </>
      )}
    </div>
  );
}

function ApplicationRowContextMenu({
  application,
  currentAdminEmail,
  isITAdmin,
  onView,
  onDeleteRequest,
  onClaim,
  onRelease,
  onCancel,
  onIneligible,
  children,
}: {
  application: GeneralApplication;
  currentAdminEmail: string;
  isITAdmin: boolean;
  onView: (application: GeneralApplication) => void;
  onDeleteRequest: (application: GeneralApplication) => void;
  onClaim: (application: GeneralApplication) => void;
  onRelease: (application: GeneralApplication) => void;
  onCancel: (application: GeneralApplication) => void;
  onIneligible: (application: GeneralApplication) => void;
  children: React.ReactNode;
}) {
  const isClaimedByMe =
    application.status === "interviewing" &&
    application.interviewing_by_email === currentAdminEmail;
  const isClaimedByOther =
    application.status === "interviewing" &&
    application.interviewing_by_email !== currentAdminEmail;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuLabel>{applicationName(application)}</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => onView(application)}>
          <Eye className="mr-2 h-4 w-4" />
          View details
        </ContextMenuItem>
        <ContextMenuItem onClick={() => void downloadApplicationResume(application)}>
          <Download className="mr-2 h-4 w-4" />
          Download resume
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuLabel>Interview</ContextMenuLabel>
        {application.status === "available" && (
          <ContextMenuItem onClick={() => onClaim(application)}>
            <Lock className="mr-2 h-4 w-4" />
            Claim for interview
          </ContextMenuItem>
        )}
        {isClaimedByMe && (
          <>
            <ContextMenuItem onClick={() => onRelease(application)}>
              <Unlock className="mr-2 h-4 w-4" />
              Mark interview completed
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onCancel(application)}>
              <XCircle className="mr-2 h-4 w-4" />
              Cancel interview
            </ContextMenuItem>
          </>
        )}
        {isClaimedByOther && (
          <ContextMenuItem disabled>
            <Lock className="mr-2 h-4 w-4" />
            Claimed by {application.interviewing_by_email}
          </ContextMenuItem>
        )}
        {application.status !== "ineligible" && (
          <ContextMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => onIneligible(application)}
          >
            <Ban className="mr-2 h-4 w-4" />
            Mark as ineligible
          </ContextMenuItem>
        )}
        {isITAdmin && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDeleteRequest(application)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete application
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

function createApplicationColumns({
  selectedTeam,
  currentAdminEmail,
}: {
  selectedTeam: ApplicationTeamFilter;
  currentAdminEmail: string;
}): ColumnDef<GeneralApplication>[] {
  return [
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" className="-ml-2" />
      ),
      cell: ({ row }) => {
        const app = row.original;
        const badge = getStatusBadgeStyle(app.status, {
          interviewingByEmail: app.interviewing_by_email,
          currentAdminEmail,
        });
        return (
          <Badge variant={badge.variant} className={badge.className}>
            {badge.label}
          </Badge>
        );
      },
      filterFn: (row, columnId, filterValue: ApplicationStatusFilter) =>
        filterValue === "all" || row.getValue(columnId) === filterValue,
      enableHiding: false,
    },
    {
      id: "applicant",
      accessorFn: applicationName,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Applicant"
          className="-ml-2"
        />
      ),
      cell: ({ row }) => (
        <div className="min-w-44">
          <p className="font-medium">{applicationName(row.original)}</p>
          <p className="text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "programme",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Programme"
          className="-ml-2"
        />
      ),
      cell: ({ row }) => (
        <div className="max-w-56 truncate" title={row.original.programme}>
          {row.original.programme}
        </div>
      ),
    },
    {
      accessorKey: "graduation_year",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Year" className="-ml-2" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs">
          {row.original.graduation_year}
        </span>
      ),
      filterFn: (row, columnId, filterValue: string) =>
        filterValue === "all" ||
        String(row.getValue(columnId)) === filterValue,
    },
    {
      id: "selected_team_rank",
      accessorFn: (application) => getTeamRank(application, selectedTeam),
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Selected rank"
          className="-ml-2"
        />
      ),
      cell: ({ row }) => {
        const rank = getTeamRank(row.original, selectedTeam);
        return rank ? (
          <Badge variant="outline">#{rank}</Badge>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        );
      },
      sortingFn: (rowA, rowB) => {
        const rankA = getTeamRank(rowA.original, selectedTeam) ?? 99;
        const rankB = getTeamRank(rowB.original, selectedTeam) ?? 99;
        return rankA - rankB;
      },
      filterFn: (row, _columnId, filterValue: ApplicationRankFilter) => {
        if (filterValue === "all") return true;
        return getTeamRank(row.original, selectedTeam) === Number(filterValue);
      },
      enableHiding: false,
    },
    {
      id: "teams",
      accessorFn: (application) => application.teams,
      header: "Team preferences",
      cell: ({ row }) => <TeamPreferenceBadges application={row.original} />,
      filterFn: (row, _columnId, filterValue: ApplicationTeamFilter) =>
        filterValue === "all" ||
        row.original.teams.includes(filterValue),
      enableSorting: false,
    },
    {
      accessorKey: "availability",
      header: "Availability",
      filterFn: (row, columnId, filterValue: ApplicationAvailabilityFilter) =>
        filterValue === "all" || row.getValue(columnId) === filterValue,
    },
    {
      accessorKey: "team_preferences_ranked",
      header: "Preference type",
      cell: ({ row }) =>
        row.original.team_preferences_ranked === true ? (
          <Badge variant="outline">Ranked</Badge>
        ) : (
          <Badge variant="secondary">Legacy</Badge>
        ),
      filterFn: (row, columnId, filterValue: ApplicationPreferenceTypeFilter) =>
        filterValue === "all" ||
        (filterValue === "ranked" && row.getValue(columnId) === true) ||
        (filterValue === "legacy" && row.getValue(columnId) !== true),
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Submitted"
          className="-ml-2"
        />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs">
          {formatDate(row.original.created_at)}
        </span>
      ),
    },
  ];
}

function DataTableViewOptions({
  table,
}: {
  table: ReactTable<GeneralApplication>;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Columns
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter((column) => column.getCanHide())
          .map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {COLUMN_LABELS[column.id] ?? column.id}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DataTablePagination({
  table,
}: {
  table: ReactTable<GeneralApplication>;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page</span>
          <NativeSelect
            aria-label="Rows per page"
            className="h-8 w-[76px]"
            value={String(table.getState().pagination.pageSize)}
            onChange={(event) => table.setPageSize(Number(event.target.value))}
          >
            {[10, 20, 30, 50].map((pageSize) => (
              <NativeSelectOption key={pageSize} value={String(pageSize)}>
                {pageSize}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <p className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {Math.max(table.getPageCount(), 1)}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

function TeamPreferencesDetail({
  application,
}: {
  application: GeneralApplication;
}) {
  if (application.team_preferences_ranked === true) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Team preferences</h3>
        <p className="text-xs text-muted-foreground">
          Omitted teams were not included in this application.
        </p>
        <ol className="space-y-1 text-sm text-muted-foreground">
          {application.teams.map((team, index) => (
            <li key={team}>
              <span className="font-medium text-foreground">{index + 1}.</span>{" "}
              {APPLICATION_TEAM_LABELS[team]}
            </li>
          ))}
        </ol>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Legacy unranked preferences</h3>
      <div className="flex flex-wrap gap-1">
        {application.teams.map((team) => (
          <Badge key={team} variant="outline">
            {APPLICATION_TEAM_LABELS[team]}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function TeamQuestionsAnswers({ application }: { application: GeneralApplication }) {
  const { data: submission, isLoading } = useApplicationTeamQuestions(application.id);
  const { data: definitions } = useTeamQuestionDefinitions();

  function questionText(team: string, questionId: string): string {
    const questions = definitions?.[team as ApplicationTeam]?.questions ?? [];
    return questions.find((question) => question.id === questionId)?.text ?? questionId;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Team questions</h3>
      {isLoading && <Skeleton className="h-24 w-full" />}
      {submission && !submission.submitted && (
        <p className="text-sm text-muted-foreground">Not submitted yet.</p>
      )}
      {submission?.submitted && (
        <div className="space-y-4">
          {submission.withdrawn_teams.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Withdrew from: {submission.withdrawn_teams.join(", ")}
            </p>
          )}
          {Object.entries(submission.answers).map(([team, answers]) => (
            <div key={team} className="space-y-2">
              <p className="text-sm font-medium">
                {APPLICATION_TEAM_LABELS[team as ApplicationTeam] ?? team}
              </p>
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
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="break-words">{value}</p>
    </div>
  );
}

function DetailLink({ label, href }: { label: string; href: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="break-all text-primary underline-offset-4 hover:underline"
      >
        {href}
      </a>
    </div>
  );
}

function DetailText({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">{label}</h3>
      <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
        {value}
      </p>
    </div>
  );
}

/**
 * A note editor that stays collapsed to a single row when there's nothing
 * saved and the admin hasn't opted to write one, and auto-expands the one
 * time it loads with existing content so it's never missed.
 */
function NoteField({
  title,
  placeholder,
  value,
  hasContent,
  isPending,
  canSave,
  onChange,
  onSave,
  footer,
}: {
  title: string;
  placeholder: string;
  value: string;
  hasContent: boolean;
  isPending: boolean;
  canSave: boolean;
  onChange: (value: string) => void;
  onSave: () => void;
  footer?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const autoOpenedRef = useRef(false);

  useEffect(() => {
    if (hasContent && !autoOpenedRef.current) {
      autoOpenedRef.current = true;
      setIsOpen(true);
    }
  }, [hasContent]);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-between rounded-md border border-dashed px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:border-solid hover:bg-accent/50"
      >
        <span className="flex items-center gap-2">
          {hasContent ? <span className="h-1.5 w-1.5 rounded-full bg-primary" /> : null}
          {title}
        </span>
        <span className="text-xs">{hasContent ? "View / edit" : "Add note"}</span>
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setIsOpen(false)}
        className="flex items-center gap-1 text-sm font-semibold"
      >
        <ChevronDown className="h-4 w-4" />
        {title}
      </button>
      <Textarea
        autoFocus
        placeholder={placeholder}
        className="min-h-[120px] resize-y text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="flex items-center justify-between">
        <Button size="sm" disabled={isPending || !canSave} onClick={onSave}>
          {isPending ? "Saving…" : "Save notes"}
        </Button>
        {footer}
      </div>
    </div>
  );
}

function ApplicationPrivateNotes({ applicationId }: { applicationId: string }) {
  const { data: savedNote = "" } = useApplicationNotes(applicationId);
  const [draft, setDraft] = useState<string | null>(null);
  const updateNotes = useUpdateApplicationNotes();

  const value = draft ?? savedNote;

  function handleSave() {
    updateNotes.mutate(
      { id: applicationId, note: value },
      { onSuccess: () => setDraft(null) },
    );
  }

  return (
    <NoteField
      title="My notes (private)"
      placeholder="Add your private interview notes here…"
      value={value}
      hasContent={savedNote.trim().length > 0}
      isPending={updateNotes.isPending}
      canSave={draft !== null && draft !== savedNote}
      onChange={setDraft}
      onSave={handleSave}
    />
  );
}

function ApplicationSharedNotes({ applicationId }: { applicationId: string }) {
  const { data } = useApplicationSharedNotes(applicationId);
  const savedNote = data?.note ?? "";
  const [draft, setDraft] = useState<string | null>(null);
  const updateSharedNotes = useUpdateApplicationSharedNotes();

  const value = draft ?? savedNote;

  function handleSave() {
    updateSharedNotes.mutate(
      { id: applicationId, note: value },
      { onSuccess: () => setDraft(null) },
    );
  }

  return (
    <NoteField
      title="Shared notes (visible to all admins)"
      placeholder="Add notes visible to all admins here…"
      value={value}
      hasContent={savedNote.trim().length > 0}
      isPending={updateSharedNotes.isPending}
      canSave={draft !== null && draft !== savedNote}
      onChange={setDraft}
      onSave={handleSave}
      footer={
        data?.last_edited_email && data.updated_at ? (
          <p className="text-xs text-muted-foreground">
            Last edited by {data.last_edited_email},{" "}
            {formatDistanceToNow(new Date(data.updated_at), { addSuffix: true })}
          </p>
        ) : null
      }
    />
  );
}

function ApplicationDetail({
  application,
  currentAdminEmail,
  onApplicationUpdated,
}: {
  application: GeneralApplication;
  currentAdminEmail: string;
  onApplicationUpdated: (app: GeneralApplication) => void;
}) {
  const sendInvite = useSendInterviewInvite();
  const claim = useClaimApplication();
  const release = useReleaseApplication();
  const cancel = useCancelInterview();
  const markIneligible = useMarkIneligible();
  const restore = useRestoreApplication();

  const isClaimedByMe =
    application.status === "interviewing" &&
    application.interviewing_by_email === currentAdminEmail;
  const isClaimedByOther =
    application.status === "interviewing" &&
    application.interviewing_by_email !== currentAdminEmail;

  const statusBadge = getStatusBadgeStyle(application.status, {
    interviewingByEmail: application.interviewing_by_email,
    currentAdminEmail,
  });

  return (
    <div className="space-y-6 px-4 pb-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={statusBadge.variant} className={statusBadge.className}>
          {statusBadge.label}
        </Badge>
        {application.team_preferences_ranked === true ? null : (
          <Badge variant="secondary">Legacy unranked preferences</Badge>
        )}
        {application.interviewing_by_email && (
          <Badge
            variant="outline"
            className={
              isClaimedByMe
                ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300"
                : "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300"
            }
          >
            <Lock className="mr-1 h-3 w-3" />
            {isClaimedByMe ? "Claimed by you" : `Claimed by ${application.interviewing_by_email}`}
          </Badge>
        )}
      </div>

      {/* Interview actions */}
      <div className="flex flex-wrap gap-2">
        {application.status === "available" && (
          <Button
            size="sm"
            variant="outline"
            disabled={claim.isPending}
            onClick={() => claim.mutate(application.id, { onSuccess: onApplicationUpdated })}
          >
            <Lock className="mr-2 h-4 w-4" />
            Claim for interview
          </Button>
        )}
        {isClaimedByMe && (
          <>
            <Button
              size="sm"
              variant="outline"
              disabled={release.isPending}
              onClick={() => release.mutate(application.id, { onSuccess: onApplicationUpdated })}
            >
              <Unlock className="mr-2 h-4 w-4" />
              Mark interview completed
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={cancel.isPending}
              onClick={() => cancel.mutate(application.id, { onSuccess: onApplicationUpdated })}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel interview
            </Button>
            <div className="flex flex-col gap-1">
              <Button
                size="sm"
                variant={application.interview_invite_sent_at ? "outline" : "default"}
                disabled={sendInvite.isPending}
                onClick={() => sendInvite.mutate(application.id)}
              >
                <Mail className="mr-2 h-4 w-4" />
                {application.interview_invite_sent_at ? "Resend invite email" : "Send invite email"}
              </Button>
              {application.interview_invite_sent_at && (
                <p className="text-xs text-muted-foreground">
                  Sent {formatDistanceToNow(new Date(application.interview_invite_sent_at))} ago
                </p>
              )}
            </div>
          </>
        )}
        {isClaimedByOther && (
          <p className="text-sm text-muted-foreground">
            Interviewing is locked by {application.interviewing_by_email}.
          </p>
        )}
        {application.status !== "ineligible" && (
          <Button
            size="sm"
            variant="destructive"
            disabled={markIneligible.isPending}
            onClick={() => markIneligible.mutate(application.id, { onSuccess: onApplicationUpdated })}
          >
            <Ban className="mr-2 h-4 w-4" />
            Mark as ineligible
          </Button>
        )}
        {application.status === "ineligible" && (
          <Button
            size="sm"
            variant="outline"
            disabled={restore.isPending}
            onClick={() => restore.mutate(application.id, { onSuccess: onApplicationUpdated })}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Restore to available
          </Button>
        )}
      </div>

      {application.interviewed_by.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Interviewed by</h3>
          <div className="flex flex-wrap gap-1">
            {application.interviewed_by.map((email) => (
              <Badge key={email} variant="secondary">{email}</Badge>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 text-sm sm:grid-cols-2">
        <DetailItem label="Gender" value={application.gender} />
        <DetailItem label="Programme" value={application.programme} />
        <DetailItem
          label="Graduation year"
          value={String(application.graduation_year)}
        />
        <DetailLink label="LinkedIn" href={application.linkedin_url} />
        <DetailItem label="Availability" value={application.availability} />
      </div>

      <TeamPreferencesDetail application={application} />
      <TeamQuestionsAnswers application={application} />

      {application.interests?.length ? (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Areas of interest</h3>
          <div className="flex flex-wrap gap-1">
            {application.interests.map((interest) => (
              <Badge key={interest} variant="outline">
                {interest}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}

      {application.additional_links?.length ? (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Additional links</h3>
          <div className="flex flex-col gap-1 text-sm">
            {application.additional_links.map((link) => (
              <a
                key={link}
                href={link}
                target="_blank"
                rel="noreferrer"
                className="break-all text-primary underline-offset-4 hover:underline"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      ) : null}

      <DetailText label="Motivation" value={application.contribution} />

      <Button
        type="button"
        onClick={() => void downloadApplicationResume(application)}
      >
        <Download className="mr-2 h-4 w-4" />
        Download resume
      </Button>

      <ApplicationSharedNotes applicationId={application.id} />
      <ApplicationPrivateNotes applicationId={application.id} />
    </div>
  );
}

const DEFAULT_INTERVIEW_TEMPLATE =
  "Congratulations! We'd love to invite you to an interview with KTH AI Society.\n\nLooking forward to speaking with you!";

// Renders the invite by calling the backend, which builds it with the exact same
// email.RenderInterviewInvite used when actually sending — so this can never drift from
// the real email the way a hand-rolled client-side mockup could.
function InterviewEmailPreviewDialog({ bookingUrl, emailTemplate }: { bookingUrl: string; emailTemplate: string }) {
  const preview = usePreviewInterviewSettings();

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) {
          preview.mutate({
            booking_page_url: bookingUrl || "https://your-booking-link",
            interview_email_template: emailTemplate || DEFAULT_INTERVIEW_TEMPLATE,
          });
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
          <DialogTitle>Interview invite preview</DialogTitle>
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
          // The booking link needs to open in a real new tab: Google (and most booking
          // pages) refuse to render inside an iframe, so a same-frame navigation just
          // fails with "refused to connect". allow-popups(-to-escape-sandbox) + a <base
          // target="_blank"> makes clicking it open normally instead.
          <iframe
            title="Interview invitation email preview"
            srcDoc={preview.data.html.replace("<head>", '<head><base target="_blank">')}
            sandbox="allow-popups allow-popups-to-escape-sandbox"
            className="h-[500px] w-full rounded-md border bg-white"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function InterviewSettingsPanel({ currentTeam }: { currentTeam: string }) {
  const { data: settings, isLoading } = useInterviewSettings();
  const updateSettings = useUpdateInterviewSettings();
  const [open, setOpen] = useState(false);
  const [bookingUrl, setBookingUrl] = useState("");
  const [emailTemplate, setEmailTemplate] = useState("");
  const [initialised, setInitialised] = useState(false);

  const savedBookingUrl = settings?.booking_page_url ?? "";
  const savedEmailTemplate = settings ? settings.interview_email_template || DEFAULT_INTERVIEW_TEMPLATE : "";

  if (settings && !initialised) {
    setBookingUrl(savedBookingUrl);
    setEmailTemplate(savedEmailTemplate);
    setInitialised(true);
  }

  const isDirty =
    initialised && (bookingUrl !== savedBookingUrl || emailTemplate !== savedEmailTemplate);

  function handleSave() {
    updateSettings.mutate(
      {
        booking_page_url: bookingUrl,
        interview_email_template: emailTemplate,
        admin_team: currentTeam,
      },
      { onSuccess: () => setOpen(false) },
    );
  }

  // Collapsing with unsaved edits discards them — reverting to the last
  // saved values here (rather than leaving them sitting in memory) means
  // there's never an invisible unsaved draft lingering after you close this.
  function handleToggle() {
    if (open && isDirty) {
      setBookingUrl(savedBookingUrl);
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
            Interview invite
          </CardTitle>
          <ChevronDown
            className="h-4 w-4 text-muted-foreground transition-transform"
            style={{ transform: open ? "rotate(180deg)" : undefined }}
          />
        </div>
        {!open && (
          <CardDescription>
            The booking link and message sent to applicants when you claim them for interview. Click to view or edit.
          </CardDescription>
        )}
      </CardHeader>
      {open && (
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <>
              <CardDescription>
                The greeting and sign-off are added automatically, and your booking link becomes a button below
                your message, just write what goes in between. Use{" "}
                <code className="rounded bg-muted px-1 text-xs">{"{{first_name}}"}</code> to address the candidate
                by name.
              </CardDescription>
              <div className="space-y-2">
                <Label htmlFor="booking-url">Booking page URL</Label>
                <Input
                  id="booking-url"
                  type="url"
                  placeholder="https://calendar.app.google/..."
                  value={bookingUrl}
                  onChange={(e) => setBookingUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-template">Your message</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto py-0 text-xs"
                    onClick={() => setEmailTemplate(DEFAULT_INTERVIEW_TEMPLATE)}
                  >
                    Reset to default message
                  </Button>
                </div>
                <Textarea
                  id="email-template"
                  placeholder={DEFAULT_INTERVIEW_TEMPLATE}
                  className="min-h-[180px] resize-y font-mono text-sm"
                  value={emailTemplate}
                  onChange={(e) => setEmailTemplate(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <InterviewEmailPreviewDialog bookingUrl={bookingUrl} emailTemplate={emailTemplate} />
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

function AdminTeamSetup({
  currentTeam,
  onSaved,
}: {
  currentTeam: string;
  onSaved: (team: string) => void;
}) {
  const updateSettings = useUpdateInterviewSettings();
  const { data: settings } = useInterviewSettings();
  const [selected, setSelected] = useState(currentTeam || "");

  function handleSave() {
    if (!selected) return;
    updateSettings.mutate(
      {
        booking_page_url: settings?.booking_page_url ?? "",
        interview_email_template: settings?.interview_email_template ?? "",
        admin_team: selected,
      },
      { onSuccess: () => onSaved(selected) },
    );
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Declare your role</CardTitle>
        <CardDescription>
          Before accessing applications, let us know which team you lead. This
          personalises your view and determines which applications you can see.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          {APPLICATION_TEAMS.map((team) => (
            <label
              key={team}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                selected === team
                  ? "border-primary bg-primary/5"
                  : "hover:bg-muted/50"
              }`}
            >
              <input
                type="radio"
                name="admin-team"
                value={team}
                checked={selected === team}
                onChange={() => setSelected(team)}
                className="accent-primary"
              />
              <span className="font-medium">{APPLICATION_TEAM_LABELS[team]}</span>
            </label>
          ))}
          <label
            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
              selected === "none"
                ? "border-primary bg-primary/5"
                : "hover:bg-muted/50"
            }`}
          >
            <input
              type="radio"
              name="admin-team"
              value="none"
              checked={selected === "none"}
              onChange={() => setSelected("none")}
              className="accent-primary"
            />
            <span className="font-medium text-muted-foreground">
              I&apos;m not a team head (advisor, board, etc.)
            </span>
          </label>
        </div>
        <Button
          disabled={!selected || updateSettings.isPending}
          onClick={handleSave}
          className="w-full"
        >
          {updateSettings.isPending ? "Saving…" : "Continue"}
        </Button>
      </CardContent>
    </Card>
  );
}

export function ApplicationAdminPanel({
  activeTab,
  onActiveTabChange,
}: {
  activeTab: "general" | "team-questions";
  onActiveTabChange: (tab: "general" | "team-questions") => void;
}) {
  const { user } = useAuth();
  const currentAdminEmail = user?.email ?? "";

  // Primary: team from their actual profile team-membership entries
  const { data: teamEntries = [], isLoading: teamEntriesLoading } =
    useAdminUserTeamEntries(user?.userId ?? "", !!user?.userId);
  const teamFromProfile =
    teamEntries.find((e) => (APPLICATION_TEAMS as readonly string[]).includes(e.team))?.team ?? "";

  // Fallback: manually declared team (for admins not yet assigned in team management)
  const { data: interviewSettings, isLoading: settingsLoading } = useInterviewSettings();
  const updateSettings = useUpdateInterviewSettings();
  const [declaredTeam, setDeclaredTeam] = useState<string | null>(null);
  useEffect(() => {
    if (interviewSettings !== undefined && declaredTeam === null) {
      setDeclaredTeam(interviewSettings.admin_team ?? "");
    }
  }, [interviewSettings, declaredTeam]);

  // Team entries win; fall back to manual declaration
  const effectiveTeam = teamFromProfile || (declaredTeam ?? "");

  const [filters, setFilters] = useState<AdminApplicationsFilters>({
    year: 2026,
    status: "all",
    team: "all",
    q: "",
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "created_at", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    created_at: false,
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const [rankFilter, setRankFilterState] = useState<ApplicationRankFilter>("all");
  const [availabilityFilter, setAvailabilityFilterState] =
    useState<ApplicationAvailabilityFilter>("all");
  const [preferenceTypeFilter, setPreferenceTypeFilterState] =
    useState<ApplicationPreferenceTypeFilter>("all");
  const [graduationYearFilter, setGraduationYearFilterState] = useState("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [myInterviewingFilter, setMyInterviewingFilter] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<GeneralApplication | null>(null);
  const [applicationToDelete, setApplicationToDelete] =
    useState<GeneralApplication | null>(null);

  const { data: applications = [], isLoading, isError } =
    useAdminApplications({ year: filters.year });
  const deleteApplication = useDeleteApplication();
  const claim = useClaimApplication();
  const release = useReleaseApplication();
  const cancel = useCancelInterview();
  const markIneligible = useMarkIneligible();

  // Keep the side panel in sync with the latest server data after mutations.
  const displayedApplication = useMemo(
    () =>
      selectedApplication
        ? (applications.find((a) => a.id === selectedApplication.id) ?? selectedApplication)
        : null,
    [selectedApplication, applications],
  );

  const summary = useMemo(() => {
    const counts = {
      total: 0,
      totalTeamApplications: 0,
      pending: 0,
      available: 0,
      interviewing: 0,
      ineligible: 0,
      withdrawn: 0,
    };
    applications.forEach((application) => {
      counts.total += 1;
      counts.totalTeamApplications += application.teams.length;
      if (application.status === "pending") counts.pending += 1;
      else if (application.status === "available") counts.available += 1;
      else if (application.status === "interviewing") counts.interviewing += 1;
      else if (application.status === "ineligible") counts.ineligible += 1;
      else if (application.status === "withdrawn") counts.withdrawn += 1;
    });
    return counts;
  }, [applications]);

  const graduationYears = useMemo(
    () =>
      Array.from(
        new Set(applications.map((application) => application.graduation_year)),
      ).sort((yearA, yearB) => yearA - yearB),
    [applications],
  );

  const columns = useMemo(
    () =>
      createApplicationColumns({
        selectedTeam: (filters.team ?? "all") as ApplicationTeamFilter,
        currentAdminEmail,
      }),
    [filters.team, currentAdminEmail],
  );

  const tableData = useMemo(
    () => myInterviewingFilter
      ? applications.filter((a) => a.interviewing_by_email === currentAdminEmail)
      : applications,
    [applications, myInterviewingFilter, currentAdminEmail],
  );

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    globalFilterFn: applicationGlobalFilter,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  function setStatusFilter(status: ApplicationStatusFilter) {
    setFilters((current) => ({ ...current, status }));
    table.getColumn("status")?.setFilterValue(status === "all" ? undefined : status);
  }

  function setTeamFilter(team: ApplicationTeamFilter) {
    setFilters((current) => ({ ...current, team }));
    table.getColumn("teams")?.setFilterValue(team === "all" ? undefined : team);
    if (team === "all") {
      setRankFilterState("all");
      table.getColumn("selected_team_rank")?.setFilterValue(undefined);
      return;
    }
    setSorting([{ id: "selected_team_rank", desc: false }]);
  }

  function setRankFilter(rank: ApplicationRankFilter) {
    setRankFilterState(rank);
    table
      .getColumn("selected_team_rank")
      ?.setFilterValue(rank === "all" ? undefined : rank);
  }

  function setAvailabilityFilter(availability: ApplicationAvailabilityFilter) {
    setAvailabilityFilterState(availability);
    table
      .getColumn("availability")
      ?.setFilterValue(availability === "all" ? undefined : availability);
  }

  function setPreferenceTypeFilter(
    preferenceType: ApplicationPreferenceTypeFilter,
  ) {
    setPreferenceTypeFilterState(preferenceType);
    table
      .getColumn("team_preferences_ranked")
      ?.setFilterValue(preferenceType === "all" ? undefined : preferenceType);
  }

  function setGraduationYearFilter(year: string) {
    setGraduationYearFilterState(year);
    table
      .getColumn("graduation_year")
      ?.setFilterValue(year === "all" ? undefined : year);
  }

  function resetFilters() {
    setFilters({ year: 2026, status: "all", team: "all", q: "" });
    setGlobalFilter("");
    setColumnFilters([]);
    setRankFilterState("all");
    setAvailabilityFilterState("all");
    setPreferenceTypeFilterState("all");
    setGraduationYearFilterState("all");
    setSorting([{ id: "created_at", desc: true }]);
    setMyInterviewingFilter(false);
  }

  function exportFilteredApplications() {
    exportApplicationsCsv({
      applications: table.getFilteredRowModel().rows.map((row) => row.original),
      year: filters.year ?? 2026,
      status: (filters.status ?? "all") as ApplicationStatusFilter,
      team: (filters.team ?? "all") as ApplicationTeamFilter,
    });
  }

  async function deleteSelectedApplication() {
    if (!applicationToDelete) return;
    await deleteApplication.mutateAsync(applicationToDelete.id);
    setSelectedApplication((current) =>
      current?.id === applicationToDelete.id ? null : current,
    );
    setApplicationToDelete(null);
  }

  // Wait for both sources to resolve before deciding which screen to show
  if (teamEntriesLoading || settingsLoading || declaredTeam === null) {
    return (
      <section className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full max-w-md" />
      </section>
    );
  }

  // No team from profile entries AND no manual declaration → ask them to declare
  if (effectiveTeam === "") {
    return (
      <section className="flex min-h-[40vh] items-center justify-center py-12">
        <AdminTeamSetup currentTeam="" onSaved={setDeclaredTeam} />
      </section>
    );
  }

  // Admin declared they are not a team head — restricted view
  if (effectiveTeam === "none") {
    return (
      <section className="flex min-h-[40vh] items-center justify-center py-12">
        <Card className="mx-auto max-w-md text-center">
          <CardHeader>
            <CardTitle>No access to application data</CardTitle>
            <CardDescription>
              You&apos;ve declared that you&apos;re not a team head. Application
              data is only accessible to team leads. If this is a mistake, update
              your role below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() =>
                updateSettings.mutate(
                  {
                    booking_page_url: interviewSettings?.booking_page_url ?? "",
                    interview_email_template: interviewSettings?.interview_email_template ?? "",
                    admin_team: "",
                  },
                  { onSuccess: () => setDeclaredTeam("") },
                )
              }
              disabled={updateSettings.isPending}
            >
              Change my role
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => onActiveTabChange(value as "general" | "team-questions")}
      className="space-y-6"
    >
      <TabsList>
        <TabsTrigger value="general">General Information</TabsTrigger>
        <TabsTrigger value="team-questions">Team Questions</TabsTrigger>
      </TabsList>

      <TabsContent value="team-questions">
        <TeamQuestionsAdminPanel currentAdminEmail={currentAdminEmail} />
      </TabsContent>

      <TabsContent value="general" className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7">
        {(
          [
            { label: "Unique applicants", value: summary.total, onClick: resetFilters },
            { label: "Total applications", value: summary.totalTeamApplications, onClick: undefined },
            { label: "Pending team questions", value: summary.pending, onClick: () => setStatusFilter("pending") },
            { label: "Available", value: summary.available, onClick: () => setStatusFilter("available") },
            { label: "Interviewing", value: summary.interviewing, onClick: () => setStatusFilter("interviewing") },
            { label: "Ineligible", value: summary.ineligible, onClick: () => setStatusFilter("ineligible") },
            { label: "Withdrawn", value: summary.withdrawn, onClick: () => setStatusFilter("withdrawn") },
          ] as const
        ).map(({ label, value, onClick }) => (
          <Card
            key={label}
            className={onClick ? "cursor-pointer transition-colors hover:bg-muted/50" : undefined}
            onClick={onClick}
          >
            <CardHeader className="pb-2">
              <CardDescription>{label}</CardDescription>
              <CardTitle className="font-mono text-2xl">{value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <InterviewSettingsPanel currentTeam={effectiveTeam} />

      <Card>
        <CardHeader>
          <CardTitle>All applications</CardTitle>
          <CardDescription>
            Search, filter, inspect applications, and manage the interview pipeline.
          </CardDescription>
          <CardAction>
            <Badge variant="outline">
              {table.getFilteredRowModel().rows.length} result
              {table.getFilteredRowModel().rows.length === 1 ? "" : "s"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={globalFilter}
                onChange={(event) => {
                  const { value } = event.target;
                  setGlobalFilter(value);
                  setFilters((current) => ({ ...current, q: value }));
                }}
                placeholder="Search name, email, programme…"
                className="pl-9"
              />
            </div>
            <Button
              onClick={() => {
                setMyInterviewingFilter(false);
                setStatusFilter("available");
                setTeamFilter(effectiveTeam as ApplicationTeamFilter);
              }}
            >
              Available for {APPLICATION_TEAM_LABELS[effectiveTeam as ApplicationTeam] ?? effectiveTeam}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                resetFilters();
                setMyInterviewingFilter(true);
              }}
            >
              Currently interviewing
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAdvancedFilters((v) => !v)}
            >
              <Settings className="mr-2 h-4 w-4" />
              Filters
              <ChevronDown
                className="ml-2 h-4 w-4 transition-transform"
                style={{ transform: showAdvancedFilters ? "rotate(180deg)" : undefined }}
              />
            </Button>
            <DataTableViewOptions table={table} />
            <Button type="button" variant="outline" onClick={resetFilters}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={exportFilteredApplications}
              disabled={isLoading || table.getFilteredRowModel().rows.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {showAdvancedFilters && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
              <NativeSelect
                aria-label="Filter applications by status"
                className="w-full"
                value={filters.status ?? "all"}
                onChange={(event) =>
                  setStatusFilter(event.target.value as ApplicationStatusFilter)
                }
              >
                <NativeSelectOption value="all">All statuses</NativeSelectOption>
                {APPLICATION_STATUSES.map((status) => (
                  <NativeSelectOption key={status} value={status}>
                    {status}
                  </NativeSelectOption>
                ))}
              </NativeSelect>

              <NativeSelect
                aria-label="Filter applications by team"
                className="w-full"
                value={filters.team ?? "all"}
                onChange={(event) =>
                  setTeamFilter(event.target.value as ApplicationTeamFilter)
                }
              >
                <NativeSelectOption value="all">All teams</NativeSelectOption>
                {APPLICATION_TEAMS.map((team) => (
                  <NativeSelectOption key={team} value={team}>
                    {team}
                  </NativeSelectOption>
                ))}
              </NativeSelect>

              <NativeSelect
                aria-label="Filter applications by selected team rank"
                className="w-full"
                value={rankFilter}
                disabled={(filters.team ?? "all") === "all"}
                onChange={(event) =>
                  setRankFilter(event.target.value as ApplicationRankFilter)
                }
              >
                <NativeSelectOption value="all">All ranks</NativeSelectOption>
                {[1, 2, 3, 4, 5].map((rank) => (
                  <NativeSelectOption key={rank} value={String(rank)}>
                    Rank {rank}
                  </NativeSelectOption>
                ))}
              </NativeSelect>

              <NativeSelect
                aria-label="Filter applications by availability"
                className="w-full"
                value={availabilityFilter}
                onChange={(event) =>
                  setAvailabilityFilter(
                    event.target.value as ApplicationAvailabilityFilter,
                  )
                }
              >
                <NativeSelectOption value="all">All availability</NativeSelectOption>
                {APPLICATION_AVAILABILITY.map((availability) => (
                  <NativeSelectOption key={availability} value={availability}>
                    {availability}
                  </NativeSelectOption>
                ))}
              </NativeSelect>

              <NativeSelect
                aria-label="Filter applications by graduation year"
                className="w-full"
                value={graduationYearFilter}
                onChange={(event) => setGraduationYearFilter(event.target.value)}
              >
                <NativeSelectOption value="all">All graduation years</NativeSelectOption>
                {graduationYears.map((year) => (
                  <NativeSelectOption key={year} value={String(year)}>
                    {year}
                  </NativeSelectOption>
                ))}
              </NativeSelect>

              <NativeSelect
                aria-label="Filter applications by preference type"
                className="w-full"
                value={preferenceTypeFilter}
                onChange={(event) =>
                  setPreferenceTypeFilter(
                    event.target.value as ApplicationPreferenceTypeFilter,
                  )
                }
              >
                <NativeSelectOption value="all">All preference types</NativeSelectOption>
                <NativeSelectOption value="ranked">Ranked only</NativeSelectOption>
                <NativeSelectOption value="legacy">Legacy only</NativeSelectOption>
              </NativeSelect>
            </div>
          )}

          {isError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Failed to load applications</AlertTitle>
              <AlertDescription>
                Check that the backend is running and that you are signed in as
                an admin.
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  SKELETON_ROWS.map((rowKey) => (
                    <TableRow key={rowKey}>
                      {table.getVisibleLeafColumns().map((column) => (
                        <TableCell key={column.id}>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <ApplicationRowContextMenu
                      key={row.id}
                      application={row.original}
                      currentAdminEmail={currentAdminEmail}
                      isITAdmin={effectiveTeam === "IT"}
                      onView={setSelectedApplication}
                      onDeleteRequest={setApplicationToDelete}
                      onClaim={(app) => claim.mutate(app.id)}
                      onRelease={(app) => release.mutate(app.id)}
                      onCancel={(app) => cancel.mutate(app.id)}
                      onIneligible={(app) => markIneligible.mutate(app.id)}
                    >
                      <TableRow
                        data-state={row.getIsSelected() && "selected"}
                        className="cursor-pointer"
                        onClick={() => setSelectedApplication(row.original)}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    </ApplicationRowContextMenu>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={table.getVisibleLeafColumns().length}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No applications found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <DataTablePagination table={table} />
        </CardContent>
      </Card>

      <Sheet
        open={Boolean(selectedApplication)}
        onOpenChange={(open) => {
          if (!open) setSelectedApplication(null);
        }}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          {displayedApplication ? (
            <>
              <SheetHeader>
                <SheetTitle>{applicationName(displayedApplication)}</SheetTitle>
                <SheetDescription>
                  Submitted {formatDate(displayedApplication.created_at)} ·{" "}
                  {displayedApplication.email}
                </SheetDescription>
              </SheetHeader>
              <ApplicationDetail
                application={displayedApplication}
                currentAdminEmail={currentAdminEmail}
                onApplicationUpdated={setSelectedApplication}
              />
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={Boolean(applicationToDelete)}
        onOpenChange={(open) => {
          if (!open && !deleteApplication.isPending) {
            setApplicationToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete application?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove{" "}
              <strong>
                {applicationToDelete ? applicationName(applicationToDelete) : ""}
              </strong>
              {" "}from the application review list. This action cannot be
              undone from the admin panel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteApplication.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteApplication.isPending}
              onClick={(event) => {
                event.preventDefault();
                void deleteSelectedApplication();
              }}
            >
              Delete application
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </TabsContent>
    </Tabs>
  );
}
