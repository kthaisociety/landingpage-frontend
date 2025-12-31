"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ImageCard } from "@/components/ui/image-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AvatarGroup,
  AvatarGroupTooltip,
  AvatarGroupTooltipArrow,
} from "@/components/ui/avatar-group"
import { projects } from "@/lib/data/projects"
import type { Project } from "@/lib/data/projects"

function ProjectCard({ project }: { project: Project }) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Determine gradient and text colors based on cover image theme
  const isLightBackground = project.coverImageTheme === "light"
  
  const gradientColors = isLightBackground
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

  const textColorClass = isLightBackground ? "text-secondary-black" : "text-white"
  const shadowClass = isLightBackground ? "drop-shadow-sm" : "drop-shadow-lg"

  return (
    <Link href={`/projects/${project.id}`} className="block">
    <ImageCard
      image={project.coverImage || "/project-placeholder.webp"}
      alt={project.title}
      blurHeight="70%"
      gradientColors={gradientColors}
      tags={project.tags}
    >
        {/* Title with Repository */}
        <div className="flex items-center gap-2 mb-1">
          <h3 className={`text-2xl font-bold ${shadowClass} tracking-tight ${textColorClass} `}>
        {project.title}
      </h3>
          {project.repoUrl && project.repoUrl !== "#" && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                window.open(project.repoUrl, '_blank', 'noopener,noreferrer')
              }}
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              className="flex items-center justify-center w-5 h-5 transition-all hover:opacity-70 hover:scale-110 active:scale-95 cursor-pointer shrink-0"
              aria-label="View repository"
            >
              <svg
                className={`w-5 h-5 ${textColorClass}`}
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>

      {/* Short Description */}
      <p className={`text-base ${shadowClass} mb-3 ${textColorClass}`}>
        {project.shortDescription}
      </p>

      {/* Contributors */}
      <div className="flex items-center flex-wrap gap-2">
        <AvatarGroup translate="-6%" sideOffset={10}>
          {project.contributors.map((contributor) => (
            <Avatar key={`${contributor.name}-${contributor.role}`} className="h-8 w-8 border mr-0.5">
              <AvatarImage src={contributor.avatar} alt={contributor.name} />
              <AvatarFallback className="bg-primary text-white text-xs">
                {getInitials(contributor.name)}
              </AvatarFallback>
              <AvatarGroupTooltip className="bg-white text-black rounded-lg px-3 py-2 shadow-lg">
                <AvatarGroupTooltipArrow className="fill-white stroke-black" />
                <div className="text-center">
                  <div className="font-medium tracking-tight">{contributor.name}</div>
                  <div className="text-sm font-serif text-primary">{contributor.role}</div>
                </div>
              </AvatarGroupTooltip>
            </Avatar>
          ))}
        </AvatarGroup>
      </div>
    </ImageCard>
    </Link>
  )
}

export function ProjectsPreview() {
  // Show first 3 projects for preview
  const previewProjects = projects.slice(0, 3)

  return (
    <section className="container mx-auto py-16 px-4 w-full max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          <span className="text-primary font-serif font-normal">(Featured)</span> Projects
        </h2>
        <Button asChild>
          <Link href="/projects">
            <span className="hidden md:block">See more </span>Projects
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {previewProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  )
}
