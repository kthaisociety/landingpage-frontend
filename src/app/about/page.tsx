"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { HistoryTimeline } from "@/components/home/history-timeline";
import { AsciiGrid } from "@/components/ui/ascii-grid";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { CaretDownIcon } from "@phosphor-icons/react";

const TEAMS_DATA = {
  "2023/2024": [
    // {
    //   id: "elsa-andersson",
    //   name: "Elsa Andersson",
    //   role: "President",
    //   department: "Board",
    //   image:
    //     "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=400",
    //   bio: "Overseeing strategic vision and long-term university partnerships.",
    //   tags: ["Leadership", "Strategy"],
    // },
    // {
    //   id: "lucas-berg",
    //   name: "Lucas Berg",
    //   role: "Head of AI Research",
    //   department: "Research",
    //   image:
    //     "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400&h=400",
    //   bio: "Leading the NLP research group and coordinating with our corporate sponsors.",
    //   tags: ["NLP", "Deep Learning"],
    // },
    // {
    //   id: "sara-ahmed",
    //   name: "Sara Ahmed",
    //   role: "Fullstack Developer",
    //   department: "IT & Dev",
    //   image:
    //     "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400&h=400",
    //   bio: "Maintaining the KTHAIS portal and building internal tools for event management.",
    //   tags: ["React", "Python"],
    // },
    // {
    //   id: "viktor-lind",
    //   name: "Viktor Lind",
    //   role: "Corporate Relations",
    //   department: "Business",
    //   image:
    //     "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400&h=400",
    //   bio: "Connecting top-tier students with industry leaders for internships and R&D.",
    //   tags: ["B2B", "Networking"],
    // },
    // {
    //   id: "maria-chen",
    //   name: "Maria Chen",
    //   role: "Events Lead",
    //   department: "Events",
    //   image:
    //     "https://images.unsplash.com/photo-1598550874175-4d0ef436c909?auto=format&fit=crop&q=80&w=400&h=400",
    //   bio: "Organizing our flagship annual hackathon and weekly guest lectures.",
    //   tags: ["Logistics", "Marketing"],
    // },
  ],
  "2022/2023": [
    // {
    //   id: "johan-svensson",
    //   name: "Johan Svensson",
    //   role: "Former President",
    //   department: "Board",
    //   image:
    //     "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400&h=400",
    //   bio: "Established the current organizational structure and IT sub-teams.",
    //   tags: ["Alumni", "Leadership"],
    // },
    // {
    //   id: "linnea-karlsson",
    //   name: "Linnea Karlsson",
    //   role: "Head of AI Research",
    //   department: "Research",
    //   image:
    //     "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400&h=400",
    //   bio: "Pioneered our first joint research paper with industry sponsors.",
    //   tags: ["Computer Vision", "Ethics"],
    // },
  ],
};

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

export default function AboutPage() {
  const [aboutTextMask, setAboutTextMask] = useState<string | undefined>(
    undefined,
  );

  const availableYears = Object.keys(TEAMS_DATA).sort().reverse();
  const [activeYear, setActiveYear] = useState(availableYears[0]);
  const [activeDepartment, setActiveDepartment] = useState("All");

  // AsciiGrid text mask effect
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

    const text = "ABOUT US";
    ctx.fillText(text, 50, 50);

    const dataUrl = canvas.toDataURL("image/png");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAboutTextMask(dataUrl);
  }, []);

  const filteredTeam = useMemo(() => {return []}, [activeYear, activeDepartment]);

  return (
    <div className="min-h-screen bg-background">
      {/* --- Header Section --- */}
      <section className="relative bg-background text-foreground pt-64 pb-24 overflow-hidden">
        {/* Ascii Grid Background */}
        <div className="absolute inset-0 pointer-events-none">
          <AsciiGrid
            color="var(--color-primary)"
            cellSize={12}
            logoSrc={aboutTextMask}
            logoPosition="center"
            logoScale={0.6}
            enableDripping={false}
            className="w-full h-full"
          />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-muted via-background/50 to-transparent pointer-events-none" />
        </div>

        <div className="container max-w-7xl relative z-10 mx-auto px-4 md:px-6 pb-8">
          {/* Main Title */}
          <h4 className="text-3xl mb-2 tracking-tighter">
            <span className="font-serif font-normal text-primary">
              (Who we are)
            </span>{" "}
            Organization
          </h4>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter">
            About Us
          </h1>
        </div>
      </section>

      {/* --- Overlapping Content Area --- */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-8 xl:px-8 pb-24">
        <section className="relative max-w-7xl mx-auto z-20 -mt-24 bg-card text-card-foreground rounded-none p-4 md:p-8 lg:p-12 shadow-lg ring-1 ring-foreground/10">
          {/* Section A: Mission & Breadcrumbs */}
          <div className="flex flex-col gap-4 mb-20">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>About</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <p className="text-lg md:text-xl max-w-3xl leading-relaxed tracking-tight text-muted-foreground mt-2">
              We are a student-led organization at KTH focused on artificial
              intelligence, research, and real-world applications.
            </p>

            <div className="space-y-4 text-base leading-relaxed text-muted-foreground max-w-4xl mt-4">
              <p>
                The organization includes teams working with AI research and
                development, often in collaboration with sponsors and partner
                organizations. We also organize hackathons, lectures, and panel
                discussions with actors within the AI domain, open to interested
                participants.
              </p>
              <p>
                Further information about ongoing work can be found on the{" "}
                <Link
                  href="/projects"
                  className="text-primary hover:underline decoration-2 underline-offset-4 font-medium"
                >
                  Projects
                </Link>{" "}
                and{" "}
                <Link
                  href="/events"
                  className="text-primary hover:underline decoration-2 underline-offset-4 font-medium"
                >
                  Events
                </Link>{" "}
                pages, and project leads can be contacted for details about
                specific initiatives.
              </p>
            </div>
          </div>

          <Separator className="mb-16" />

          {/* Section B: Timeline */}
          <div className="mb-24">
            <div className="mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-2">
                <span className="text-primary font-serif font-normal">(Our)</span> History
              </h2>
              <p className="text-muted-foreground max-w-2xl text-lg tracking-tight">
                Key milestones, events, and initiatives from previous years.
              </p>
            </div>

            <HistoryTimeline />
          </div>

          <Separator className="mb-16" />

          <div>
            {/* Header & Year Dropdown */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-2">
                  <span className="text-primary font-serif font-normal">(The)</span> Team
                </h2>
                <p className="text-muted-foreground text-lg tracking-tight">
                  Discover the minds behind our initiatives.
                </p>
              </div>

              {/* Dropdown for Year Selection */}
              <div className="w-full md:w-auto min-w-[160px]">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="font-mono text-sm h-11"
                    >
                      {activeYear}
                      <CaretDownIcon className="size-4 opacity-50 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[220px]">
                    {availableYears.map((year) => (
                      <DropdownMenuItem
                        key={year}
                        onClick={() => {
                          setActiveYear(year);
                          setActiveDepartment("All");
                        }}
                        className="font-mono text-sm cursor-pointer"
                      >
                        {year}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Department Filter Pills */}
            <div className="flex flex-wrap gap-2 mb-10">
              {DEPARTMENTS.map((dept) => (
                <Badge
                  key={dept}
                  variant={activeDepartment === dept ? "default" : "outline"}
                  className="cursor-pointer font-mono text-xs px-4 py-2 transition-all duration-200"
                  onClick={() => setActiveDepartment(dept)}
                >
                  {dept}
                </Badge>
              ))}
            </div>

            {/* Member Grid */}
            {filteredTeam.length > 0 ? (
              <div></div>
            ) : (
              /* Empty State */
              <Empty className="border border-dashed border-border py-24 bg-card rounded-2xl">
                <EmptyHeader>
                  <EmptyTitle>
                    No members found in{" "}
                    <span className="text-foreground font-bold">
                      {activeDepartment}
                    </span>{" "}
                    for{" "}
                    <span className="text-foreground font-bold">
                      {activeYear}
                    </span>
                  </EmptyTitle>
                </EmptyHeader>
                <EmptyContent>
                  <Button
                    variant="link"
                    onClick={() => setActiveDepartment("All")}
                    className="font-mono text-xs"
                  >
                    Clear filters
                  </Button>
                </EmptyContent>
              </Empty>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
