"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ExternalLink, Mail, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { AsciiGrid } from "@/components/ui/ascii-grid"
import { Markdown } from "@/components/ui/markdown"
import { useProject } from "@/hooks/projects"

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  
  // Use React Query to fetch the single project
  const { data: project, isLoading, isError } = useProject(id)
  const [projectTextMask, setProjectTextMask] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!project || !project.title) return
    
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
    requestAnimationFrame(() => setProjectTextMask(dataUrl))
  }, [project])

  const getInitials = (name: string) => {
    if (!name) return "UK"
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "TBD"
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <h1 className="text-2xl font-medium text-secondary-black">Loading project details...</h1>
      </div>
    )
  }

  if (isError || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-secondary-black">Project not found</h1>
          <p className="text-secondary-gray mb-8">The project you are looking for does not exist or failed to load.</p>
          <Button asChild><Link href="/projects">Back to Projects</Link></Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <section className="relative bg-white text-secondary-black pt-64 pb-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <AsciiGrid 
            color="rgba(0, 0, 0, 0.2)" 
            cellSize={12} 
            logoSrc={projectTextMask}
            logoPosition="center"
            logoScale={1}
            enableDripping={false}
            className="w-full h-full"
          />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-white via-white/50 to-transparent pointer-events-none" />
        </div>
        
        <div className="container max-w-7xl relative z-10 mx-auto px-4 md:px-6 pb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium capitalize">{project.status}</span>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-base mb-6 tracking-tighter">{project.title}</h1>
            <p className="text-lg md:text-xl leading-relaxed font-serif max-w-2xl opacity-95">
              {project.oneLineDescription}
            </p>
          </div>
        </div>
      </section>

      <div className="px-4 sm:px-6 md:px-8 lg:px-8 xl:px-8">
        <section className="relative max-w-7xl mx-auto z-20 -mt-24 bg-neutral-50 rounded-3xl p-4 md:p-8 mb-24 shadow-lg border">
        <div className="mb-8 flex items-center">
            <Link href="/" className="text-secondary-gray hover:text-primary transition-colors text-sm font-medium">Home</Link>
            <span className="text-gray-300 mx-2">/</span>
            <Link href="/projects" className="text-secondary-gray hover:text-primary transition-colors text-sm font-medium">Projects</Link>
            <span className="text-gray-300 mx-2">/</span>
            <span className="text-primary font-medium text-sm truncate max-w-md inline-block">
              {project.title}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              
              {project.problemImpact && (
                <>
                  <div>
                    <h2 className="text-xl font-base mb-4 text-secondary-black flex items-center gap-2">Problem & Impact</h2>
                    <Markdown content={project.problemImpact} className="text-secondary-black" />
                  </div>
                  <Separator />
                </>
              )}

              {project.techStack && project.techStack.length > 0 && (
                <>
                  <div>
                    <h2 className="text-xl font-base mb-4 text-secondary-black flex items-center gap-2">Tech Stack</h2>
                    <div className="flex flex-wrap gap-2">
                      {project.techStack.map((tech: string) => (
                        <Badge key={tech} variant="secondary" className="text-sm">{tech}</Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {project.keyFeatures && project.keyFeatures.length > 0 && (
                <>
                  <div>
                    <h2 className="text-xl font-base mb-4 text-secondary-black flex items-center gap-2">Key Features</h2>
                    <ul className="space-y-3">
                      {project.keyFeatures.map((feature: string) => (
                        <li key={feature} className="flex gap-3">
                          <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-secondary-black leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Separator />
                </>
              )}

              {project.screenshots && project.screenshots.length > 0 && (
                <>
                  <div>
                    <h2 className="text-xl font-base mb-4 text-secondary-black flex items-center gap-2">Screenshots</h2>
                    <div className="grid grid-cols-1 gap-6">
                      {project.screenshots.map((screenshot: { image: string; caption: string; alt?: string }) => (
                        <div key={screenshot.image} className="space-y-2">
                          <div className="relative w-full">
                            <Image src={screenshot.image} alt={screenshot.alt || screenshot.caption || "Screenshot"} width={1200} height={675} className="w-full h-auto" />
                          </div>
                          <p className="text-sm text-muted-foreground font-mono leading-relaxed">{screenshot.caption}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}
            
              {project.timeline && (
                <>
                  <div>
                    <h2 className="text-xl font-base mb-4 text-secondary-black flex items-center gap-2">Timeline</h2>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-1">Start Date</p>
                        <p className="text-lg text-secondary-black font-serif">{formatDate(project.timeline.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Current Phase</p>
                        <p className="text-lg text-secondary-black font-serif">{project.timeline.currentPhase || "Ongoing"}</p>
                      </div>
                      {project.timeline.upcomingMilestones && project.timeline.upcomingMilestones.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Upcoming Milestones</p>
                          <ul className="space-y-2">
                            {project.timeline.upcomingMilestones.map((milestone: string) => (
                              <li key={milestone} className="flex items-center gap-2 text-secondary-black">
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
                </>
              )}

              {project.affiliations && (
                <>
                  <div>
                    <h2 className="text-xl font-base mb-4 text-secondary-black">Affiliations</h2>
                    <p className="text-secondary-black">{project.affiliations}</p>
                  </div>
                  <Separator />
                </>
              )}

              {project.maintenancePlan && (
                <div>
                  <h2 className="text-xl font-base mb-4 text-secondary-black flex items-center gap-2">Maintenance & Deployment</h2>
                  <p className="prose prose-lg max-w-none text-secondary-black leading-relaxed">
                    {project.maintenancePlan}
                  </p>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-6">
                <div>
                  <div className="flex flex-col gap-3">
                    {project.repoUrl && (
                      <Button variant="default" asChild className="w-full">
                        <Link href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                          </svg>
                          View Repository
                        </Link>
                      </Button>
                    )}
                    {project.websiteUrl && (
                      <Button variant="outline" asChild className="w-full">
                        <Link href={project.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                          <ExternalLink className="h-4 w-4" />
                          Visit Website
                        </Link>
                      </Button>
                    )}
                    {project.contact && (
                      <Button variant="outline" asChild className="w-full">
                        <Link href={`mailto:${project.contact}`} className="flex items-center justify-center gap-2">
                          <Mail className="h-4 w-4" />
                          Contact Team
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>

                {project.contributors && project.contributors.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-4 text-secondary-black flex items-center gap-2">
                      Contributors
                    </h3>
                    <div className="space-y-3">
                      {project.contributors.map((contributor) => (
                        <Link
                          key={contributor.email}
                          href={contributor.profileId ? `/members/${contributor.profileId}` : "#"}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 transition-colors group"
                        >
                          <Avatar className="h-10 w-10 border-2 border-primary/10">
                            <AvatarImage src={contributor.avatar} alt={contributor.name} />
                            <AvatarFallback className="bg-primary text-white text-xs">
                              {getInitials(contributor.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-secondary-black truncate group-hover:text-primary transition-colors">
                              {contributor.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{contributor.role}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
