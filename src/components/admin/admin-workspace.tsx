"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
// Add this import
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CompanyAdminPanel } from "@/components/admin/companies/company-admin-panel";
import { JobAdminPanel } from "@/components/admin/jobs/job-admin-panel";
import { ProjectAdminPanel } from "@/components/admin/projects/project-admin-panel";
import { UserAdminPanel } from "@/components/admin/users/user-admin-panel"; // Import the new panel
import { ApplicationAdminPanel } from "@/components/admin/applications/application-admin-panel";

// Added "users" to the ID union type
type AdminSection = {
  id: "users" | "applications" | "companies" | "jobs" | "projects";
  /** Short text for the nav pill / mobile dropdown. */
  label: string;
  /** The section's actual page title — rendered big, once, here — so adding a
   * new admin page never means writing a duplicate title inside its content. */
  title: string;
  description: string;
  content: ReactNode;
};

const adminSections: AdminSection[] = [
  {
    id: "users",
    label: "Users",
    title: "Users",
    description: "Manage users and assign admin roles.",
    content: <UserAdminPanel />,
  },
  {
    id: "applications",
    label: "Applications",
    // Unused for rendering — Applications has its own sub-tabs (General
    // Information / Team Questions), so AdminWorkspace computes its title
    // from applicationsTab instead. Kept here for type-shape consistency.
    title: "Applications",
    description: "Review general applications and manage the interview pipeline.",
    content: null,
  },
  {
    id: "companies",
    label: "Companies",
    title: "Companies",
    description: "Manage company profiles used for job postings.",
    content: <CompanyAdminPanel />,
  },
  {
    id: "jobs",
    label: "Jobs",
    title: "Job Posts",
    description: "Manage roles for the KTH AIS community.",
    content: <JobAdminPanel />,
  },
  {
    id: "projects",
    label: "Projects",
    title: "Project entries",
    description: "Manage your showcase projects here.",
    content: <ProjectAdminPanel />,
  },
];

const APPLICATIONS_TAB_COPY = {
  general: {
    title: "General Information",
    description: "Review general applications and manage the interview pipeline.",
  },
  "team-questions": {
    title: "Team Questions",
    description: "Send, track, and review team-specific follow-up answers.",
  },
  "recruitment-period": {
    title: "Settings",
    description: "Deadline, closed-page copy, and recruitment decisions.",
  },
} as const;

export function AdminWorkspace() {
  const [activeSectionId, setActiveSectionId] =
    useState<AdminSection["id"]>("users"); // Defaulting to the new users tab
  const [applicationsTab, setApplicationsTab] =
    useState<"general" | "team-questions" | "recruitment-period">("general");

  const activeSection = useMemo(() => {
    return (
      adminSections.find((section) => section.id === activeSectionId) ??
      adminSections[0]
    );
  }, [activeSectionId]);

  const isApplications = activeSectionId === "applications";
  const { title, description } = isApplications
    ? APPLICATIONS_TAB_COPY[applicationsTab]
    : activeSection;

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* The one place any admin page's title is rendered — pages never
            carry their own duplicate title, they just supply the text. */}
        <div className="max-w-md">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Section: {activeSection.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Admin sections</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={activeSectionId}
                  onValueChange={(value) =>
                    setActiveSectionId(value as AdminSection["id"])
                  }
                >
                  {adminSections.map((section) => (
                    <DropdownMenuRadioItem key={section.id} value={section.id}>
                      {section.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="hidden flex-wrap items-center gap-2 sm:flex">
            {adminSections.map((section) => (
              <Button
                key={section.id}
                size="sm"
                variant={section.id === activeSectionId ? "secondary" : "ghost"}
                onClick={() => setActiveSectionId(section.id)}
              >
                {section.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div>
        {isApplications ? (
          <ApplicationAdminPanel
            activeTab={applicationsTab}
            onActiveTabChange={setApplicationsTab}
          />
        ) : (
          activeSection.content
        )}
      </div>
    </section>
  );
}
