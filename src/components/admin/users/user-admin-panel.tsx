"use client";

import { Fragment, useState } from "react";
import { toast } from "sonner";
import { MoreVertical, Plus, X } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAdminUsers,
  usePromoteAdmin,
  useDemoteAdmin,
  useDeactivateAccount,
  useDeleteAccount,
  useHeadsOfIT,
  useGrantHeadOfIT,
  useRevokeHeadOfIT,
  useAddToLuma,
} from "@/hooks/admin";
import { useInterviewSettings } from "@/hooks/applications";
import { ConfirmPhraseDialog } from "@/components/admin/confirm-phrase-dialog";
import { AdminUserProfileForm } from "@/components/admin/users/admin-user-profile-form";
import { ManualOnboardingForm } from "@/components/admin/users/manual-onboarding-form";
import { OnboardingRecordsList } from "@/components/admin/users/onboarding-records-list";
import { OnboardingEmailSettingsPanel } from "@/components/admin/users/onboarding-email-settings";

const DELETE_ACCOUNT_CONFIRM_PHRASE = "DELETE THIS ACCOUNT";

// Right-click on a member row for the actions below, rather than a row of
// buttons — everyone gets Edit Profile / Make Admin; only the head of IT
// sees the account-offboarding and Head-of-IT actions, on top of those.
// Every account is @kthais.com (that's the only domain allowed to log in
// at all), so there's no separate "just remove this login" action anymore —
// permanently deleting the real account (see PendingAction below) is the
// only delete, and it takes the local record with it too.
type PendingAction =
  | { type: "deactivate"; email: string }
  | { type: "delete-account"; email: string }
  | { type: "grant-head-of-it"; email: string }
  | { type: "revoke-head-of-it"; email: string };

export function UserAdminPanel({
  activeTab,
  onActiveTabChange,
}: {
  activeTab: "members" | "onboarding";
  onActiveTabChange: (tab: "members" | "onboarding") => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [adminsOnly, setAdminsOnly] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [showOnboardingForm, setShowOnboardingForm] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const { data: users = [], isLoading, isError } = useAdminUsers();
  const { data: interviewSettings } = useInterviewSettings();
  const isHeadOfIT = interviewSettings?.is_head_of_it === true;
  const { data: headsOfIT = [] } = useHeadsOfIT();
  const promoteMutation = usePromoteAdmin();
  const demoteMutation = useDemoteAdmin();
  const grantHeadOfIT = useGrantHeadOfIT();
  const revokeHeadOfIT = useRevokeHeadOfIT();
  const deactivate = useDeactivateAccount();
  const deleteAccount = useDeleteAccount();
  const addToLuma = useAddToLuma();

  const clearPendingAction = () => setPendingAction(null);

  const filteredUsers = users
    .filter((user) => user.email.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((user) => !adminsOnly || user.roles.includes("admin"));

  const handlePromote = async (userId: string, email: string) => {
    try {
      await promoteMutation.mutateAsync(userId);
      toast.success(`${email} is now an admin.`);
    } catch {
      toast.error("Failed to promote user.");
    }
  };

  const handleDemote = async (userId: string, email: string) => {
    try {
      await demoteMutation.mutateAsync(userId);
      toast.success(`${email} is no longer an admin.`);
    } catch {
      toast.error("Failed to demote user.");
    }
  };

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
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                placeholder="Search by email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
              <Button
                variant={adminsOnly ? "secondary" : "outline"}
                size="sm"
                aria-pressed={adminsOnly}
                onClick={() => setAdminsOnly((prev) => !prev)}
              >
                Admins only
              </Button>
              <p className="ml-auto text-xs text-muted-foreground">
                Right-click a row for actions.
              </p>
            </div>

            <div className="max-h-[min(70vh,720px)] space-y-3 overflow-y-auto pr-2">
              {filteredUsers.length === 0 ? (
                <p className="py-4 text-muted-foreground">No users found.</p>
              ) : (
                filteredUsers.map((user) => {
                  const isAdmin = user.roles.includes("admin");
                  const isEditing = editingUserId === user.user_id;
                  const isTargetHeadOfIT = headsOfIT.includes(user.email);
                  // Deactivate/Delete call onboarding-service, which 400s
                  // on anything outside @kthais.com — most accounts are
                  // that domain, but Google OAuth here isn't actually
                  // restricted to it (dev-seed's own admin account isn't,
                  // for instance), so this can't be assumed universally.
                  const canOffboard = user.email.toLowerCase().endsWith("@kthais.com");

                  // Shared between the right-click menu (mouse) and the
                  // kebab dropdown (keyboard/touch) so neither can drift
                  // out of sync with the other.
                  const menuActions: {
                    key: string;
                    label: string;
                    onSelect: () => void;
                    variant?: "destructive";
                    separatorBefore?: boolean;
                  }[] = [
                    {
                      key: "edit",
                      label: isEditing ? "Close editor" : "Edit Profile",
                      onSelect: () => setEditingUserId(isEditing ? null : user.user_id),
                    },
                    {
                      key: "admin",
                      label: isAdmin ? "Remove Admin" : "Make Admin",
                      onSelect: () =>
                        isAdmin
                          ? handleDemote(user.user_id, user.email)
                          : handlePromote(user.user_id, user.email),
                    },
                    ...(canOffboard
                      ? [
                          {
                            key: "add-to-luma",
                            label: "Add to Luma Members",
                            separatorBefore: true,
                            onSelect: () => addToLuma.mutate(user.email),
                          },
                        ]
                      : []),
                    ...(isHeadOfIT && isAdmin
                      ? [
                          {
                            key: "head-of-it",
                            label: isTargetHeadOfIT ? "Remove Head of IT" : "Make Head of IT",
                            onSelect: () =>
                              setPendingAction(
                                isTargetHeadOfIT
                                  ? { type: "revoke-head-of-it" as const, email: user.email }
                                  : { type: "grant-head-of-it" as const, email: user.email },
                              ),
                          },
                        ]
                      : []),
                    ...(isHeadOfIT && canOffboard
                      ? [
                          {
                            key: "deactivate",
                            label: "Deactivate Account",
                            separatorBefore: true,
                            onSelect: () =>
                              setPendingAction({ type: "deactivate" as const, email: user.email }),
                          },
                          {
                            key: "delete",
                            label: "Delete account",
                            variant: "destructive" as const,
                            onSelect: () =>
                              setPendingAction({
                                type: "delete-account" as const,
                                email: user.email,
                              }),
                          },
                        ]
                      : []),
                  ];

                  return (
                    <Fragment key={user.user_id}>
                      <ContextMenu>
                        <ContextMenuTrigger asChild>
                          <div className="flex items-start justify-between gap-2 rounded-lg border p-4 transition-colors hover:bg-secondary/20">
                            <div className="min-w-0">
                              <h3 className="font-medium">{user.email}</h3>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {user.roles.map((role) => (
                                  <span
                                    key={role}
                                    className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold tracking-wider text-primary uppercase"
                                  >
                                    {role}
                                  </span>
                                ))}
                                <span className="rounded-full bg-secondary px-2 py-1 text-[10px] font-bold tracking-wider text-secondary-foreground uppercase">
                                  {user.provider}
                                </span>
                                {isTargetHeadOfIT && (
                                  <span className="rounded-full bg-amber-500/15 px-2 py-1 text-[10px] font-bold tracking-wider text-amber-700 uppercase dark:text-amber-400">
                                    Head of IT
                                  </span>
                                )}
                              </div>
                            </div>
                            {/* Visible, keyboard-focusable equivalent of the
                                right-click menu above — the context menu's
                                trigger is a plain div and can't be reached
                                by Tab, so without this every action here
                                (including basic Edit Profile / Make Admin)
                                would be mouse-only. */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="shrink-0"
                                  aria-label={`Actions for ${user.email}`}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {menuActions.map((action) => (
                                  <Fragment key={action.key}>
                                    {action.separatorBefore && <DropdownMenuSeparator />}
                                    <DropdownMenuItem
                                      variant={action.variant}
                                      onSelect={action.onSelect}
                                    >
                                      {action.label}
                                    </DropdownMenuItem>
                                  </Fragment>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          {menuActions.map((action) => (
                            <Fragment key={action.key}>
                              {action.separatorBefore && <ContextMenuSeparator />}
                              <ContextMenuItem variant={action.variant} onSelect={action.onSelect}>
                                {action.label}
                              </ContextMenuItem>
                            </Fragment>
                          ))}
                        </ContextMenuContent>
                      </ContextMenu>

                      {isEditing && (
                        <Card className="border-primary/30 shadow-sm">
                          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                            <div className="min-w-0 pr-2">
                              <CardTitle className="text-lg">
                                Edit member profile
                              </CardTitle>
                              <CardDescription className="mt-1 font-mono text-xs break-all">
                                {user.email} · {user.user_id}
                              </CardDescription>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="shrink-0"
                              onClick={() => setEditingUserId(null)}
                              aria-label="Close profile editor"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </CardHeader>
                          <CardContent>
                            <AdminUserProfileForm
                              userId={user.user_id}
                              onClose={() => setEditingUserId(null)}
                            />
                          </CardContent>
                        </Card>
                      )}
                    </Fragment>
                  );
                })
              )}
            </div>
          </>
        )}

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

        <AlertDialog
          open={pendingAction?.type === "grant-head-of-it"}
          onOpenChange={(open) => { if (!open) clearPendingAction(); }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Make {pendingAction?.email} a head of IT?</AlertDialogTitle>
              <AlertDialogDescription>
                They&apos;ll be able to deactivate or permanently delete any @kthais.com
                member&apos;s account, alongside every other current head of IT — this
                doesn&apos;t affect your own access.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={grantHeadOfIT.isPending}
                onClick={() => {
                  if (pendingAction) grantHeadOfIT.mutate(pendingAction.email);
                  clearPendingAction();
                }}
              >
                Yes, make them head of IT
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog
          open={pendingAction?.type === "revoke-head-of-it"}
          onOpenChange={(open) => { if (!open) clearPendingAction(); }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove {pendingAction?.email} as head of IT?</AlertDialogTitle>
              <AlertDialogDescription>
                They&apos;ll lose access to account offboarding. Refused if they&apos;re
                currently the only head of IT — there always has to be at least one.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={revokeHeadOfIT.isPending}
                onClick={() => {
                  if (pendingAction) revokeHeadOfIT.mutate(pendingAction.email);
                  clearPendingAction();
                }}
              >
                Yes, remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TabsContent>
    </Tabs>
  );
}
