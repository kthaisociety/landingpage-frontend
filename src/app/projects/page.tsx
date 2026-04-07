"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { CaretDownIcon, GithubLogoIcon } from "@phosphor-icons/react"
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
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  AvatarGroup,
  AvatarGroupTooltip,
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

  const textColorClass = isLightBackground ? "text-foreground" : "text-primary-foreground"
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
        <h3 className={`text-2xl font-bold ${shadowClass} tracking-tight ${textColorClass}`}>
          {project.title}
        </h3>
        {project.repoUrl && project.repoUrl !== "#" && (
          <Tooltip>
            <TooltipTrigger asChild>
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
                className="flex items-center justify-center size-5 transition-all hover:opacity-70 hover:scale-110 active:scale-95 cursor-pointer shrink-0"
                aria-label="View repository"
              >
                <GithubLogoIcon className={`size-5 ${textColorClass}`} weight="fill" />
              </button>
            </TooltipTrigger>
            <TooltipContent>View repository</TooltipContent>
          </Tooltip>
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
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {getInitials(contributor.name)}
              </AvatarFallback>
            <AvatarGroupTooltip className="bg-card text-card-foreground rounded-lg px-3 py-2 shadow-lg">
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
    const canvas = document.createElement("canvas")
    canvas.width = 1200
    canvas.height = 400
    const ctx = canvas.getContext("2d")
    
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "white"
    ctx.font = "bold 200px system-ui, -apple-system, sans-serif"
    ctx.textAlign = "left"
    ctx.textBaseline = "top"
    
    const text = "PROJECTS"
    ctx.fillText(text, 50, 50)
    
    const dataUrl = canvas.toDataURL("image/png")
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
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <section className="relative bg-background text-foreground pt-64 pb-24 overflow-hidden">
        {/* Ascii Grid Background */}
        <div className="absolute inset-0 pointer-events-none">
          <AsciiGrid 
            color="var(--color-primary)" 
            cellSize={12} 
            logoSrc={projectsTextMask}
            logoPosition="center"
            logoScale={0.6}
            enableDripping={false}
            className="w-full h-full"
          />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-muted via-background/50 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_40%,var(--color-background)_100%)] pointer-events-none" />
        </div>
        <div className="container max-w-7xl relative z-10 mx-auto px-4 md:px-6 pb-8">
          <h4 className="text-3xl mb-2 tracking-tighter">
            <span className="font-serif font-normal text-primary">(Featured)</span> Work
          </h4>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter">
            Projects
          </h1>
        </div>
      </section>

      {/* Content Area */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-8 xl:px-8">
        <section className="relative max-w-7xl mx-auto z-20 -mt-24 bg-card text-card-foreground rounded-none p-4 md:p-8 mb-24 shadow-lg ring-1 ring-foreground/10">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-8">
            <div className="flex flex-col gap-2">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Projects</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <p className="text-lg md:text-xl max-w-2xl leading-relaxed tracking-tight text-muted-foreground">
                Explore selected projects and see who built them, from internal initiatives to collaborations with industry partners.
              </p>
            </div>
            {/* Category Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {getCategoryLabel(selectedCategory)}
                  <CaretDownIcon className="size-4 opacity-50 ml-2" />
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
              <div className="col-span-full">
                <Empty className="border border-dashed border-border py-12">
                  <EmptyHeader>
                    <EmptyTitle>No projects found</EmptyTitle>
                    <EmptyDescription>
                      No projects found in this category. Try a different filter.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
