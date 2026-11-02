"use client";

import { useState } from "react";
import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import { ApplicationAdminPanel } from "@/components/admin/applications/application-admin-panel";

const TAB_COPY = {
  general: {
    title: "General Information",
    description: "Review general applications and manage the interview pipeline.",
  },
  "team-questions": {
    title: "Team Questions",
    description: "Send, track, and review team-specific follow-up answers.",
  },
  analytics: {
    title: "Analytics",
    description: "Applicant volume and submission trends across teams.",
  },
  "recruitment-period": {
    title: "Settings",
    description: "Deadline, closed-page copy, and recruitment decisions.",
  },
} as const;

export default function AdminApplicationsPage() {
  const [tab, setTab] = useState<keyof typeof TAB_COPY>("general");

  return (
    <>
      <AdminSectionHeader {...TAB_COPY[tab]} />
      <ApplicationAdminPanel activeTab={tab} onActiveTabChange={setTab} />
    </>
  );
}
