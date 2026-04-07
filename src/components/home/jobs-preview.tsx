"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRightIcon, ArrowUpRightIcon, BriefcaseIcon, MapPinIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { FadeIn } from "@/components/ui/fade-in"
import { useJobs } from "@/hooks/jobs"
import type { JobListing } from "@/hooks/jobs"
import { JobsSkeleton } from "@/components/jobs/job-card-skeleton"

function JobRow({ job }: { job: JobListing }) {
  const companySlug = job.company.toLowerCase().replace(/\s+/g, "-")
  const coverImage = job.companyLogo || `/cover-${companySlug}.jpg`

  return (
    <Card className="transition-colors hover:bg-accent">
      <CardContent className="py-0">
        <Link
          href={`/business/jobs/${job.id}`}
          className="group flex items-center gap-4 py-4"
        >
          {/* Company logo thumbnail */}
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
            <Image
              src={coverImage}
              alt={job.company}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>

          {/* Title + company */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold tracking-tight text-card-foreground leading-snug">
              {job.title}
            </p>
            <p className="truncate text-sm text-muted-foreground font-mono mt-0.5">{job.company}</p>
          </div>

          {/* Badges — hidden on narrow mobile */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            {job.jobType && (
              <Badge variant="secondary" className="text-xs font-mono">
                <BriefcaseIcon className="size-3 mr-1" />
                {job.jobType}
              </Badge>
            )}
            {job.location && (
              <Badge variant="outline" className="text-xs font-mono">
                <MapPinIcon className="size-3 mr-1" />
                {job.location}
              </Badge>
            )}
          </div>

          <ArrowUpRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
        </Link>
      </CardContent>
    </Card>
  )
}

export function JobsPreview() {
  const { data: jobs = [], isLoading } = useJobs()
  const previewJobs = jobs.slice(0, 4)

  return (
    <section className="container mx-auto py-20 px-4 w-full max-w-7xl">
      <FadeIn>
        <div className="flex items-center justify-between mb-10">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          <span className="text-primary font-serif font-normal">(Career)</span> Opportunities
        </h2>
        <Button asChild>
          <Link href="/business/jobs">
            <span className="hidden md:block">See all </span>Jobs
            <ArrowRightIcon className="size-4" />
          </Link>
        </Button>
      </div>
      </FadeIn>

      <FadeIn delay={0.1}>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <JobsSkeleton />
        </div>
      ) : previewJobs.length > 0 ? (
        <div className="flex flex-col gap-2">
          {previewJobs.map((job) => (
            <JobRow key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <Empty className="border border-dashed border-border py-12">
          <EmptyHeader>
            <EmptyTitle>No jobs available</EmptyTitle>
            <EmptyDescription>
              There are no open positions at the moment. Check back soon for new opportunities.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      </FadeIn>
    </section>
  )
}
