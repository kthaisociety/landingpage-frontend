"use client";

import Link from "next/link"; 
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { useToast } from "@/hooks/use-toast";

import {
  useAdminUsers,
  usePromoteAdmin,
  useDemoteAdmin,
} from "@/hooks/admin"; 

export function UserAdminPanel() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: users = [], isLoading, isError } = useAdminUsers();
  const promoteMutation = usePromoteAdmin();
  const demoteMutation = useDemoteAdmin();

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handlePromote = async (userId: string, email: string) => {
    try {
      await promoteMutation.mutateAsync(userId);
      toast({ title: "Success", description: `${email} is now an admin.` });
    } catch {
      toast({
        title: "Error",
        description: "Failed to promote user.",
        variant: "destructive",
      });
    }
  };

  const handleDemote = async (userId: string, email: string) => {
    try {
      await demoteMutation.mutateAsync(userId);
      toast({
        title: "Success",
        description: `${email} is no longer an admin.`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to demote user.",
        variant: "destructive",
      });
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

      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {filteredUsers.length === 0 ? (
          <p className="text-muted-foreground py-4">No users found.</p>
        ) : (
          filteredUsers.map((user) => {
            const isAdmin = user.roles.includes("admin");
            const isWorking =
              promoteMutation.isPending || demoteMutation.isPending;

            return (
              <div
                key={user.user_id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-secondary/20 transition-colors gap-4"
              >
                <div>
                  <h3 className="font-medium">{user.email}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {user.roles.map((role) => (
                      <span
                        key={role}
                        className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 bg-primary/10 text-primary rounded-full"
                      >
                        {role}
                      </span>
                    ))}
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 bg-secondary text-secondary-foreground rounded-full">
                      {user.provider}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <Link href={`/member/admin/user-profile/${user.user_id}`}>
                    <Button variant="outline" size="sm">
                      Edit Profile
                    </Button>
                  </Link>
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
            );
          })
        )}
      </div>
    </div>
  );
}
