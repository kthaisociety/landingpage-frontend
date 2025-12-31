"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AsciiGrid } from "@/components/ui/ascii-grid"
import { ImageCard } from "@/components/ui/image-card"
import {
  AvatarGroup,
  AvatarGroupTooltip,
  AvatarGroupTooltipArrow,
} from "@/components/ui/avatar-group"
import { projects, getAllTags } from "@/lib/data/projects"

function ProjectCard({ project }: { project: typeof projects[0] }) {
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

type Category = "all" | string

export default function ProjectsPage() {
  const [projectsTextMask, setProjectsTextMask] = useState<string | undefined>(undefined)
  const [selectedCategory, setSelectedCategory] = useState<Category>("all")

  useEffect(() => {
    // Create a canvas-based text mask for "PROJECTS"
    const canvas = document.createElement("canvas")
    // Use reasonable dimensions - AsciiGrid will scale it appropriately
    canvas.width = 1200
    canvas.height = 400
    const ctx = canvas.getContext("2d")
    
    if (!ctx) return

    // Clear with transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Set up text styling - bold and large
    ctx.fillStyle = "white"
    ctx.font = "bold 200px system-ui, -apple-system, sans-serif"
    ctx.textAlign = "left"
    ctx.textBaseline = "top"
    
    // Draw "PROJECTS" text - positioned in upper-left area
    const text = "PROJECTS"
    ctx.fillText(text, 50, 50)
    
    // Convert to data URL
    const dataUrl = canvas.toDataURL("image/png")
    // Use requestAnimationFrame to avoid synchronous setState in effect
    requestAnimationFrame(() => {
      setProjectsTextMask(dataUrl)
    })
  }, [])

  const allTags = getAllTags()
  
  const filteredProjects = projects.filter((project) => {
    if (selectedCategory === "all") return true
    
    return project.tags.some((tag) => 
      tag.toLowerCase() === selectedCategory.toLowerCase()
    )
  })

  const getCategoryLabel = (category: Category): string => {
    if (category === "all") return "All categories"
    return category.charAt(0).toUpperCase() + category.slice(1)
  }

  return (
    <div className="min-h-screen">
      {/* Dark Blue Header Section */}
      <section className="relative bg-white text-secondary-black pt-64 pb-24 overflow-hidden">
         {/* Ascii Grid Background */}
        <div className="absolute inset-0 pointer-events-none">
          <AsciiGrid 
            color="rgba(0, 0, 0, 0.2)" 
            cellSize={12} 
            logoSrc={projectsTextMask}
            logoPosition="center"
            logoScale={0.6}
            enableDripping={false}
            className="w-full h-full"
          />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-white via-white/50 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_40%,white_100%)] pointer-events-none" />
        </div>
        <div className="container max-w-7xl relative z-10 mx-auto px-4 md:px-6 pb-8">

          {/* Main Title */}
          <h4 className="text-3xl  mb-2 tracking-tighter">
            <span className="font-serif font-normal text-primary">(Featured)</span> Work
          </h4>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter">
            Projects
          </h1>


        </div>
      </section>

      {/* White Content Area */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-8 xl:px-8">
        <section className="relative max-w-7xl mx-auto z-20 -mt-24 bg-neutral-50 rounded-3xl p-4 md:p-8 mb-24 shadow-lg border">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-8">
            <div className="flex flex-col gap-2">
              <div>
                <Link href="/" className="text-secondary-gray hover:text-primary transition-colors text-sm font-medium">
                  Home
                </Link>
                <span className="text-gray-300 mx-2">/</span>
                <span className="text-primary font-medium text-sm">Projects</span>
              </div>
              <p className="text-lg md:text-xl max-w-2xl opacity-95 leading-relaxed font-serif">
                Explore selected projects and see who built them, from internal initiatives to collaborations with industry partners.
              </p>
            </div>
            {/* Category Filter Dropdown */}

          <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                >
                  {getCategoryLabel(selectedCategory)}
                  <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[220px]">
                <DropdownMenuItem onClick={() => setSelectedCategory("all")}>
                  All categories
                </DropdownMenuItem>
                {allTags.map((tag) => (
                  <DropdownMenuItem key={tag} onClick={() => setSelectedCategory(tag)}>
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

         

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-secondary-gray">
                <p className="text-lg">No projects found in this category.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
