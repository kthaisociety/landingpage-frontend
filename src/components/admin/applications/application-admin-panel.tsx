"use client";

import { useEffect, useMemo, useState } from "react";
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
  type RowSelectionState,
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
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
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
  useCancelInterview,
  useClaimApplication,
  useRestoreApplication,
  useDeleteApplication,
  useInterviewSettings,
  useMarkIneligible,
  useReleaseApplication,
  useSendInterviewInvite,
  useUpdateApplicationNotes,
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

const STATUS_BADGE_VARIANT: Record<ApplicationStatus, "default" | "destructive" | "secondary" | "outline"> = {
  available: "outline",
  interviewing: "default",
  ineligible: "destructive",
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
        <ContextMenuSeparator />
        <ContextMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => onDeleteRequest(application)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete application
        </ContextMenuItem>
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
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all rows"
        />
      ),
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={`Select ${applicationName(row.original)}`}
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" className="-ml-2" />
      ),
      cell: ({ row }) => {
        const app = row.original;
        if (app.status === "interviewing") {
          const isMine = app.interviewing_by_email === currentAdminEmail;
          return (
            <Badge
              variant="outline"
              className={
                isMine
                  ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  : "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300"
              }
            >
              {isMine ? "interviewing (you)" : "interviewing (other)"}
            </Badge>
          );
        }
        return (
          <Badge variant={STATUS_BADGE_VARIANT[app.status] ?? "outline"}>
            {app.status}
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
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
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

function ApplicationNotes({ applicationId }: { applicationId: string }) {
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
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">My notes (private)</h3>
      <Textarea
        placeholder="Add your private interview notes here…"
        className="min-h-[120px] resize-y text-sm"
        value={value}
        onChange={(e) => setDraft(e.target.value)}
      />
      <Button
        size="sm"
        disabled={updateNotes.isPending || draft === null || draft === savedNote}
        onClick={handleSave}
      >
        {updateNotes.isPending ? "Saving…" : "Save notes"}
      </Button>
    </div>
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

  return (
    <div className="space-y-6 px-4 pb-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={STATUS_BADGE_VARIANT[application.status] ?? "outline"}>
          {application.status}
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
            <Button
              size="sm"
              disabled={sendInvite.isPending}
              onClick={() => sendInvite.mutate(application.id)}
            >
              <Mail className="mr-2 h-4 w-4" />
              Send invite email
            </Button>
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

      <ApplicationNotes applicationId={application.id} />
    </div>
  );
}

const DEFAULT_INTERVIEW_TEMPLATE =
  "Hi {{first_name}},\n\nCongratulations! We'd love to invite you to an interview with KTH AI Society.\n\nYou can book a time slot using the link below:\n{{booking_url}}\n\nLooking forward to speaking with you!\n\nBest regards,\nKTH AI Society";

function InterviewSettingsPanel({ currentTeam }: { currentTeam: string }) {
  const { data: settings, isLoading } = useInterviewSettings();
  const updateSettings = useUpdateInterviewSettings();
  const [open, setOpen] = useState(false);
  const [bookingUrl, setBookingUrl] = useState("");
  const [emailTemplate, setEmailTemplate] = useState("");
  const [initialised, setInitialised] = useState(false);

  if (settings && !initialised) {
    setBookingUrl(settings.booking_page_url);
    setEmailTemplate(settings.interview_email_template);
    setInitialised(true);
  }

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

  return (
    <Card>
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="h-4 w-4" />
            My interview settings
          </CardTitle>
          <ChevronDown
            className="h-4 w-4 text-muted-foreground transition-transform"
            style={{ transform: open ? "rotate(180deg)" : undefined }}
          />
        </div>
        {!open && (
          <CardDescription>
            Booking page and email template — click to view or edit.
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
                Configure your personal booking link and the email template sent to candidates.
                Use <code className="rounded bg-muted px-1 text-xs">{"{{first_name}}"}</code> and{" "}
                <code className="rounded bg-muted px-1 text-xs">{"{{booking_url}}"}</code> as placeholders.
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
                  <Label htmlFor="email-template">Email template</Label>
                  {!emailTemplate && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto py-0 text-xs"
                      onClick={() => setEmailTemplate(DEFAULT_INTERVIEW_TEMPLATE)}
                    >
                      Use default
                    </Button>
                  )}
                </div>
                <Textarea
                  id="email-template"
                  placeholder={DEFAULT_INTERVIEW_TEMPLATE}
                  className="min-h-[180px] resize-y font-mono text-sm"
                  value={emailTemplate}
                  onChange={(e) => setEmailTemplate(e.target.value)}
                />
              </div>
              <Button disabled={updateSettings.isPending} onClick={handleSave}>
                {updateSettings.isPending ? "Saving…" : "Save settings"}
              </Button>
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

export function ApplicationAdminPanel() {
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
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [rankFilter, setRankFilterState] = useState<ApplicationRankFilter>("all");
  const [availabilityFilter, setAvailabilityFilterState] =
    useState<ApplicationAvailabilityFilter>("all");
  const [preferenceTypeFilter, setPreferenceTypeFilterState] =
    useState<ApplicationPreferenceTypeFilter>("all");
  const [graduationYearFilter, setGraduationYearFilterState] = useState("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
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
    const counts = { total: 0, totalTeamApplications: 0, available: 0, interviewing: 0, ineligible: 0 };
    applications.forEach((application) => {
      counts.total += 1;
      counts.totalTeamApplications += application.teams.length;
      if (application.status === "available") counts.available += 1;
      else if (application.status === "interviewing") counts.interviewing += 1;
      else if (application.status === "ineligible") counts.ineligible += 1;
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

  const table = useReactTable({
    data: applications,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    globalFilterFn: applicationGlobalFilter,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
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
    setRowSelection({});
    setRankFilterState("all");
    setAvailabilityFilterState("all");
    setPreferenceTypeFilterState("all");
    setGraduationYearFilterState("all");
    setSorting([{ id: "created_at", desc: true }]);
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
    setRowSelection({});
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
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">General Applications 2026</h2>
          <p className="text-sm text-muted-foreground">
            Review submissions and manage the interview process.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {(
          [
            ["Unique applicants", summary.total, null],
            ["Total applications", summary.totalTeamApplications, null],
            ["Available", summary.available, "available"],
            ["Interviewing", summary.interviewing, "interviewing"],
            ["Ineligible", summary.ineligible, "ineligible"],
          ] as const
        ).map(([label, value, statusFilter]) => (
          <Card
            key={label}
            className={statusFilter ? "cursor-pointer transition-colors hover:bg-muted/50" : undefined}
            onClick={statusFilter ? () => setStatusFilter(statusFilter) : undefined}
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
                setStatusFilter("available");
                setTeamFilter(effectiveTeam as ApplicationTeamFilter);
              }}
            >
              Available for {APPLICATION_TEAM_LABELS[effectiveTeam as ApplicationTeam] ?? effectiveTeam}
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
    </section>
  );
}
