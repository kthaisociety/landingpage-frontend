"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ADMIN_SECTIONS } from "@/components/admin/admin-sections";

// Pages that render without the site footer: the admin section pages.
// The footer itself stays a server component; this client wrapper only
// decides whether to show it.
const PATHS_WITHOUT_FOOTER = new Set(ADMIN_SECTIONS.map((section) => section.href));

export function FooterVisibility({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (PATHS_WITHOUT_FOOTER.has(pathname)) return null;
  return children;
}
