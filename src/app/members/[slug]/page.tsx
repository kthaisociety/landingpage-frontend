"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { Github, Linkedin, Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { AsciiGrid } from "@/components/ui/ascii-grid";
import { usePublicProfile } from "@/hooks/team";
import { API_URL } from "@/config";

export default function MemberPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: profile, isLoading, isError } = usePublicProfile(slug);
  const [textMask, setTextMask] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!profile?.firstName) return;

    const canvas = document.createElement("canvas");
    canvas.width = 1400;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "bold 200px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(profile.firstName.toUpperCase(), canvas.width / 2, canvas.height / 2);

    const dataUrl = canvas.toDataURL("image/png");
    requestAnimationFrame(() => setTextMask(dataUrl));
  }, [profile?.firstName]);

  const getInitials = (first: string, last: string) =>
    `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-secondary-black font-medium">Loading profile...</p>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-secondary-black">Member not found</h1>
          <p className="text-secondary-gray mb-8">This profile does not exist or could not be loaded.</p>
          <Button asChild><Link href="/about">Back to About</Link></Button>
        </div>
      </div>
    );
  }

  const pictureUrl = profile.profilePicture
    ? `${API_URL}/profile/picture?id=${profile.profilePicture}`
    : null;

  // Group team history by year
  const historyByYear = (profile.teamHistory ?? []).reduce<
    Record<string, { role: string; department: string; id: number }[]>
  >((acc, entry) => {
    const year = entry.academicYear || "Unknown";
    if (!acc[year]) acc[year] = [];
    acc[year].push(entry);
    return acc;
  }, {});

  const sortedYears = Object.keys(historyByYear).sort().reverse();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative bg-white text-secondary-black pt-64 pb-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <AsciiGrid
            color="rgba(0, 0, 0, 0.2)"
            cellSize={12}
            logoSrc={textMask}
            logoPosition="center"
            logoScale={1}
            enableDripping={false}
            className="w-full h-full"
          />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-white via-white/50 to-transparent pointer-events-none" />
        </div>

        <div className="container max-w-7xl relative z-10 mx-auto px-4 md:px-6 pb-8">
          <h1 className="text-5xl md:text-7xl font-base mb-2 tracking-tighter">
            {profile.firstName} {profile.lastName}
          </h1>
          {profile.programme && (
            <p className="text-lg md:text-xl font-serif opacity-80">
              {profile.programme}
              {profile.graduationYear ? ` · Class of ${profile.graduationYear}` : ""}
            </p>
          )}
        </div>
      </section>

      {/* Content */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-8 xl:px-8">
        <section className="relative max-w-7xl mx-auto z-20 -mt-24 bg-neutral-50 rounded-3xl p-4 md:p-8 mb-24 shadow-lg border">
          {/* Breadcrumb */}
          <div className="mb-8 flex items-center">
            <Link href="/" className="text-secondary-gray hover:text-primary transition-colors text-sm font-medium">Home</Link>
            <span className="text-gray-300 mx-2">/</span>
            <Link href="/about" className="text-secondary-gray hover:text-primary transition-colors text-sm font-medium">About</Link>
            <span className="text-gray-300 mx-2">/</span>
            <span className="text-primary font-medium text-sm truncate">
              {profile.firstName} {profile.lastName}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Profile picture + name card */}
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                  {pictureUrl && <AvatarImage src={pictureUrl} alt={profile.firstName} />}
                  <AvatarFallback className="bg-primary text-white text-2xl font-bold">
                    {getInitials(profile.firstName, profile.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold text-secondary-black">
                    {profile.firstName} {profile.lastName}
                  </h2>
                  {profile.university && (
                    <p className="text-secondary-gray text-sm mt-1">{profile.university}</p>
                  )}
                </div>
              </div>

              {profile.aboutMe && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-medium text-secondary-black mb-3">About</h3>
                    <p className="text-secondary-black/80 leading-relaxed font-serif">{profile.aboutMe}</p>
                  </div>
                </>
              )}

              {/* Team history */}
              {sortedYears.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-medium text-secondary-black mb-4">Team history</h3>
                    <div className="space-y-4">
                      {sortedYears.map((year) => (
                        <div key={year}>
                          <p className="text-xs font-mono text-secondary-gray mb-2 uppercase tracking-widest">{year}</p>
                          <div className="space-y-2">
                            {historyByYear[year].map((entry) => (
                              <div key={entry.id} className="flex items-center gap-3">
                                <Badge variant="outline" className="font-mono text-xs shrink-0">
                                  {entry.department}
                                </Badge>
                                {entry.role && (
                                  <span className="text-sm text-secondary-black">{entry.role}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Projects */}
              {profile.projects && profile.projects.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-medium text-secondary-black mb-4">Projects</h3>
                    <div className="space-y-3">
                      {profile.projects.map((project) => (
                        <Link
                          key={project.id}
                          href={`/projects/${project.id}`}
                          className="flex items-start gap-3 p-3 rounded-xl border border-secondary-light-gray/60 bg-white hover:border-primary/40 hover:shadow-sm transition-all group"
                        >
                          <ChevronRight className="h-4 w-4 text-primary mt-0.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                          <div>
                            <p className="font-medium text-secondary-black group-hover:text-primary transition-colors">
                              {project.title}
                            </p>
                            {project.oneLineDescription && (
                              <p className="text-sm text-secondary-gray mt-0.5 line-clamp-1">
                                {project.oneLineDescription}
                              </p>
                            )}
                          </div>
                          {project.status && (
                            <Badge variant="secondary" className="ml-auto shrink-0 text-xs font-mono">
                              {project.status}
                            </Badge>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-4">
                {profile.githubLink && (
                  <Button variant="outline" asChild className="w-full">
                    <Link href={profile.githubLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                      <Github className="h-4 w-4" />
                      GitHub
                    </Link>
                  </Button>
                )}
                {profile.linkedinLink && (
                  <Button variant="outline" asChild className="w-full">
                    <Link href={profile.linkedinLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </Link>
                  </Button>
                )}

                {profile.programme && (
                  <div className="p-4 rounded-xl border border-secondary-light-gray/60 bg-white space-y-3">
                    <h4 className="text-xs font-mono uppercase tracking-widest text-secondary-gray">Info</h4>
                    <div>
                      <p className="text-xs text-secondary-gray">Programme</p>
                      <p className="text-sm font-medium text-secondary-black">{profile.programme}</p>
                    </div>
                    {profile.graduationYear && (
                      <div>
                        <p className="text-xs text-secondary-gray">Graduation</p>
                        <p className="text-sm font-medium text-secondary-black">{profile.graduationYear}</p>
                      </div>
                    )}
                    {profile.university && (
                      <div>
                        <p className="text-xs text-secondary-gray">University</p>
                        <p className="text-sm font-medium text-secondary-black">{profile.university}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
