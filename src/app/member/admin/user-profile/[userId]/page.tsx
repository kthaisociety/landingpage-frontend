"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminUserProfileForm } from "@/components/admin/users/admin-user-profile-form";

export default function AdminEditUserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const router = useRouter();
  const { userId } = use(params);

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      <div className="space-y-2">
        <Button
          variant="ghost"
          className="pl-0 text-muted-foreground hover:text-foreground"
          onClick={() => router.back()}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Workspace
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Edit member profile</h1>
        <p className="text-sm text-muted-foreground">
          Tip: you can also open this editor from the Members list without leaving
          the page.
        </p>
      </div>

      <AdminUserProfileForm
        userId={userId}
        onClose={() => router.back()}
      />
    </div>
  );
}
