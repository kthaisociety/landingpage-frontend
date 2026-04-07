"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { CaretDownIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AsciiGrid } from "@/components/ui/ascii-grid"
import { JobsSkeleton } from "@/components/jobs/job-card-skeleton"
import { ImageCard } from "@/components/ui/image-card"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { useJobs } from "@/hooks/jobs"
import type { JobListing } from "@/hooks/jobs"

type JobFilter = "all" | "internship" | "summer-internship" | "part-time" | "full-time" | "volunteering" | "master-thesis" | "other"

function JobCard({ job }: { job: JobListing }) {
  const gradientColors = {
    from: "from-white/60",
    via: "via-white/20",
    to: "to-transparent",
  }

  const tags: string[] = []
  if (job.jobType) tags.push(job.jobType)
  if (job.tags && job.tags.length) tags.push(...job.tags)
  if (job.location) tags.push(job.location)

  const companySlug = job.company.toLowerCase().replace(/\s+/g, "-")
  const coverImage = job.companyLogo || `/cover-${companySlug}.jpg`

  return (
    <Link href={`/business/jobs/${job.id}`}>
      <ImageCard
        image={coverImage}
        alt={job.company}
        blurHeight="70%"
        gradientColors={gradientColors}
        tags={tags}
      >
        <h3 className="text-2xl font-base mb-1 drop-shadow-lg tracking-tight text-foreground">
          {job.title}
        </h3>

        <p className="text-base drop-shadow-lg mb-3 font-mono text-foreground">
          {job.company}
        </p>
      </ImageCard>
    </Link>
  )
}

export default function JobListingPage() {
  const [jobsTextMask, setJobsTextMask] = useState<string | undefined>(undefined)
  const [selectedFilter, setSelectedFilter] = useState<JobFilter>("all")
  const { data: jobs, isLoading: loading, error: queryError } = useJobs()

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
    
    const text = "JOBS"
    ctx.fillText(text, 50, 50)
    
    const dataUrl = canvas.toDataURL("image/png")
    requestAnimationFrame(() => {
      setJobsTextMask(dataUrl)
    })
  }, [])

  const error = queryError instanceof Error ? queryError.message : queryError ? String(queryError) : null

  const filteredJobs = (jobs ?? []).filter((job) => {
    if (selectedFilter === "all") return true
    const normalizedJobType = job.jobType?.toLowerCase().replace(/\s+/g, '-')
    return normalizedJobType === selectedFilter
  })

  const getFilterLabel = (filter: JobFilter): string => {
    switch (filter) {
      case "all":
        return "Show all"
      case "internship":
        return "Internship"
      case "summer-internship":
        return "Summer internship"
      case "part-time":
        return "Part-time job"
      case "full-time":
        return "Full-time job"
      case "volunteering":
        return "Volunteering"
      case "master-thesis":
        return "Master thesis"
      case "other":
        return "Other"
      default:
        return "Show all"
    }
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
            logoSrc={jobsTextMask}
            logoPosition="center"
            logoScale={0.6}
            enableDripping={false}
            className="w-full h-full"
          />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-muted via-background/50 to-transparent pointer-events-none" />
        </div>
        <div className="container max-w-7xl relative z-10 mx-auto px-4 md:px-6 pb-8">
          <h4 className="text-3xl mb-2 tracking-tighter">
            <span className="font-serif font-normal text-primary">(Career)</span> Opportunities
          </h4>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter">
            Job Board
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
                    <BreadcrumbPage>Jobs</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <p className="text-lg md:text-xl max-w-3xl leading-relaxed tracking-tight text-muted-foreground">
                Connecting our members with industry opportunities. Browse current openings below.
                If you want to make a job posting contact us at <a href="mailto:jobs@kthais.com" className="text-primary">jobs@kthais.com</a>.
              </p>
            </div>

            {/* Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {getFilterLabel(selectedFilter)}
                  <CaretDownIcon className="size-4 opacity-50 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="bottom" className="min-w-[220px]">
                <DropdownMenuItem onClick={() => setSelectedFilter("all")}>
                  Show all
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedFilter("internship")}>
                  Internship
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedFilter("summer-internship")}>
                  Summer internship
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedFilter("part-time")}>
                  Part-time job
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedFilter("full-time")}>
                  Full-time job
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedFilter("volunteering")}>
                  Volunteering
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedFilter("master-thesis")}>
                  Master thesis
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedFilter("other")}>
                  Other
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Jobs Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <JobsSkeleton />
            </div>
          ) : error ? (
            <Empty className="border border-dashed border-destructive/50 py-12">
              <EmptyHeader>
                <EmptyTitle className="text-destructive">Error: {error}</EmptyTitle>
              </EmptyHeader>
            </Empty>
          ) : filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <Empty className="border border-dashed border-border py-12">
              <EmptyHeader>
                <EmptyTitle>No jobs found</EmptyTitle>
                <EmptyDescription>
                  There are no jobs matching your filter. Try a different selection.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </section>
      </div>
    </div>
  )
}
