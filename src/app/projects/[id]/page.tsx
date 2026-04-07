"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowSquareOutIcon, EnvelopeIcon, CaretRightIcon, GithubLogoIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { AsciiGrid } from "@/components/ui/ascii-grid"
import { Markdown } from "@/components/ui/markdown"
import { Empty, EmptyHeader, EmptyTitle, EmptyContent } from "@/components/ui/empty"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { getProjectById } from "@/lib/data/projects"

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const project = getProjectById(id)
  const [projectTextMask, setProjectTextMask] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!project) return
    
    const canvas = document.createElement("canvas")
    canvas.width = 1400
    canvas.height = 400
    const ctx = canvas.getContext("2d")
    
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "white"
    ctx.font = "bold 150px system-ui, -apple-system, sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    
    ctx.fillText(project.title.toUpperCase(), canvas.width / 2, canvas.height / 2)
    
    const dataUrl = canvas.toDataURL("image/png")
    requestAnimationFrame(() => {
      setProjectTextMask(dataUrl)
    })
  }, [project])

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Project not found</EmptyTitle>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/projects">Back to Projects</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with ASCII Grid */}
      <section className="relative bg-background text-foreground pt-64 pb-24 overflow-hidden">
        {/* Ascii Grid Background */}
        <div className="absolute inset-0 pointer-events-none">
          <AsciiGrid 
            color="var(--color-primary)" 
            cellSize={12} 
            logoSrc={projectTextMask}
            logoPosition="center"
            logoScale={1}
            enableDripping={false}
            className="w-full h-full"
          />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-muted via-background/50 to-transparent pointer-events-none" />
        </div>
        
        <div className="container max-w-7xl relative z-10 mx-auto px-4 md:px-6 pb-8">
          {/* Status Badge */}
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1" />
              {project.status}
            </Badge>
          </div>

          {/* Title and Description */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-base mb-6 tracking-tighter">
              {project.title}
            </h1>
            <p className="text-lg md:text-xl leading-relaxed font-serif max-w-2xl opacity-95 text-foreground">
              {project.oneLineDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Content Area */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-8 xl:px-8">
        <section className="relative max-w-7xl mx-auto z-20 -mt-24 bg-card text-card-foreground rounded-none p-4 md:p-8 mb-24 shadow-lg ring-1 ring-foreground/10">
          {/* Breadcrumbs */}
          <div className="mb-8">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="truncate max-w-md">{project.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* 2 Column Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Problem & Impact */}
              <div>
                <h2 className="text-xl font-base mb-4 text-foreground flex items-center gap-2">
                  Problem & Impact
                </h2>
                <Markdown content={project.problemImpact} className="text-foreground" />
              </div>

              <Separator />

              {/* Tech Stack */}
              <div>
                <h2 className="text-xl font-base mb-4 text-foreground flex items-center gap-2">
                  Tech Stack
                </h2>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <Badge key={tech} variant="secondary" className="text-sm">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

                {/* Key Features */}
                <div>
                <h2 className="text-xl font-base mb-4 text-foreground flex items-center gap-2">
                  Key Features
                </h2>
                <ul className="space-y-3">
                  {project.keyFeatures.map((feature) => (
                    <li key={feature} className="flex gap-3">
                      <CaretRightIcon className="size-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              {/* Screenshots Gallery */}
              {project.screenshots && project.screenshots.length > 0 && (
                <>
                  <div>
                    <h2 className="text-xl font-base mb-4 text-foreground flex items-center gap-2">
                      Screenshots
                    </h2>
                    <div className="grid grid-cols-1 gap-6">
                      {project.screenshots.map((screenshot) => (
                        <div key={screenshot.image} className="space-y-2">
                          <div className="relative w-full">
                            <Image
                              src={screenshot.image}
                              alt={screenshot.alt || screenshot.caption}
                              width={1200}
                              height={675}
                              className="w-full h-auto"
                            />
                          </div>
                          <p className="text-sm text-muted-foreground font-mono leading-relaxed">
                            {screenshot.caption}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />
                </>
              )}

              {/* Timeline */}
              <div>
                <h2 className="text-xl font-base mb-4 text-foreground flex items-center gap-2">
                  Timeline
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1 text-muted-foreground">Start Date</p>
                    <p className="text-lg text-foreground font-serif">{formatDate(project.timeline.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1 text-muted-foreground">Current Phase</p>
                    <p className="text-lg text-foreground font-serif">{project.timeline.currentPhase}</p>
                  </div>
                  {project.timeline.upcomingMilestones && project.timeline.upcomingMilestones.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2 text-muted-foreground">Upcoming Milestones</p>
                      <ul className="space-y-2">
                        {project.timeline.upcomingMilestones.map((milestone) => (
                          <li key={milestone} className="flex items-center gap-2 text-foreground">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                            {milestone}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Affiliations */}
              <div>
                <h2 className="text-xl font-base mb-4 text-foreground">Affiliations</h2>
                <p className="text-foreground">{project.affiliations}</p>
              </div>

              <Separator />

              {/* Maintenance Plan */}
              <div>
                <h2 className="text-xl font-base mb-4 text-foreground flex items-center gap-2">
                  Maintenance & Deployment
                </h2>
                <p className="prose prose-lg max-w-none text-foreground leading-relaxed">
                  {project.maintenancePlan}
                </p>
              </div>
            </div>

            {/* Right Column - Sticky Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-6">
                {/* Action Buttons */}
                <div>
                  <div className="flex flex-col gap-3">
                    {project.repoUrl && (
                      <Button variant="default" asChild className="w-full">
                        <Link href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                          <GithubLogoIcon className="size-4" weight="fill" />
                          View Repository
                        </Link>
                      </Button>
                    )}
                    {project.websiteUrl && (
                      <Button variant="outline" asChild className="w-full">
                        <Link href={project.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                          <ArrowSquareOutIcon className="size-4" />
                          Visit Website
                        </Link>
                      </Button>
                    )}
                    <Button variant="outline" asChild className="w-full">
                      <Link href={`mailto:${project.contact}`} className="flex items-center justify-center gap-2">
                        <EnvelopeIcon className="size-4" />
                        Contact Team
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Contributors */}
                <div>
                  <h3 className="text-lg font-medium mb-4 text-foreground flex items-center gap-2">
                    Contributors
                  </h3>
                  <div className="space-y-3">
                    {project.contributors.map((contributor) => (
                      <div key={contributor.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
                        <Avatar className="h-10 w-10 border-2 border-primary/10">
                          <AvatarImage src={contributor.avatar} alt={contributor.name} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {getInitials(contributor.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{contributor.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{contributor.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
