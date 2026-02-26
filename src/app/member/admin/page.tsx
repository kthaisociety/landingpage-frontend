"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { AdminWorkspace } from "@/components/admin/admin-workspace";
import { AsciiGrid } from "@/components/ui/ascii-grid";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function MemberAdminPage() {
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

  return (
    <div className="min-w-screen">
      <section className="relative text-secondary-black pt-54 pb-24 overflow-hidden">
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
      </section>

      <section className="relative pb-16">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6">
          <div className="animate-fade-in">
            <Card className="profile-card-shadow">
              <CardHeader>
                <CardTitle className="text-2xl font-display font-bold flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6" />
                  Member Admin
                </CardTitle>
                <CardDescription>
                  Manage companies, jobs, and projects from the admin workspace.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminWorkspace />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

