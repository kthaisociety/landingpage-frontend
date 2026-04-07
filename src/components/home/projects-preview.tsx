"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRightIcon, GithubLogoIcon, ArrowSquareOutIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FadeIn } from "@/components/ui/fade-in"
import {
  AvatarGroup,
  AvatarGroupTooltip,
} from "@/components/ui/avatar-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { projects } from "@/lib/data/projects"
import type { Project } from "@/lib/data/projects"
import { cn } from "@/lib/utils"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function ZigzagCard({
  project,
  index,
}: {
  project: Project
  index: number
}) {
  const [imgSrc, setImgSrc] = useState(project.coverImage || "/project-placeholder.webp")
  const [hasError, setHasError] = useState(false)
  const isReversed = index % 2 === 1

  const handleError = () => {
    if (!hasError) {
      setImgSrc("/project-placeholder.webp")
      setHasError(true)
    }
  }

  return (
    <Link
      href={`/projects/${project.id}`}
      className="group block ring-1 ring-foreground/10 overflow-hidden transition-all duration-200 hover:ring-foreground/30"
    >
      <div
        className={cn(
          "flex flex-col md:flex-row",
          isReversed && "md:flex-row-reverse"
        )}
      >
        {/* Image side */}
        <div className="relative w-full md:w-1/2 aspect-[4/3] md:aspect-auto md:min-h-[280px] overflow-hidden shrink-0">
          <Image
            src={imgSrc}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] will-change-transform"
            sizes="(max-width: 768px) 100vw, 50vw"
            onError={handleError}
          />
          {/* Tags overlay */}
          <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-1.5 z-10">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground font-mono uppercase"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Content side */}
        <div className="flex flex-col justify-between w-full md:w-1/2 bg-card text-card-foreground p-6 md:p-8 border-t md:border-t-0 border-foreground/10">
          <div>
            {/* Category label */}
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">
              {project.category}
            </div>

            {/* Title row */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="text-xl md:text-2xl font-bold tracking-tight text-card-foreground leading-tight">
                {project.title}
              </h3>
              <div className="flex items-center gap-1 shrink-0 mt-0.5">
                {project.repoUrl && project.repoUrl !== "#" && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          window.open(project.repoUrl, "_blank", "noopener,noreferrer")
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        className="flex items-center justify-center size-7 ring-1 ring-foreground/10 text-card-foreground transition-all hover:bg-foreground hover:text-background active:scale-95 cursor-pointer"
                        aria-label="View repository"
                      >
                        <GithubLogoIcon className="size-4" weight="fill" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>View repository</TooltipContent>
                  </Tooltip>
                )}
                <div className="flex items-center justify-center size-7 ring-1 ring-foreground/10 text-card-foreground transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:ring-primary">
                  <ArrowSquareOutIcon className="size-4" />
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              {project.shortDescription}
            </p>
          </div>

          <div className="flex items-center justify-between gap-4">
            {/* Contributors */}
            <AvatarGroup translate="-6%" sideOffset={10}>
              {project.contributors.slice(0, 4).map((contributor) => (
                <Avatar
                  key={`${contributor.name}-${contributor.role}`}
                  className="h-7 w-7 border border-foreground/10"
                >
                  <AvatarImage src={contributor.avatar} alt={contributor.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                    {getInitials(contributor.name)}
                  </AvatarFallback>
                  <AvatarGroupTooltip className="bg-card text-card-foreground px-3 py-2 shadow-lg ring-1 ring-foreground/10">
                    <div className="text-center">
                      <div className="font-medium tracking-tight text-xs">{contributor.name}</div>
                      <div className="text-xs text-primary font-serif">{contributor.role}</div>
                    </div>
                  </AvatarGroupTooltip>
                </Avatar>
              ))}
            </AvatarGroup>

            {/* Status badge */}
            <span className="text-xs font-mono text-muted-foreground shrink-0">
              {project.status}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export function ProjectsPreview() {
  const featured = projects.slice(0, 3)

  return (
    <section className="container mx-auto py-20 px-4 w-full max-w-7xl">
      <FadeIn>
        <div className="flex items-center justify-between mb-10">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          <span className="text-primary font-serif font-normal">(Featured)</span> Projects
        </h2>
        <Button asChild>
          <Link href="/projects">
            <span className="hidden md:block">See more </span>Projects
            <ArrowRightIcon className="size-4" />
          </Link>
        </Button>
      </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="flex flex-col gap-6">
        {featured.map((project, index) => (
          <ZigzagCard key={project.id} project={project} index={index} />
        ))}
        </div>
      </FadeIn>
    </section>
  )
}
