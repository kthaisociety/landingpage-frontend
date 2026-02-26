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
import { AsciiGrid } from "@/components/ui/ascii-grid"
import { JobsSkeleton } from "@/components/jobs/job-card-skeleton"
import { ImageCard } from "@/components/ui/image-card"
import { useJobs } from "@/hooks/jobs"
import type { JobListing } from "@/hooks/jobs"

type JobFilter = "all" | "internship" | "summer-internship" | "part-time" | "full-time" | "volunteering" | "master-thesis" | "other"

function JobCard({ job }: { job: JobListing }) {
  // Determine gradient colors - using a consistent dark gradient for jobs
  const gradientColors = {
    from: "from-white/60",
    via: "via-white/20",
    to: "to-transparent",
  }

  // Create tags array from job properties
  const tags = []
  if (job.jobType) tags.push(job.jobType)
  if (job.location) tags.push(job.location)

  // Prefer explicit company logo if provided, otherwise fall back to generated cover path
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
        {/* Title */}
        <h3 className="text-2xl font-base mb-1 drop-shadow-lg tracking-tight text-black">
          {job.title}
        </h3>

        {/* Company Name */}
        <p className="text-base drop-shadow-lg mb-3 font-mono text-black">
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
    // Create a canvas-based text mask for "JOBS"
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
    // Normalize job type for comparison (lowercase, replace spaces with hyphens)
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
    <div className="min-h-screen">
      {/* Header Section */}
      <section className="relative bg-white text-secondary-black pt-64 pb-24 overflow-hidden">
        {/* Ascii Grid Background */}
        <div className="absolute inset-0 pointer-events-none">
          <AsciiGrid 
            color="rgba(0, 0, 0, 0.2)" 
            cellSize={12} 
            logoSrc={jobsTextMask}
            logoPosition="center"
            logoScale={0.6}
            enableDripping={false}
            className="w-full h-full"
          />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-white via-white/50 to-transparent pointer-events-none" />
        </div>
        <div className="container max-w-7xl relative z-10 mx-auto px-4 md:px-6 pb-8">
          {/* Main Title */}
          <h4 className="text-3xl mb-2 tracking-tighter">
            <span className="font-serif font-normal text-primary">(Career)</span> Opportunities
          </h4>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter">
            Job Board
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
                <span className="text-primary font-medium text-sm">Jobs</span>
              </div>
              <p className="text-lg md:text-xl max-w-3xl opacity-95 leading-relaxed font-serif">
                Connecting our members with industry opportunities. Browse current openings below.
                If you want to make a job posting contact us at <a href="mailto:jobs@kthais.com" className="text-primary">jobs@kthais.com</a>.
              </p>
            </div>

            {/* Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {getFilterLabel(selectedFilter)}
                  <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
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
            <div className="text-center py-12 text-red-500">
              <p className="text-lg">Error: {error}</p>
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-secondary-gray">
              <p className="text-lg">No jobs found.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
