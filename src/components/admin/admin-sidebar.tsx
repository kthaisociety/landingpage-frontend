"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { API_URL } from "@/config";
import { ADMIN_SECTIONS, isActiveSection } from "@/components/admin/admin-sections";
import { useAdminUsers } from "@/hooks/admin";
import { useMemberProfile } from "@/hooks/member";
import { cn } from "@/lib/utils";
import { BOARD_ROLE_LABELS, type BoardRole } from "@/types/admin";
import { APPLICATION_TEAM_LABELS, type ApplicationTeam } from "@/types/applications";

// What the admin does, for the line under their name: their board role if
// they hold one ("Head of IT"), else their team ("AI Research team").
function describeFunction(boardRole?: string, team?: string): string {
  if (boardRole) return BOARD_ROLE_LABELS[boardRole as BoardRole] ?? boardRole;
  if (team) return `${APPLICATION_TEAM_LABELS[team as ApplicationTeam] ?? team} team`;
  return "Admin";
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: profile } = useMemberProfile();
  // Same cached list the Members page uses; it carries board role and team.
  const { data: users } = useAdminUsers();

  const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ");
  const initials =
    [profile?.firstName, profile?.lastName]
      .map((part) => part?.trim().charAt(0).toUpperCase())
      .filter(Boolean)
      .join("") || "?";
  const me = users?.find(
    (user) => user.email.toLowerCase() === profile?.email?.toLowerCase(),
  );
  const subtitle = describeFunction(me?.board_role, me?.team);

  return (
    <aside className="hidden w-60 shrink-0 md:sticky md:top-28 md:block">
      <div className="flex flex-col items-center gap-3 text-center">
        <Avatar className="size-32">
          {profile?.profilePicture && (
            <AvatarImage
              src={`${API_URL}/profile/picture?id=${profile.profilePicture}`}
              alt={fullName}
              className="object-cover"
            />
          )}
          <AvatarFallback className="text-4xl font-semibold">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-lg font-semibold leading-tight">{fullName || "Admin"}</p>
          <p className="mt-1 text-base text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <nav className="mt-8 flex flex-col gap-1" aria-label="Admin sections">
        {ADMIN_SECTIONS.map(({ href, label, icon: Icon }) => {
          const active = isActiveSection(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-secondary font-medium text-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
