"use client";

import { useEffect, useState } from "react";
import { User, Calendar, Briefcase } from "lucide-react";
import { AsciiGrid } from "@/components/ui/ascii-grid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MemberProfileForm } from "@/components/member/member-profile-form";
import { MemberEventSelection } from "@/components/member/member-event-selection";
import { MemberProjectSelection } from "@/components/member/member-project-selection";

export default function MemberDashboardPage() {
  const [dashboardTextMask, setDashboardTextMask] = useState<string | undefined>();

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
    const text = "Dashboard";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    const dataUrl = canvas.toDataURL("image/png");
    requestAnimationFrame(() => setDashboardTextMask(dataUrl));
  }, []);

  return (
    <div className="min-w-screen">
      <section className="relative text-secondary-black pt-54 pb-24 overflow-hidden">
        {/* Ascii Grid Background */}
        <div className="absolute inset-0">
          <AsciiGrid
            color="rgba(0, 0, 0, 0.2)"
            cellSize={12}
            logoSrc={dashboardTextMask}
            logoPosition="center"
            logoScale={0.9}
            enableDripping={false}
            className="w-full h-full"
          />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-white via-white/50 to-transparent pointer-events-none" />
        </div>
      </section>

      <section className="relative pb-16">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6">
          <div className="animate-fade-in">
            <Card className="profile-card-shadow">
              <CardHeader>
                <CardTitle className="text-2xl font-display font-bold">
                  Member Dashboard
                </CardTitle>
                <CardDescription>
                  Manage your profile information, event associations, and project associations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="profile" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="profile" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Profile
                    </TabsTrigger>
                    <TabsTrigger value="events" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Events
                    </TabsTrigger>
                    <TabsTrigger value="projects" className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Projects
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="profile" className="mt-6">
                    <MemberProfileForm />
                  </TabsContent>

                  <TabsContent value="events" className="mt-6">
                    <MemberEventSelection />
                  </TabsContent>

                  <TabsContent value="projects" className="mt-6">
                    <MemberProjectSelection />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
