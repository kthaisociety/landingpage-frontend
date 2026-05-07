"use client";

import { Fragment, useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
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
  useAdminUsers,
  usePromoteAdmin,
  useDemoteAdmin,
} from "@/hooks/admin";
import { AdminUserProfileForm } from "@/components/admin/users/admin-user-profile-form";

export function UserAdminPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const { data: users = [], isLoading, isError } = useAdminUsers();
  const promoteMutation = usePromoteAdmin();
  const demoteMutation = useDemoteAdmin();

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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

  if (isLoading)
    return (
      <div className="py-8 text-center text-muted-foreground">
        Loading users...
      </div>
    );
  if (isError)
    return (
      <div className="py-8 text-center text-destructive">
        Failed to load users.
      </div>
    );

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by email..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-md"
      />

      <div className="max-h-[min(70vh,720px)] space-y-3 overflow-y-auto pr-2">
        {filteredUsers.length === 0 ? (
          <p className="py-4 text-muted-foreground">No users found.</p>
        ) : (
          filteredUsers.map((user) => {
            const isAdmin = user.roles.includes("admin");
            const isWorking =
              promoteMutation.isPending || demoteMutation.isPending;
            const isEditing = editingUserId === user.user_id;

            return (
              <Fragment key={user.user_id}>
                <div className="flex flex-col justify-between gap-4 rounded-lg border p-4 transition-colors hover:bg-secondary/20 sm:flex-row sm:items-center">
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
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Button
                      variant={isEditing ? "secondary" : "outline"}
                      size="sm"
                      onClick={() =>
                        setEditingUserId(isEditing ? null : user.user_id)
                      }
                    >
                      {isEditing ? "Close editor" : "Edit profile"}
                    </Button>
                    {isAdmin ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={isWorking}
                        onClick={() => handleDemote(user.user_id, user.email)}
                      >
                        Remove Admin
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isWorking}
                        onClick={() => handlePromote(user.user_id, user.email)}
                      >
                        Make Admin
                      </Button>
                    )}
                  </div>
                </div>

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
    </div>
  );
}
