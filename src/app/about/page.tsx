"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { Building2 } from "lucide-react";
import { HistoryTimeline } from "@/components/home/history-timeline";
import { AsciiGrid } from "@/components/ui/ascii-grid";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTeamMembers, type TeamMember } from "@/hooks/team";
import { API_URL } from "@/config";
import { ACADEMIC_YEARS, DEFAULT_ACADEMIC_YEAR } from "@/lib/academic-years";

const AnnualReportViewer = dynamic(
  () =>
    import("@/components/about/annual-report-viewer").then(
      (mod) => mod.AnnualReportViewer,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-16">
        <p className="font-mono text-secondary-gray text-sm">Loading report...</p>
      </div>
    ),
  },
);

const DEPARTMENTS = [
  "All",
  "Board",
  "Research",
  "IT",
  "Development",
  "Business",
  "Growth",
  "Alumni",
];

type GroupedMember = TeamMember & { departments: string[]; roles: string[] };

function groupTeamMembersByProfile(rows: TeamMember[]): GroupedMember[] {
  const grouped = new Map<string, GroupedMember>();
  for (const member of rows) {
    const existing = grouped.get(member.profileId);
    if (!existing) {
      grouped.set(member.profileId, {
        ...member,
        departments: member.department ? [member.department] : [],
        roles: member.role ? [member.role] : [],
      });
    } else {
      if (member.department && !existing.departments.includes(member.department)) {
        existing.departments.push(member.department);
      }
      if (member.role && !existing.roles.includes(member.role)) {
        existing.roles.push(member.role);
      }
    }
  }
  return Array.from(grouped.values());
}

function alumniTagScore(m: GroupedMember): number {
  return m.departments.length + m.roles.length;
}

export default function AboutPage() {
  const [aboutTextMask, setAboutTextMask] = useState<string | undefined>(undefined);
  const [selectedYear, setSelectedYear] = useState<string>(DEFAULT_ACADEMIC_YEAR);
  const [activeDepartment, setActiveDepartment] = useState("All");

  const isAlumni = activeDepartment === "Alumni";

  const deptForApi =
    activeDepartment === "All" || activeDepartment === "Alumni"
      ? undefined
      : activeDepartment;

  const { data: rawMembers = [], isLoading: isLoadingMembers } = useTeamMembers(
    isAlumni ? undefined : selectedYear,
    deptForApi,
    { alumni: isAlumni },
  );

  const displayedMembers = useMemo(() => {
    const grouped = groupTeamMembersByProfile(rawMembers);
    if (isAlumni) {
      return [...grouped].sort((a, b) => alumniTagScore(b) - alumniTagScore(a));
    }
    return grouped;
  }, [rawMembers, isAlumni]);

  // AsciiGrid text mask
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "bold 200px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("ABOUT US", 50, 50);

    const dataUrl = canvas.toDataURL("image/png");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAboutTextMask(dataUrl);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="relative bg-white text-secondary-black pt-64 pb-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <AsciiGrid
            color="rgba(0, 0, 0, 0.2)"
            cellSize={12}
            logoSrc={aboutTextMask}
            logoPosition="center"
            logoScale={0.6}
            enableDripping={false}
            className="w-full h-full"
          />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none" />
        </div>

        <div className="container max-w-7xl relative z-10 mx-auto px-4 md:px-6 pb-8">
          <h4 className="text-3xl mb-2 tracking-tighter">
            <span className="font-times font-normal text-primary">(Who we are)</span>{" "}
            Organization
          </h4>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter">About Us</h1>
        </div>
      </section>

      {/* Content */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-8 xl:px-8 pb-24">
        <section className="relative max-w-7xl mx-auto z-20 -mt-24 bg-neutral-50 rounded-3xl p-4 md:p-8 lg:p-12 shadow-lg border">

          {/* Mission */}
          <div className="flex flex-col gap-4 mb-20">
            <div>
              <Link href="/" className="text-secondary-gray hover:text-primary transition-colors text-sm font-medium">Home</Link>
              <span className="text-gray-300 mx-2">/</span>
              <span className="text-primary font-medium text-sm">About</span>
            </div>

            <p className="text-lg md:text-xl max-w-3xl opacity-95 leading-relaxed font-serif text-secondary-black mt-2">
              We are a student-led organization at KTH focused on artificial intelligence, research, and real-world applications.
            </p>

            <div className="space-y-4 font-arial text-base leading-relaxed text-secondary-black/80 max-w-4xl mt-4">
              <p>
                The organization includes teams working with AI research and development, often in collaboration with sponsors and partner organizations. We also organize hackathons, lectures, and panel discussions with actors within the AI domain, open to interested participants.
              </p>
              <p>
                Further information about ongoing work can be found on the{" "}
                <Link href="/projects" className="text-primary hover:underline decoration-2 underline-offset-4 font-medium">Projects</Link>{" "}
                and{" "}
                <Link href="/events" className="text-primary hover:underline decoration-2 underline-offset-4 font-medium">Events</Link>{" "}
                pages, and project leads can be contacted for details about specific initiatives.
              </p>
            </div>
          </div>

          <hr className="border-secondary-light-gray/60 mb-16" />

          {/* THE TEAM */}
          <div className="mb-24">
            <div className="mb-8">
              <h2 className="font-arial text-3xl font-bold text-secondary-black tracking-tight-2 mb-2">The Team</h2>
              <p className="font-serif text-secondary-black/70 text-lg">Discover the minds behind our initiatives.</p>
            </div>

            {/* Academic year (not used in Alumni view) */}
            {!isAlumni && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
                <span className="font-mono text-xs text-secondary-gray uppercase tracking-wider shrink-0">
                  Academic year
                </span>
                <Select
                  value={selectedYear}
                  onValueChange={setSelectedYear}
                >
                  <SelectTrigger className="w-full sm:w-[220px] font-mono text-xs bg-white">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACADEMIC_YEARS.map((year) => (
                      <SelectItem key={year} value={year} className="font-mono text-xs">
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {isAlumni && (
              <p className="font-mono text-xs text-secondary-gray mb-4">
                Alumni: everyone who has graduated, with all roles across years.
              </p>
            )}

            {/* Department filter pills */}
            <div className="flex flex-wrap gap-2 mb-10">
              {DEPARTMENTS.map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setActiveDepartment(dept)}
                  className={`font-mono text-xs px-4 py-2 rounded-full transition-all duration-200 border ${
                    activeDepartment === dept
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-white text-secondary-black border-secondary-light-gray hover:border-primary"
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>

            {/* Member grid */}
            {isLoadingMembers ? (
              <div className="py-16 text-center">
                <p className="font-mono text-secondary-gray text-sm">Loading members...</p>
              </div>
            ) : displayedMembers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedMembers.map((member) => {
                  const pictureUrl = member.profilePicture
                    ? `${API_URL}/profile/picture?id=${member.profilePicture}`
                    : null;

                  return (
                    <Link
                      key={member.profileId}
                      href={`/members/${member.profileId}`}
                      className="group flex flex-col h-full bg-white border border-secondary-light-gray/60 rounded-2xl p-4 hover:shadow-md hover:border-primary/40 transition-all duration-300"
                    >
                      {/* Image & Department Badge(s) */}
                      <div className="relative h-64 bg-secondary-light-gray mb-4 overflow-hidden rounded-xl">
                        {pictureUrl ? (
                          <>
                            <Image
                              src={pictureUrl}
                              alt={`${member.firstName} ${member.lastName}`}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                              className="object-cover grayscale saturate-0 contrast-110 group-hover:grayscale-0 group-hover:saturate-100 group-hover:contrast-100 transition-all duration-500"
                              unoptimized
                            />
                            <div className="absolute inset-0 bg-primary/35 mix-blend-multiply group-hover:opacity-0 transition-opacity duration-500" />
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-secondary/20">
                            <Building2 className="h-10 w-10 text-secondary-gray/40" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3 flex flex-wrap justify-end gap-1.5 max-w-[75%]">
                          {member.departments.map((department) => (
                            <span
                              key={`${member.profileId}-${department}`}
                              className="bg-primary backdrop-blur-sm px-2.5 py-1 rounded-2xl text-[10px] font-mono font-bold text-white/95 tracking-tight shadow-sm"
                            >
                              {department}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-grow flex flex-col px-1">
                        <h3 className="font-arial font-bold text-lg text-secondary-black group-hover:text-primary transition-colors tracking-tight-1">
                          {member.firstName} {member.lastName}
                        </h3>
                        {member.roles.length > 0 && (
                          <p className="font-mono text-xs mt-1 text-secondary-gray group-hover:text-secondary-black transition-colors">
                            {member.roles.join(" · ")}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="py-24 text-center border border-dashed border-secondary-gray/50 rounded-2xl bg-white">
                <p className="font-mono text-secondary-gray text-sm">
                  No members found
                  {activeDepartment !== "All" && activeDepartment !== "Alumni" && (
                    <> in <span className="text-secondary-black font-bold">{activeDepartment}</span></>
                  )}
                  {!isAlumni && selectedYear && (
                    <> for <span className="text-secondary-black font-bold">{selectedYear}</span></>
                  )}.
                </p>
                {activeDepartment !== "All" && activeDepartment !== "Alumni" && (
                  <button
                    type="button"
                    onClick={() => setActiveDepartment("All")}
                    className="mt-4 text-primary font-mono text-xs hover:underline"
                  >
                    Clear filter
                  </button>
                )}
              </div>
            )}
          </div>

          <hr className="border-secondary-light-gray/60 mb-16" />

          {/* HISTORY — now below the team */}
          <div>
            <div className="mb-10">
              <h2 className="font-arial text-3xl font-bold text-secondary-black tracking-tight-2 mb-2">Our History</h2>
              <p className="font-serif text-secondary-black/70 max-w-2xl text-lg">
                Key milestones, events, and initiatives from previous years.
              </p>
            </div>
            <HistoryTimeline />

            <hr className="border-secondary-light-gray/60 my-16" />

            {/* Annual report — scrollable embed */}
            <div>
              <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                <div>
                  <h2 className="font-arial text-3xl font-bold text-secondary-black tracking-tight-2 mb-2">
                    Annual Report
                  </h2>
                  <p className="font-serif text-secondary-black/70 max-w-2xl text-lg">
                    A closer look at our year in review.
                  </p>
                </div>
                <a
                  href="/kth-ais-annual-report.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-primary hover:underline decoration-2 underline-offset-4 shrink-0"
                >
                  Open in new tab ↗
                </a>
              </div>
              <AnnualReportViewer />
            </div>
          </div>

        </section>
      </div>
    </div>
  );
}
