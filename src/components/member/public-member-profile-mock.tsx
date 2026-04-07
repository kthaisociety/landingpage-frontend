"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FolderKanban,
  GraduationCap,
  Linkedin,
  UserRound,
} from "lucide-react";
import type {
  ResolvedMockMemberProfile,
} from "@/lib/data/member-profiles";
import type { Project } from "@/lib/data/projects";
import { AsciiGrid } from "@/components/ui/ascii-grid";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ImageCard } from "@/components/ui/image-card";
import { Separator } from "@/components/ui/separator";

function getInitials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getMemberStatusBadgeClass(status: string) {
  if (status === "Active") {
    return "border-green-200 bg-green-50 text-green-700 hover:bg-green-50";
  }

  return "border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-100";
}

function ProjectCard({ project }: { project: Project }) {
  const isLightBackground = project.coverImageTheme !== "dark";

  const textColorClass = isLightBackground
    ? "text-secondary-black drop-shadow-sm"
    : "text-white drop-shadow-lg";

  return (
    <Link href={`/projects/${project.id}`} className="block">
      <ImageCard
        image={project.coverImage || "/project-placeholder.webp"}
        alt={project.title}
        blurHeight="70%"
        tags={project.tags}
        gradientColors={
          isLightBackground
            ? {
                from: "from-white/100",
                via: "via-white/90",
                to: "to-transparent",
              }
            : {
                from: "from-black/100",
                via: "via-black/80",
                to: "to-transparent",
              }
        }
      >
        <h3 className={`mb-2 text-2xl tracking-tight ${textColorClass}`}>
          {project.title}
        </h3>
        <p className={`text-base ${textColorClass}`}>
          {project.shortDescription}
        </p>
      </ImageCard>
    </Link>
  );
}

export function PublicMemberProfileMock({
  profile,
}: {
  profile: ResolvedMockMemberProfile;
}) {
  const router = useRouter();
  const [profileTextMask, setProfileTextMask] = useState<string | undefined>();

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1400;
    canvas.height = 400;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "bold 170px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      profile.fullName.toUpperCase(),
      canvas.width / 2,
      canvas.height / 2,
    );

    const dataUrl = canvas.toDataURL("image/png");
    const frame = requestAnimationFrame(() => {
      setProfileTextMask(dataUrl);
    });

    return () => cancelAnimationFrame(frame);
  }, [profile.fullName]);

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-white pt-64 pb-24 text-secondary-black">
        <div className="absolute inset-0 pointer-events-none">
          <AsciiGrid
            color="rgba(0, 0, 0, 0.2)"
            cellSize={12}
            logoSrc={profileTextMask}
            logoPosition="center"
            logoScale={0.55}
            enableDripping={false}
            className="h-full w-full"
          />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-white via-white/50 to-transparent pointer-events-none" />
        </div>

        <div className="container relative z-10 mx-auto max-w-7xl px-4 pb-8 md:px-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6 -ml-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <Avatar className="h-28 w-28 border-2 border-black/10 shadow-sm md:h-32 md:w-32">
                <AvatarImage
                  src={profile.profileImage ?? undefined}
                  alt={profile.fullName}
                />
                <AvatarFallback className="text-3xl font-semibold">
                  {getInitials(profile.fullName)}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-3">
                <Badge
                  variant="outline"
                  className={`w-fit rounded-full px-4 py-2 text-sm font-medium ${getMemberStatusBadgeClass(
                    profile.memberStatus,
                  )}`}
                >
                  <span className="mr-2 text-base leading-none">•</span>
                  {profile.memberStatus}
                </Badge>

                <h1 className="text-5xl tracking-tighter md:text-7xl">
                  {profile.fullName}
                </h1>
              </div>
            </div>

            {profile.linkedInLink ? (
              <Button asChild>
                <a
                  href={profile.linkedInLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <div className="px-4 sm:px-6 md:px-8 lg:px-8 xl:px-8">
        <section className="relative z-20 mx-auto -mt-24 mb-24 max-w-7xl rounded-3xl border bg-neutral-50 p-4 shadow-lg md:p-8">
          <div className="mb-8 flex items-center">
            <Link
              href="/"
              className="text-sm font-medium text-secondary-gray transition-colors hover:text-primary"
            >
              Home
            </Link>
            <span className="mx-2 text-gray-300">/</span>
            <span className="text-sm font-medium text-secondary-gray">
              Members
            </span>
            <span className="mx-2 text-gray-300">/</span>
            <span className="inline-block max-w-md truncate text-sm font-medium text-primary">
              {profile.fullName}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>About</CardTitle>
                  <CardDescription>
                    Public information shared by this member.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap leading-relaxed text-secondary-black">
                    {profile.aboutMe}
                  </p>
                </CardContent>
              </Card>

              <Separator />

              <section className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Projects</h2>
                    <p className="text-sm text-muted-foreground">
                      Current and past project involvement.
                    </p>
                  </div>
                  <Badge variant="secondary">{profile.projects.length}</Badge>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  {profile.projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>
                    Quick public details.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-start gap-3">
                    <UserRound className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium text-secondary-black">
                        {profile.fullName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <GraduationCap className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Study programme</p>
                      <p className="font-medium text-secondary-black">
                        {profile.programme}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <UserRound className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Member status</p>
                      <p className="font-medium text-secondary-black">
                        {profile.memberStatus}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Linkedin className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">LinkedIn</p>
                      {profile.linkedInLink ? (
                        <a
                          href={profile.linkedInLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline"
                        >
                          Open profile
                        </a>
                      ) : (
                        <p className="font-medium text-secondary-black">
                          Not shared publicly
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FolderKanban className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Projects</p>
                      <p className="font-medium text-secondary-black">
                        {profile.projects.length}
                      </p>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}