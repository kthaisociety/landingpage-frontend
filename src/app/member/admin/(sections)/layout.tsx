"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { ADMIN_SECTIONS, isActiveSection } from "@/components/admin/admin-sections";
import { AsciiGrid } from "@/components/ui/ascii-grid";
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

// Shared shell for every admin section page (/member/admin/members, …).
// Lives in a route group so the older form pages under /member/admin
// (jobs/new, companies/[companyId], …) keep their own layout.
export default function AdminSectionsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminTextMask, setAdminTextMask] = useState<string | undefined>();

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "bold 200px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Admin", canvas.width / 2, canvas.height / 2);
    const dataUrl = canvas.toDataURL("image/png");
    requestAnimationFrame(() => setAdminTextMask(dataUrl));
  }, []);

  const activeSection =
    ADMIN_SECTIONS.find((section) => isActiveSection(pathname, section.href)) ??
    ADMIN_SECTIONS[0];

  return (
    <div className="min-w-screen">
      <section className="relative text-secondary-black pt-64 pb-6 overflow-hidden">
        <div className="absolute inset-0">
          <AsciiGrid
            color="rgba(0, 0, 0, 0.2)"
            cellSize={12}
            logoSrc={adminTextMask}
            logoPosition="center"
            logoScale={0.9}
            enableDripping={false}
            className="w-full h-full"
          />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-white via-white/50 to-transparent pointer-events-none" />
        </div>

        {/* Same banner title treatment as the other pages (Login, Events, …). */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h4 className="text-3xl mb-2 tracking-tighter">
            <span className="font-times font-normal text-primary">(Admins)</span>
          </h4>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">Admin Panel</h1>
        </div>
      </section>

      <section className="relative pt-8 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-fade-in flex flex-col gap-8 md:flex-row md:items-start md:gap-12">
            <AdminSidebar />

            <div className="min-w-0 flex-1 space-y-4">
              {/* Below md the sidebar is hidden, so sections switch from here. */}
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Section: {activeSection.label}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel>Admin sections</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup
                      value={activeSection.href}
                      onValueChange={(href) => router.push(href)}
                    >
                      {ADMIN_SECTIONS.map((section) => (
                        <DropdownMenuRadioItem key={section.href} value={section.href}>
                          {section.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {children}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
