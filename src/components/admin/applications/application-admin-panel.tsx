"use client";

import { useMemo, useState } from "react";
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
  ChevronDown,
  Download,
  Eye,
  MoreHorizontal,
  RotateCcw,
  Search,
  Trash2,
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
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getApplicationResumeUrl,
  useAdminApplications,
  useDeleteApplication,
  useUpdateApplicationStatus,
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

function statusVariant(status: ApplicationStatus) {
  switch (status) {
    case "accepted":
      return "default";
    case "rejected":
      return "destructive";
    case "reviewed":
      return "secondary";
    default:
      return "outline";
  }
}

function applicationName(application: GeneralApplication) {
  return `${application.first_name} ${application.last_name}`.trim();
}

function openResume(application: GeneralApplication) {
  window.open(getApplicationResumeUrl(application.id), "_blank", "noopener");
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
    "Contribution",
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
    application.contribution,
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
    ...application.teams,
    ...application.teams.map((team) => APPLICATION_TEAM_LABELS[team]),
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

function ApplicationRowActions({
  application,
  onView,
  onStatusChange,
  onDeleteRequest,
}: {
  application: GeneralApplication;
  onView: (application: GeneralApplication) => void;
  onStatusChange: (application: GeneralApplication, status: ApplicationStatus) => void;
  onDeleteRequest: (application: GeneralApplication) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onView(application)}>
          <Eye className="mr-2 h-4 w-4" />
          View details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openResume(application)}>
          <Download className="mr-2 h-4 w-4" />
          Download resume
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onClick={() => onDeleteRequest(application)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete application
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Status</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={application.status}
          onValueChange={(status) =>
            onStatusChange(application, status as ApplicationStatus)
          }
        >
          {APPLICATION_STATUSES.map((status) => (
            <DropdownMenuRadioItem key={status} value={status}>
              {status}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function createApplicationColumns({
  onView,
  onStatusChange,
  onDeleteRequest,
  selectedTeam,
}: {
  onView: (application: GeneralApplication) => void;
  onStatusChange: (application: GeneralApplication, status: ApplicationStatus) => void;
  onDeleteRequest: (application: GeneralApplication) => void;
  selectedTeam: ApplicationTeamFilter;
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
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={`Select ${applicationName(row.original)}`}
        />
      ),
      enableSorting: false,
      enableHiding: false,
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
          <p className="text-xs text-muted-foreground">
            {row.original.email}
          </p>
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
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Status"
          className="-ml-2"
        />
      ),
      cell: ({ row }) => (
        <Badge variant={statusVariant(row.original.status)}>
          {row.original.status}
        </Badge>
      ),
      filterFn: (row, columnId, filterValue: ApplicationStatusFilter) =>
        filterValue === "all" || row.getValue(columnId) === filterValue,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <ApplicationRowActions
          application={row.original}
          onView={onView}
          onStatusChange={onStatusChange}
          onDeleteRequest={onDeleteRequest}
        />
      ),
      enableSorting: false,
      enableHiding: false,
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

function ApplicationDetail({
  application,
}: {
  application: GeneralApplication;
}) {
  return (
    <div className="space-y-6 px-4 pb-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={statusVariant(application.status)}>
          {application.status}
        </Badge>
        {application.team_preferences_ranked === true ? null : (
          <Badge variant="secondary">Legacy unranked preferences</Badge>
        )}
      </div>

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

      <Button type="button" onClick={() => openResume(application)}>
        <Download className="mr-2 h-4 w-4" />
        Download resume
      </Button>
    </div>
  );
}

export function ApplicationAdminPanel() {
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
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [rankFilter, setRankFilterState] = useState<ApplicationRankFilter>("all");
  const [availabilityFilter, setAvailabilityFilterState] =
    useState<ApplicationAvailabilityFilter>("all");
  const [preferenceTypeFilter, setPreferenceTypeFilterState] =
    useState<ApplicationPreferenceTypeFilter>("all");
  const [graduationYearFilter, setGraduationYearFilterState] = useState("all");
  const [selectedApplication, setSelectedApplication] =
    useState<GeneralApplication | null>(null);
  const [applicationToDelete, setApplicationToDelete] =
    useState<GeneralApplication | null>(null);

  const { data: applications = [], isLoading, isError } =
    useAdminApplications({ year: filters.year });
  const updateStatus = useUpdateApplicationStatus();
  const deleteApplication = useDeleteApplication();

  const summary = useMemo(() => {
    const counts = {
      total: applications.length,
      pending: 0,
      reviewed: 0,
      accepted: 0,
      rejected: 0,
    };
    applications.forEach((application) => {
      counts[application.status] += 1;
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
        onView: setSelectedApplication,
        onStatusChange: (application, status) =>
          updateStatus.mutate({
            id: application.id,
            status,
          }),
        onDeleteRequest: setApplicationToDelete,
        selectedTeam: (filters.team ?? "all") as ApplicationTeamFilter,
      }),
    [filters.team, updateStatus],
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

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">General Applications 2026</h2>
          <p className="text-sm text-muted-foreground">
            Review submissions and update application status.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Total", summary.total],
          ["Pending", summary.pending],
          ["Reviewed", summary.reviewed],
          ["Accepted", summary.accepted],
          ["Rejected", summary.rejected],
        ].map(([label, value]) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardDescription>{label}</CardDescription>
              <CardTitle className="font-mono text-2xl">{value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All applications</CardTitle>
          <CardDescription>
            Search, filter, inspect applications, and keep review status up to
            date.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_auto_auto_auto]">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={globalFilter}
                onChange={(event) => {
                  const { value } = event.target;
                  setGlobalFilter(value);
                  setFilters((current) => ({ ...current, q: value }));
                }}
                placeholder="Search name, email, programme, or LinkedIn..."
                className="pl-9"
              />
            </div>
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
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
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
          {selectedApplication ? (
            <>
              <SheetHeader>
                <SheetTitle>{applicationName(selectedApplication)}</SheetTitle>
                <SheetDescription>
                  Submitted {formatDate(selectedApplication.created_at)} ·{" "}
                  {selectedApplication.email}
                </SheetDescription>
              </SheetHeader>
              <ApplicationDetail application={selectedApplication} />
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
