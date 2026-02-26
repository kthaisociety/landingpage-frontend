"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ImageCard } from "@/components/ui/image-card"
import { useJobs } from "@/hooks/jobs"
import type { JobListing } from "@/hooks/jobs"
import { JobsSkeleton } from "@/components/jobs/job-card-skeleton"

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

export function JobsPreview() {
  const { data: jobs = [], isLoading } = useJobs()

  // Show first 3 jobs for preview (most recent)
  const previewJobs = jobs.slice(0, 3)

  return (
    <section className="container mx-auto py-16 px-4 w-full max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          <span className="text-primary font-serif font-normal">(Career)</span> Opportunities
        </h2>
        <Button asChild>
          <Link href="/business/jobs">
            <span className="hidden md:block">See all </span>Jobs
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Jobs Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <JobsSkeleton />
        </div>
      ) : previewJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {previewJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-secondary-gray">
          <p className="text-lg">No jobs available at the moment.</p>
        </div>
      )}
    </section>
  )
}
