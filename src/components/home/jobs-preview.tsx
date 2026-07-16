"use client"

import { useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ImageCard } from "@/components/ui/image-card"
import { useJobs } from "@/hooks/admin"
import { useCompanies } from "@/hooks/admin"
import type { SmallJobListing } from "@/hooks/admin"
import { JobsSkeleton } from "@/components/jobs/job-card-skeleton"
import { API_URL } from "@/config"
import { NIL_UUID } from "@/lib/constants/companies"

function JobCard({ job }: { job: SmallJobListing & { companyLogo?: string | null } }) {
  const gradientColors = {
    from: "from-white/60",
    via: "via-white/20",
    to: "to-transparent",
  }

  const tags: string[] = []
  if (job.jobType) tags.push(job.jobType)

  if (job.location) {
    try {
      const parsedLoc =
        typeof job.location === "string"
          ? JSON.parse(job.location)
          : job.location
      if (parsedLoc.place) tags.push(parsedLoc.place)
      if (parsedLoc.tag) tags.push(parsedLoc.tag)
    } catch {
      tags.push(job.location)
    }
  }

  const companySlug = (job.company || "company")
    .toLowerCase()
    .replace(/\s+/g, "-")
  const coverImage = `/cover-${companySlug}.jpg`

  return (
    <Link href={`/business/jobs/${job.id}`}>
      <ImageCard
        image={coverImage}
        fallbackImage="/project-placeholder.webp"
        alt={job.company || "Company"}
        blurHeight="70%"
        gradientColors={gradientColors}
        tags={tags}
      >
        <h3 className="text-2xl font-base mb-2 drop-shadow-lg tracking-tight text-black">
          {job.title}
        </h3>

        <div className="flex items-center gap-3 mb-2">
          {job.companyLogo ? (
            <Image
              src={job.companyLogo}
              alt={`${job.company} logo`}
              width={32}
              height={32}
              className="rounded object-contain bg-white border border-gray-200/50 shadow-sm"
              unoptimized
            />
          ) : (
            <div className="h-8 w-8 rounded bg-white/70 border border-gray-200/50 shadow-sm flex items-center justify-center text-xs font-bold text-black">
              {(job.company || "C")[0].toUpperCase()}
            </div>
          )}
          <p className="text-base drop-shadow-lg font-mono text-black">
            {job.company}
          </p>
        </div>
      </ImageCard>
    </Link>
  )
}

export function JobsPreview() {
  const { data: jobs = [], isLoading } = useJobs()
  const { data: companies = [] } = useCompanies()

  const enrichedJobs = useMemo(() => {
    return jobs.map((job) => {
      const companyData = companies.find(
        (c) => c.id === job.companyId || c.name === job.company,
      )
      const hasValidLogo = companyData?.logo && companyData.logo !== NIL_UUID

      return {
        ...job,
        companyLogo: hasValidLogo
          ? `${API_URL}/company/logo?id=${companyData.logo}`
          : null,
      }
    })
  }, [jobs, companies])

  // Show first 3 jobs for preview (most recent)
  const previewJobs = enrichedJobs.slice(0, 3)

  return (
    <section className="container mx-auto py-16 px-4 w-full max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          <span className="text-primary font-times font-normal">(Career)</span> Opportunities
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
