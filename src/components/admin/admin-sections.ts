import {
  Briefcase,
  Building2,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AdminSection = {
  /** Short text for the sidebar / mobile dropdown. */
  label: string;
  /** Each section is its own page under /member/admin. */
  href: string;
  icon: LucideIcon;
};

export const ADMIN_SECTIONS: AdminSection[] = [
  { label: "Overview", href: "/member/admin/overview", icon: LayoutDashboard },
  { label: "Members", href: "/member/admin/members", icon: Users },
  { label: "Applications", href: "/member/admin/applications", icon: FileText },
  { label: "Companies", href: "/member/admin/companies", icon: Building2 },
  { label: "Jobs", href: "/member/admin/jobs", icon: Briefcase },
  { label: "Projects", href: "/member/admin/projects", icon: FolderKanban },
];

export function isActiveSection(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Where /member/admin itself sends you. */
export const ADMIN_HOME = ADMIN_SECTIONS[0].href;
