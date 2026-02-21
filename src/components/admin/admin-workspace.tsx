"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
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

type AdminSection = {
  id: "companies" | "jobs" | "projects";
  label: string;
  description: string;
  content: ReactNode;
};

const adminSections: AdminSection[] = [
  {
    id: "companies",
    label: "Companies",
    description: "Add companies once and reuse them for jobs.",
    content: <CompanyAdminPanel />,
  },
  {
    id: "jobs",
    label: "Jobs",
    description: "Publish new job posts.",
    content: <JobAdminPanel />,
  },
  {
    id: "projects",
    label: "Projects",
    description: "Create project entries for the website.",
    content: <ProjectAdminPanel />,
  },
];

export function AdminWorkspace() {
  const [activeSectionId, setActiveSectionId] =
    useState<AdminSection["id"]>("companies");

  const activeSection = useMemo(() => {
    return (
      adminSections.find((section) => section.id === activeSectionId) ??
      adminSections[0]
    );
  }, [activeSectionId]);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium">{activeSection.label}</p>
          <p className="text-sm text-muted-foreground">{activeSection.description}</p>
        </div>
        <div className="flex items-center gap-2">
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

      <div>{activeSection.content}</div>
    </section>
  );
}
