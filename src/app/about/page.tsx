"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { HistoryTimeline } from "@/components/home/history-timeline";
import { AsciiGrid } from "@/components/ui/ascii-grid";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

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
  // const filteredTeam = useMemo(() => {
  //   const teamForYear = TEAMS_DATA[activeYear as keyof typeof TEAMS_DATA] || [];
  //   if (activeDepartment === "All") return teamForYear;
  //   return teamForYear.filter(
  //     (member) => member.department === activeDepartment,
  //   );
  // }, [activeYear, activeDepartment]);

  return (
    <div className="min-h-screen bg-background">
      {/* --- Header Section (Styled like EventsPage) --- */}
      <section className="relative bg-white text-secondary-black pt-64 pb-24 overflow-hidden">
        {/* Ascii Grid Background */}
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
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-neutral-50 via-white/50 to-transparent pointer-events-none" />
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
        <section className="relative max-w-7xl mx-auto z-20 -mt-24 bg-neutral-50 rounded-3xl p-4 md:p-8 lg:p-12 shadow-lg border">
          {/* Section A: Mission & Breadcrumbs */}
          <div className="flex flex-col gap-4 mb-20">
            <div>
              <Link
                href="/"
                className="text-secondary-gray hover:text-primary transition-colors text-sm font-medium"
              >
                Home
              </Link>
              <span className="text-gray-300 mx-2">/</span>
              <span className="text-primary font-medium text-sm">About</span>
            </div>

            <p className="text-lg md:text-xl max-w-3xl opacity-95 leading-relaxed font-serif text-secondary-black mt-2">
              We are a student-led organization at KTH focused on artificial
              intelligence, research, and real-world applications.
            </p>

            <div className="space-y-4 font-arial text-base leading-relaxed text-secondary-black/80 max-w-4xl mt-4">
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

          <hr className="border-secondary-light-gray/60 mb-16" />

          {/* Section B: Timeline */}
          <div className="mb-24">
            <div className="mb-10">
              <h2 className="font-arial text-3xl font-bold text-secondary-black tracking-tight-2 mb-2">
                Our History
              </h2>
              <p className="font-serif text-secondary-black/70 max-w-2xl text-lg">
                Key milestones, events, and initiatives from previous years.
              </p>
            </div>

            <div className="bg-white p-6 md:p-10 border border-secondary-light-gray/60 rounded-2xl shadow-sm">
              <HistoryTimeline />
            </div>
          </div>

          <hr className="border-secondary-light-gray/60 mb-16" />

          <div>
            {/* Header & Year Dropdown */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8">
              <div>
                <h2 className="font-arial text-3xl font-bold text-secondary-black tracking-tight-2 mb-2">
                  The Team
                </h2>
                <p className="font-serif text-secondary-black/70 text-lg">
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
                      <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[220px]">
                    {availableYears.map((year) => (
                      <DropdownMenuItem
                        key={year}
                        onClick={() => {
                          setActiveYear(year);
                          setActiveDepartment("All"); // Reset department when year changes
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
                <button
                  key={dept}
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

            {/* Member Grid */}
            {filteredTeam.length > 0 ? (
              // <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              //   {filteredTeam.map((member) => (
              //     <Link
              //       key={member.id}
              //       href={`/team/${member.id}`}
              //       className="group flex flex-col h-full bg-white border border-secondary-light-gray/60 rounded-2xl p-4 hover:shadow-md hover:border-primary/40 transition-all duration-300"
              //     >
              //       {/* Image & Department Badge */}
              //       <div className="relative aspect-square bg-secondary-light-gray mb-4 overflow-hidden rounded-xl">
              //         <img
              //           src={member.image}
              //           alt={member.name}
              //           className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500"
              //         />
              //         <div className="absolute top-3 right-3 bg-primary backdrop-blur-sm px-2.5 py-1 rounded-2xl text-[10px] font-mono font-bold text-white/95 tracking-tight shadow-sm">
              //           {member.department}
              //         </div>
              //       </div>

              //       {/* Info */}
              //       <div className="flex-grow flex flex-col px-1">
              //         <h3 className="font-arial font-bold text-lg text-secondary-black group-hover:text-primary transition-colors tracking-tight-1">
              //           {member.name}
              //         </h3>
              //         <p className="font-mono text-xs mt-1 text-secondary-gray group-hover:text-secondary-black transition-colors">
              //           {member.role}
              //         </p>

              //         {/* Short Bio */}
              //         <p className="font-serif text-sm text-secondary-black/70 mt-3 line-clamp-2 leading-relaxed">
              //           {member.bio}
              //         </p>

              //         {/* Tags */}
              //         <div className="flex flex-wrap gap-2 mt-auto pt-5">
              //           {member.tags.map((tag, idx) => (
              //             <span
              //               key={idx}
              //               className="bg-neutral-100 border border-secondary-light-gray/50 text-secondary-black px-2 py-1 rounded text-[10px] font-mono uppercase"
              //             >
              //               {tag}
              //             </span>
              //           ))}
              //         </div>
              //       </div>
              //     </Link>
              //   ))}
              // </div>
              <div></div>
            ) : (
              /* Empty State */
              <div className="py-24 text-center border border-dashed border-secondary-gray/50 rounded-2xl bg-white">
                <p className="font-mono text-secondary-gray text-sm">
                  No members found in{" "}
                  <span className="text-secondary-black font-bold">
                    {activeDepartment}
                  </span>{" "}
                  for{" "}
                  <span className="text-secondary-black font-bold">
                    {activeYear}
                  </span>
                  .
                </p>
                <button
                  onClick={() => setActiveDepartment("All")}
                  className="mt-4 text-primary font-mono text-xs hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
