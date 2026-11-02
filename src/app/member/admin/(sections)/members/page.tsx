"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import { UserAdminPanel } from "@/components/admin/users/user-admin-panel";

const TAB_COPY = {
  members: {
    title: "Directory",
    description: "Search, edit, and manage admin and Head-of-IT access.",
  },
  onboarding: {
    title: "Onboarding",
    description: "Manually onboard members and track outstanding invites.",
  },
} as const;

type MembersTab = keyof typeof TAB_COPY;

const PAGE_PATH = "/member/admin/members";

// The open tab lives in the URL (?tab=onboarding) so other pages, like the
// Overview, can link straight to it.
export default function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: tabParam } = use(searchParams);
  const router = useRouter();
  const tab: MembersTab = tabParam === "onboarding" ? "onboarding" : "members";

  const setTab = (next: MembersTab) =>
    router.replace(next === "members" ? PAGE_PATH : `${PAGE_PATH}?tab=${next}`, {
      scroll: false,
    });

  return (
    <>
      <AdminSectionHeader {...TAB_COPY[tab]} />
      <UserAdminPanel activeTab={tab} onActiveTabChange={setTab} />
    </>
  );
}
