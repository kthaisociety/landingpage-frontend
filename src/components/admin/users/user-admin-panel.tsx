"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import { toast } from "sonner";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type Row,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronsUpDown, Plus, Search, X } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAdminUsers,
  usePromoteAdmin,
  useDemoteAdmin,
  useDeactivateAccount,
  useDeleteAccount,
  useAddToLuma,
  useBoardRoleHolders,
  useTransferBoardRole,
  useAddBoardAdvisor,
  useRemoveBoardAdvisor,
  useSetMemberTeam,
  useBackfillMemberTeams,
} from "@/hooks/admin";
import { useInterviewSettings } from "@/hooks/applications";
import {
  BOARD_ROLE_LABELS,
  EXACTLY_ONE_BOARD_ROLES,
  type AdminUser,
  type BoardRole,
} from "@/types/admin";
import { APPLICATION_TEAMS, APPLICATION_TEAM_LABELS } from "@/types/applications";
import { useAuth } from "@/lib/providers/auth-provider/authProvider";
import { ConfirmPhraseDialog } from "@/components/admin/confirm-phrase-dialog";
import { AdminUserProfileForm } from "@/components/admin/users/admin-user-profile-form";
import { ManualOnboardingForm } from "@/components/admin/users/manual-onboarding-form";
import { OnboardingRecordsList } from "@/components/admin/users/onboarding-records-list";
import { OnboardingEmailSettingsPanel } from "@/components/admin/users/onboarding-email-settings";

const DELETE_ACCOUNT_CONFIRM_PHRASE = "DELETE THIS ACCOUNT";

const TEAM_TILE_KEYS = [...APPLICATION_TEAMS, "Unassigned"] as const;

function memberName(user: AdminUser) {
  return `${user.first_name} ${user.last_name}`.trim();
}

function memberSearchText(user: AdminUser) {
  return [
    user.email,
    memberName(user),
    user.team,
    user.board_role,
    ...user.roles,
  ]
    .join(" ")
    .toLowerCase();
}

function formatJoinedDate(value: string) {
  if (!value) return "Unknown";
  return new Intl.DateTimeFormat("en-SE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

// Every account is @kthais.com (the only domain allowed to log in at
// all), so there's no separate "just remove this login" action — but
// Google OAuth here isn't actually restricted to that domain (dev-seed's
// own admin account isn't, for instance), so this can't be assumed
// universally.
function canOffboardMember(user: AdminUser) {
  return user.email.toLowerCase().endsWith("@kthais.com");
}

// Lets a clickable-but-not-natively-interactive element (a Card or
// TableRow standing in for a button) respond to Enter/Space, matching
// resume-upload-field.tsx's keyboard-activation convention.
function onActivateKeyDown(handler: () => void) {
  return (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handler();
    }
  };
}

// A member's dashboard label: a board role (if any) supersedes Team the
// moment it's set.
function memberLabel(user: AdminUser): { text: string; isBoardRole: boolean } {
  if (user.board_role) {
    return {
      text: BOARD_ROLE_LABELS[user.board_role as BoardRole] ?? user.board_role,
      isBoardRole: true,
    };
  }
  return { text: user.team || "Unassigned", isBoardRole: false };
}

type PendingAction =
  | { type: "deactivate"; email: string }
  | { type: "delete-account"; email: string };

// What the Members dashboard's stat tiles and CTAs narrow the search view
// down to — kept as one discriminated filter rather than several booleans
// so a tile click can't leave a stale filter from a previous click active
// alongside it.
type MemberFilter =
  | { kind: "all" }
  | { kind: "admins" }
  | { kind: "team"; team: string }; // "" means Unassigned

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

/** A searchable "pick an existing member by email" combobox, for the board-role transfer dialog. */
function MemberEmailCombobox({
  users,
  value,
  onValueChange,
  placeholder,
}: {
  users: AdminUser[];
  value: string;
  onValueChange: (email: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-auto min-h-9 w-full justify-between px-2.5 py-1.5 text-left font-normal"
        >
          <span className={value ? undefined : "text-muted-foreground"}>
            {value || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) p-0">
        <Command>
          <CommandInput placeholder="Search by email..." />
          <CommandList>
            <CommandEmpty>No members found.</CommandEmpty>
            <CommandGroup>
              {users.map((user) => (
                <CommandItem
                  key={user.user_id}
                  value={user.email}
                  onSelect={(selected) => {
                    onValueChange(selected);
                    setOpen(false);
                  }}
                >
                  <div className="min-w-0">
                    <p className="truncate">{user.email}</p>
                    {memberName(user) && (
                      <p className="truncate text-xs text-muted-foreground">
                        {memberName(user)}
                      </p>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/** Self-service dialog for the current holder of one of the eight exactly-one board roles to hand it to someone else. */
function TransferBoardRoleDialog({
  open,
  onOpenChange,
  role,
  currentAdminEmail,
  users,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: BoardRole | null;
  currentAdminEmail: string;
  users: AdminUser[];
}) {
  const [toEmail, setToEmail] = useState("");
  const transfer = useTransferBoardRole();

  const candidates = useMemo(
    () =>
      users.filter(
        (user) =>
          user.email !== currentAdminEmail &&
          user.roles.includes("admin") &&
          !user.deactivated_at,
      ),
    [users, currentAdminEmail],
  );

  function handleOpenChange(next: boolean) {
    if (!next) setToEmail("");
    onOpenChange(next);
  }

  if (!role) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer {BOARD_ROLE_LABELS[role]}</DialogTitle>
          <DialogDescription>
            You&apos;ll immediately lose this role yourself — there&apos;s no
            way to hold it alongside the recipient, and no way to undo this
            except a transfer back. The recipient must already be an admin.
          </DialogDescription>
        </DialogHeader>
        <MemberEmailCombobox
          users={candidates}
          value={toEmail}
          onValueChange={setToEmail}
          placeholder="Select a member..."
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!toEmail || transfer.isPending}
            onClick={() => {
              transfer.mutate(
                { role, toEmail },
                { onSuccess: () => handleOpenChange(false) },
              );
            }}
          >
            {transfer.isPending ? "Transferring…" : "Transfer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function createMemberColumns(): ColumnDef<AdminUser>[] {
  return [
    {
      id: "member",
      accessorFn: memberName,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Member" className="-ml-2" />
      ),
      cell: ({ row }) => (
        <div className="min-w-44">
          <div className="flex items-center gap-2">
            <p className="font-medium">{memberName(row.original) || row.original.email}</p>
            {row.original.deactivated_at && (
              <Badge variant="outline" className="text-muted-foreground">
                Deactivated
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      ),
    },
    {
      id: "label",
      accessorFn: (user) => memberLabel(user).text,
      header: "Team / Board role",
      cell: ({ row }) => {
        const label = memberLabel(row.original);
        return (
          <Badge
            variant={label.isBoardRole ? undefined : "outline"}
            className={
              label.isBoardRole
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                : undefined
            }
          >
            {label.text}
          </Badge>
        );
      },
    },
    {
      id: "roles",
      accessorFn: (user) => user.roles.join(", "),
      header: "Roles",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.roles.map((role) => (
            <span
              key={role}
              className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold tracking-wider text-primary uppercase"
            >
              {role}
            </span>
          ))}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Joined" className="-ml-2" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs">{formatJoinedDate(row.original.created_at)}</span>
      ),
    },
  ];
}

function memberGlobalFilter(row: Row<AdminUser>, _columnId: string, filterValue: string) {
  const search = filterValue.trim().toLowerCase();
  if (!search) return true;
  return memberSearchText(row.original).includes(search);
}

function MembersTable({
  users,
  filter,
  searchQuery,
  onSearchQueryChange,
  onSelectUser,
}: {
  users: AdminUser[];
  filter: MemberFilter;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSelectUser: (user: AdminUser) => void;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const filteredData = useMemo(() => {
    // A typed search is a specific lookup — e.g. to find a deactivated
    // member and finish permanently deleting them — and must not stay
    // scoped to whichever dashboard tile happened to be open before the
    // admin started typing, or a match outside that tile's cohort (a
    // deactivated non-admin found from the Admins tile, say) would look
    // like it doesn't exist. Only apply the tile cohort and the
    // exclude-deactivated default while the search box is empty.
    if (searchQuery.trim()) {
      return users;
    }
    switch (filter.kind) {
      case "admins":
        return users.filter((user) => user.roles.includes("admin") && !user.deactivated_at);
      case "team":
        return users.filter(
          (user) => (user.team || "") === filter.team && !user.board_role && !user.deactivated_at,
        );
      default:
        return users.filter((user) => !user.deactivated_at);
    }
  }, [users, filter, searchQuery]);

  const columns = useMemo(() => createMemberColumns(), []);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter: searchQuery },
    globalFilterFn: memberGlobalFilter,
    onSortingChange: setSorting,
    onGlobalFilterChange: (value) => onSearchQueryChange(String(value ?? "")),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Members</CardTitle>
        <CardDescription>Search, filter, and open a member for actions.</CardDescription>
        <CardAction>
          <Badge variant="outline">
            {table.getFilteredRowModel().rows.length} result
            {table.getFilteredRowModel().rows.length === 1 ? "" : "s"}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, team, or role..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`View ${memberName(row.original)}`}
                    className="cursor-pointer"
                    onClick={() => onSelectUser(row.original)}
                    onKeyDown={onActivateKeyDown(() => onSelectUser(row.original))}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
                    No members found.
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
  );
}

function MemberDetailSheet({
  user,
  isHeadOfIT,
  currentAdminEmail,
  onDeactivateRequest,
  onDeleteRequest,
}: {
  user: AdminUser;
  isHeadOfIT: boolean;
  currentAdminEmail: string;
  onDeactivateRequest: (email: string) => void;
  onDeleteRequest: (email: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const promoteMutation = usePromoteAdmin();
  const demoteMutation = useDemoteAdmin();
  const addToLuma = useAddToLuma();
  const setTeam = useSetMemberTeam();
  const addBoardAdvisor = useAddBoardAdvisor();
  const removeBoardAdvisor = useRemoveBoardAdvisor();

  const isAdmin = user.roles.includes("admin");
  const canOffboard = canOffboardMember(user);
  const isBoardAdvisor = user.board_role === "board_advisor";
  const holdsOtherBoardRole = user.board_role !== "" && !isBoardAdvisor;
  const isDeactivated = Boolean(user.deactivated_at);

  async function handlePromote() {
    try {
      await promoteMutation.mutateAsync(user.user_id);
      toast.success(`${user.email} is now an admin.`);
    } catch {
      toast.error("Failed to promote user.");
    }
  }

  async function handleDemote() {
    try {
      await demoteMutation.mutateAsync(user.user_id);
      toast.success(`${user.email} is no longer an admin.`);
    } catch {
      toast.error("Failed to demote user.");
    }
  }

  if (isEditing) {
    return (
      <>
        <SheetHeader>
          <SheetTitle>Edit member profile</SheetTitle>
          <SheetDescription className="font-mono text-xs break-all">
            {user.email} · {user.user_id}
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6">
          <AdminUserProfileForm userId={user.user_id} onClose={() => setIsEditing(false)} />
        </div>
      </>
    );
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle>{memberName(user) || user.email}</SheetTitle>
        <SheetDescription>{user.email}</SheetDescription>
      </SheetHeader>
      <div className="space-y-6 px-4 pb-6">
        <div className="flex flex-wrap gap-2">
          {user.roles.map((role) => (
            <span
              key={role}
              className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold tracking-wider text-primary uppercase"
            >
              {role}
            </span>
          ))}
          {user.board_role && (
            <span className="rounded-full bg-amber-500/15 px-2 py-1 text-[10px] font-bold tracking-wider text-amber-700 uppercase dark:text-amber-400">
              {BOARD_ROLE_LABELS[user.board_role as BoardRole] ?? user.board_role}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={promoteMutation.isPending || demoteMutation.isPending}
            onClick={isAdmin ? handleDemote : handlePromote}
          >
            {isAdmin ? "Remove Admin" : "Make Admin"}
          </Button>
          {canOffboard && (
            <Button
              size="sm"
              variant="outline"
              disabled={addToLuma.isPending}
              onClick={() => addToLuma.mutate(user.email)}
            >
              Add to Luma Members
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Team
          </p>
          <NativeSelect
            className="w-full max-w-56"
            value={user.team}
            disabled={setTeam.isPending}
            onChange={(e) => setTeam.mutate({ email: user.email, team: e.target.value })}
          >
            <NativeSelectOption value="">Unassigned</NativeSelectOption>
            {APPLICATION_TEAMS.map((team) => (
              <NativeSelectOption key={team} value={team}>
                {APPLICATION_TEAM_LABELS[team]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Board Advisor
          </p>
          <div className="flex items-center gap-2">
            <Switch
              checked={isBoardAdvisor}
              disabled={
                holdsOtherBoardRole || addBoardAdvisor.isPending || removeBoardAdvisor.isPending
              }
              onCheckedChange={(checked) => {
                if (checked) addBoardAdvisor.mutate(user.email);
                else removeBoardAdvisor.mutate(user.email);
              }}
            />
            <span className="text-sm text-muted-foreground">
              {holdsOtherBoardRole
                ? `Can't be a Board Advisor while holding ${BOARD_ROLE_LABELS[user.board_role as BoardRole]}.`
                : "Any admin can add or remove Board Advisors."}
            </span>
          </div>
        </div>

        {holdsOtherBoardRole && (
          <p className="text-sm text-muted-foreground">
            Holds {BOARD_ROLE_LABELS[user.board_role as BoardRole] ?? user.board_role} — the
            only way this changes hands is a transfer initiated by{" "}
            {user.email === currentAdminEmail ? "you" : "them"}, from the &quot;My Board
            Role&quot; panel.
          </p>
        )}

        {isHeadOfIT && canOffboard && (
          <div className="space-y-2 border-t pt-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Offboarding
            </p>
            {isDeactivated && (
              <p className="text-sm text-muted-foreground">
                Already deactivated. Permanently deleting is still available below.
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {!isDeactivated && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDeactivateRequest(user.email)}
                >
                  Deactivate Account
                </Button>
              )}
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDeleteRequest(user.email)}
              >
                Delete account
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export function UserAdminPanel({
  activeTab,
  onActiveTabChange,
}: {
  activeTab: "members" | "onboarding";
  onActiveTabChange: (tab: "members" | "onboarding") => void;
}) {
  const [membersView, setMembersView] = useState<"dashboard" | "search">("dashboard");
  const [memberFilter, setMemberFilter] = useState<MemberFilter>({ kind: "all" });
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnboardingForm, setShowOnboardingForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [transferringRole, setTransferringRole] = useState<BoardRole | null>(null);
  const [backfillConfirmOpen, setBackfillConfirmOpen] = useState(false);

  const { user: authUser } = useAuth();
  const currentAdminEmail = authUser?.email ?? "";

  const { data: users = [], isLoading, isError } = useAdminUsers();
  const { data: interviewSettings } = useInterviewSettings();
  const isHeadOfIT = interviewSettings?.is_head_of_it === true;
  const { data: boardRoleHolders } = useBoardRoleHolders();
  const deactivate = useDeactivateAccount();
  const deleteAccount = useDeleteAccount();
  const backfillTeams = useBackfillMemberTeams();

  const clearPendingAction = () => setPendingAction(null);

  const selectedUser = useMemo(
    () => users.find((user) => user.user_id === selectedUserId) ?? null,
    [users, selectedUserId],
  );

  const myBoardRole = useMemo(() => {
    if (!boardRoleHolders || !currentAdminEmail) return null;
    return (
      EXACTLY_ONE_BOARD_ROLES.find((role) => boardRoleHolders[role] === currentAdminEmail) ??
      null
    );
  }, [boardRoleHolders, currentAdminEmail]);

  function openSearch(filter: MemberFilter) {
    setMemberFilter(filter);
    setSearchQuery("");
    setMembersView("search");
  }

  const stats = useMemo(() => {
    // A deactivated member isn't a current member for headcount purposes
    // — see AdminUser.deactivated_at's doc comment for why they're still
    // present in `users` at all (so they stay findable elsewhere).
    const activeUsers = users.filter((user) => !user.deactivated_at);
    const teamCounts: Record<string, number> = {};
    for (const team of TEAM_TILE_KEYS) teamCounts[team] = 0;
    for (const user of activeUsers) {
      if (!user.board_role) {
        const key = (user.team || "Unassigned") as (typeof TEAM_TILE_KEYS)[number];
        teamCounts[key] = (teamCounts[key] ?? 0) + 1;
      }
    }
    return {
      total: activeUsers.length,
      admins: activeUsers.filter((user) => user.roles.includes("admin")).length,
      teamCounts,
    };
  }, [users]);

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => onActiveTabChange(value as "members" | "onboarding")}
      className="space-y-4"
    >
      <TabsList>
        <TabsTrigger value="members">Members</TabsTrigger>
        <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
      </TabsList>

      <TabsContent value="onboarding" className="space-y-4">
        <div className="flex justify-end">
          {!showOnboardingForm && (
            <Button size="sm" onClick={() => setShowOnboardingForm(true)}>
              <Plus className="mr-2 h-4 w-4" /> Onboard Member
            </Button>
          )}
        </div>

        {showOnboardingForm && (
          <Card className="border-primary/30 shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Onboard Member</CardTitle>
                <CardDescription className="mt-1">
                  For members joining outside the recruitment pipeline (board
                  appointments, special cases). Creates a real @kthais.com
                  account and Mattermost invite.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => setShowOnboardingForm(false)}
                aria-label="Close onboarding form"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <ManualOnboardingForm onClose={() => setShowOnboardingForm(false)} />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Onboarding status</CardTitle>
            <CardDescription>
              Everyone who&apos;s been sent an onboarding link, manual or from
              recruitment. Rows highlighted in red haven&apos;t completed
              within a week — worth following up.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OnboardingRecordsList />
          </CardContent>
        </Card>

        <OnboardingEmailSettingsPanel />
      </TabsContent>

      <TabsContent value="members" className="space-y-4">
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading users...
          </div>
        ) : isError ? (
          <div className="py-8 text-center text-destructive">
            Failed to load users.
          </div>
        ) : membersView === "dashboard" ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              <Card
                role="button"
                tabIndex={0}
                aria-label="Total Members"
                className="cursor-pointer transition-colors hover:bg-muted/50"
                onClick={() => openSearch({ kind: "all" })}
                onKeyDown={onActivateKeyDown(() => openSearch({ kind: "all" }))}
              >
                <CardHeader className="pb-2">
                  <CardDescription>Total Members</CardDescription>
                  <CardTitle className="font-mono text-2xl">{stats.total}</CardTitle>
                </CardHeader>
              </Card>
              <Card
                role="button"
                tabIndex={0}
                aria-label="Admins"
                className="cursor-pointer transition-colors hover:bg-muted/50"
                onClick={() => openSearch({ kind: "admins" })}
                onKeyDown={onActivateKeyDown(() => openSearch({ kind: "admins" }))}
              >
                <CardHeader className="pb-2">
                  <CardDescription>Admins</CardDescription>
                  <CardTitle className="font-mono text-2xl">{stats.admins}</CardTitle>
                </CardHeader>
              </Card>
              {TEAM_TILE_KEYS.map((team) => (
                <Card
                  key={team}
                  role="button"
                  tabIndex={0}
                  aria-label={team === "Unassigned" ? team : APPLICATION_TEAM_LABELS[team]}
                  className="cursor-pointer transition-colors hover:bg-muted/50"
                  onClick={() => openSearch({ kind: "team", team: team === "Unassigned" ? "" : team })}
                  onKeyDown={onActivateKeyDown(() =>
                    openSearch({ kind: "team", team: team === "Unassigned" ? "" : team }),
                  )}
                >
                  <CardHeader className="pb-2">
                    <CardDescription>
                      {team === "Unassigned" ? team : APPLICATION_TEAM_LABELS[team]}
                    </CardDescription>
                    <CardTitle className="font-mono text-2xl">
                      {stats.teamCounts[team] ?? 0}
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {stats.teamCounts.Unassigned > 0 && (
              <div className="flex items-center justify-between gap-3 rounded-md border border-dashed px-4 py-3 text-sm">
                <span className="text-muted-foreground">
                  {stats.teamCounts.Unassigned} member{stats.teamCounts.Unassigned === 1 ? "" : "s"} with
                  no team set.
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setBackfillConfirmOpen(true)}
                >
                  Backfill Teams
                </Button>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Board</CardTitle>
                <CardDescription>
                  Eight roles change hands only by transfer from the current holder; Board
                  Advisor has no single holder and is managed from a member&apos;s own panel.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2 sm:grid-cols-2">
                {EXACTLY_ONE_BOARD_ROLES.map((role) => (
                  <div key={role} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                    <span className="font-medium">{BOARD_ROLE_LABELS[role]}</span>
                    <span className="text-muted-foreground">
                      {boardRoleHolders?.[role] ?? "Vacant"}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm sm:col-span-2">
                  <span className="font-medium">Board Advisors</span>
                  <span className="text-muted-foreground">
                    {boardRoleHolders?.board_advisor?.length
                      ? boardRoleHolders.board_advisor.join(", ")
                      : "None"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {myBoardRole && (
              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle>My Board Role</CardTitle>
                  <CardDescription>
                    You are: {BOARD_ROLE_LABELS[myBoardRole]}
                  </CardDescription>
                  <CardAction>
                    <Button size="sm" onClick={() => setTransferringRole(myBoardRole)}>
                      Transfer to someone else
                    </Button>
                  </CardAction>
                </CardHeader>
              </Card>
            )}
          </>
        ) : (
          <>
            <Button variant="ghost" size="sm" onClick={() => setMembersView("dashboard")}>
              ← Back to dashboard
            </Button>
            <MembersTable
              users={users}
              filter={memberFilter}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              onSelectUser={(user) => setSelectedUserId(user.user_id)}
            />
          </>
        )}

        <Sheet
          open={Boolean(selectedUser)}
          onOpenChange={(open) => {
            if (!open) setSelectedUserId(null);
          }}
        >
          <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
            {selectedUser && (
              <MemberDetailSheet
                user={selectedUser}
                isHeadOfIT={isHeadOfIT}
                currentAdminEmail={currentAdminEmail}
                onDeactivateRequest={(email) => setPendingAction({ type: "deactivate", email })}
                onDeleteRequest={(email) => setPendingAction({ type: "delete-account", email })}
              />
            )}
          </SheetContent>
        </Sheet>

        <TransferBoardRoleDialog
          open={transferringRole !== null}
          onOpenChange={(open) => { if (!open) setTransferringRole(null); }}
          role={transferringRole}
          currentAdminEmail={currentAdminEmail}
          users={users}
        />

        <AlertDialog open={backfillConfirmOpen} onOpenChange={setBackfillConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Backfill teams from applications?</AlertDialogTitle>
              <AlertDialogDescription>
                For every member with no team set, looks up their most recent accepted
                application by their @kthais.com email and fills in the team they were
                accepted into. Members with no matching application are left as
                Unassigned. Never overwrites a team that&apos;s already set, and skips
                anyone holding a board role — board members aren&apos;t team members.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={backfillTeams.isPending}
                onClick={() => {
                  backfillTeams.mutate();
                  setBackfillConfirmOpen(false);
                }}
              >
                Yes, backfill
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog
          open={pendingAction?.type === "deactivate"}
          onOpenChange={(open) => { if (!open) clearPendingAction(); }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deactivate {pendingAction?.email}?</AlertDialogTitle>
              <AlertDialogDescription>
                Suspends their Google Workspace account and deactivates their Mattermost
                account. Reversible any time from each system&apos;s own admin console.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={deactivate.isPending}
                onClick={() => {
                  if (pendingAction) deactivate.mutate(pendingAction.email);
                  clearPendingAction();
                }}
              >
                Yes, deactivate
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <ConfirmPhraseDialog
          open={pendingAction?.type === "delete-account"}
          onOpenChange={(open) => { if (!open) clearPendingAction(); }}
          title={`Permanently delete ${pendingAction?.email}?`}
          description={
            <>
              Permanently deletes their Google Workspace account, attempts to permanently
              delete their Mattermost account, and removes their login from this site. This
              cannot be undone. Type{" "}
              <span className="font-mono font-semibold">{DELETE_ACCOUNT_CONFIRM_PHRASE}</span>{" "}
              exactly to confirm.
            </>
          }
          phrase={DELETE_ACCOUNT_CONFIRM_PHRASE}
          isPending={deleteAccount.isPending}
          onConfirm={() => {
            if (pendingAction) {
              deleteAccount.mutate({
                email: pendingAction.email,
                confirm: DELETE_ACCOUNT_CONFIRM_PHRASE,
              });
            }
          }}
        />
      </TabsContent>
    </Tabs>
  );
}
