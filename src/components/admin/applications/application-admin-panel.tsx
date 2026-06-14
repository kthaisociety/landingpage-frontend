"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  AlertCircle,
  Download,
  Eye,
  MoreHorizontal,
  RotateCcw,
  Search,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  DropdownMenu,
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
  useUpdateApplicationStatus,
} from "@/hooks/applications";
import {
  APPLICATION_STATUSES,
  APPLICATION_TEAMS,
  type AdminApplicationsFilters,
  type ApplicationStatus,
  type GeneralApplication,
} from "@/types/applications";

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

function csvCell(value: string | number | string[] | null | undefined) {
  const text = Array.isArray(value) ? value.join("; ") : String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function exportApplicationsCsv(
  applications: GeneralApplication[],
  filters: AdminApplicationsFilters,
) {
  const headers = [
    "Submitted",
    "Status",
    "First name",
    "Last name",
    "Email",
    "Programme",
    "Graduation year",
    "Teams",
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
    application.programme,
    application.graduation_year,
    application.teams,
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
  const status = filters.status && filters.status !== "all" ? filters.status : "all";
  const team = filters.team && filters.team !== "all" ? filters.team : "all";

  link.href = url;
  link.download = `applications-${filters.year ?? 2026}-${status}-${team}.csv`;
  link.click();
  URL.revokeObjectURL(url);
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
  const [selectedApplication, setSelectedApplication] =
    useState<GeneralApplication | null>(null);

  const { data: applications = [], isLoading, isError } =
    useAdminApplications({ year: filters.year });
  const updateStatus = useUpdateApplicationStatus();

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

  const filteredApplications = useMemo(() => {
    const search = (filters.q ?? "").trim().toLowerCase();

    return applications.filter((application) => {
      const matchesStatus =
        !filters.status ||
        filters.status === "all" ||
        application.status === filters.status;
      const matchesTeam =
        !filters.team ||
        filters.team === "all" ||
        application.teams.includes(filters.team);
      const matchesSearch =
        !search ||
        [
          applicationName(application),
          application.email,
          application.programme,
          application.linkedin_url,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(search));

      return matchesStatus && matchesTeam && matchesSearch;
    });
  }, [applications, filters.q, filters.status, filters.team]);

  const columns = useMemo<ColumnDef<GeneralApplication>[]>(
    () => [
      {
        accessorKey: "created_at",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Submitted
            <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {formatDate(row.original.created_at)}
          </span>
        ),
      },
      {
        accessorKey: "last_name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="min-w-40">
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
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Programme
            <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
          </Button>
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
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Year
            <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {row.original.graduation_year}
          </span>
        ),
      },
      {
        accessorKey: "teams",
        header: "Teams",
        cell: ({ row }) => (
          <div className="flex max-w-48 flex-wrap gap-1">
            {row.original.teams.map((team) => (
              <Badge key={team} variant="outline">
                {team}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        accessorKey: "availability",
        header: "Availability",
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
            <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <Badge variant={statusVariant(row.original.status)}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setSelectedApplication(row.original)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openResume(row.original)}>
                <Download className="mr-2 h-4 w-4" />
                Download resume
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={row.original.status}
                onValueChange={(status) =>
                  updateStatus.mutate({
                    id: row.original.id,
                    status: status as ApplicationStatus,
                  })
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
        ),
      },
    ],
    [updateStatus],
  );

  const table = useReactTable({
    data: filteredApplications,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  function resetFilters() {
    setFilters({ year: 2026, status: "all", team: "all", q: "" });
  }

  function exportFilteredApplications() {
    exportApplicationsCsv(filteredApplications, filters);
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
          <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_auto_auto]">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={filters.q ?? ""}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    q: event.target.value,
                  }))
                }
                placeholder="Search name, email, programme, or LinkedIn..."
                className="pl-9"
              />
            </div>
            <NativeSelect
              aria-label="Filter applications by status"
              className="w-full"
              value={filters.status ?? "all"}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  status: event.target
                    .value as AdminApplicationsFilters["status"],
                }))
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
                setFilters((current) => ({
                  ...current,
                  team: event.target.value as AdminApplicationsFilters["team"],
                }))
              }
            >
              <NativeSelectOption value="all">All teams</NativeSelectOption>
                {APPLICATION_TEAMS.map((team) => (
                  <NativeSelectOption key={team} value={team}>
                    {team}
                  </NativeSelectOption>
                ))}
            </NativeSelect>
            <Button type="button" variant="outline" onClick={resetFilters}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={exportFilteredApplications}
              disabled={isLoading || filteredApplications.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {isError ? (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Failed to load applications</AlertTitle>
              <AlertDescription>
                Check that the backend is running and that you are signed in as
                an admin.
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="rounded-md border">
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
                  Array.from({ length: 8 }).map((_, index) => (
                    <TableRow key={index}>
                      {columns.map((column, columnIndex) => (
                        <TableCell key={column.id ?? columnIndex}>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
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
                      colSpan={columns.length}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No applications found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
    </section>
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
        {application.teams.map((team) => (
          <Badge key={team} variant="outline">
            {team}
          </Badge>
        ))}
      </div>

      <div className="grid gap-4 text-sm sm:grid-cols-2">
        <DetailItem label="Programme" value={application.programme} />
        <DetailItem
          label="Graduation year"
          value={String(application.graduation_year)}
        />
        <DetailLink label="LinkedIn" href={application.linkedin_url} />
        <DetailItem label="Availability" value={application.availability} />
      </div>

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

      <DetailText
        label="Team interest"
        value={application.team_interest_reason}
      />
      <DetailText label="Contribution" value={application.contribution} />

      <Button type="button" onClick={() => openResume(application)}>
        <Download className="mr-2 h-4 w-4" />
        Download resume
      </Button>
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

function AlertCircleIcon() {
  return <AlertCircle className="h-4 w-4" />;
}
