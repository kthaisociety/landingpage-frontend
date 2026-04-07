"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon, BriefcaseIcon, MapPinIcon, CurrencyDollarIcon, ArrowSquareOutIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { AsciiGrid } from "@/components/ui/ascii-grid"
import { Skeleton } from "@/components/ui/skeleton"
import { Markdown } from "@/components/ui/markdown"
import { Empty, EmptyHeader, EmptyTitle, EmptyContent } from "@/components/ui/empty"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { useJob } from "@/hooks/jobs"

export default function JobDetailPage() {
  const params = useParams()
  const jobId = params?.id as string
  const { data: job, isLoading: loading, error: queryError } = useJob(jobId)
  const [jobsTextMask, setJobsTextMask] = useState<string | undefined>(undefined)

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
    
    const text = "JOB"
    ctx.fillText(text, 50, 50)
    
    const dataUrl = canvas.toDataURL("image/png")
    requestAnimationFrame(() => {
      setJobsTextMask(dataUrl)
    })
  }, [])

  const error = queryError instanceof Error ? queryError.message : queryError ? String(queryError) : null

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <section className="relative bg-background text-foreground pt-64 pb-24 overflow-hidden">
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
          <div className="container max-w-7xl relative z-10 mx-auto px-4 md:px-6">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        </section>
        <div className="px-4 sm:px-6 md:px-8 lg:px-8 xl:px-8">
          <section className="relative max-w-7xl mx-auto z-20 -mt-24 bg-card text-card-foreground rounded-none p-4 md:p-8 mb-24 shadow-lg ring-1 ring-foreground/10">
            <Skeleton className="h-64 w-full" />
          </section>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-background">
        <section className="relative bg-background text-foreground pt-64 pb-24 overflow-hidden">
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
          <div className="container max-w-7xl relative z-10 mx-auto px-4 md:px-6">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter">
              Job Not Found
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-2xl opacity-95 leading-relaxed font-serif text-muted-foreground">
              {error || "The job you're looking for doesn't exist."}
            </p>
            <Button asChild>
              <Link href="/business/jobs">
                <ArrowLeftIcon className="mr-2 size-4" />
                Back to Jobs
              </Link>
            </Button>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <section className="relative bg-background text-foreground pt-64 pb-24 overflow-hidden">
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
        </div>
        <div className="container max-w-7xl relative z-10 mx-auto px-4 md:px-6 pb-8">
          {/* Job Title */}
          <h1 className="text-5xl md:text-7xl font-base mb-6 tracking-tighter">
            {job.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap gap-6 text-base text-foreground/90">
            {job.location && (
              <div className="flex items-center gap-2">
                <MapPinIcon className="size-5" />
                <span>{job.location}</span>
              </div>
            )}
            {job.jobType && (
              <div className="flex items-center gap-2">
                <BriefcaseIcon className="size-5" />
                <span className="capitalize">{job.jobType}</span>
              </div>
            )}
            {job.salary && (
              <div className="flex items-center gap-2">
                <CurrencyDollarIcon className="size-5" />
                <span>{job.salary}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content Area */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-8 xl:px-8">
        <section className="relative max-w-7xl mx-auto z-20 -mt-24 bg-card text-card-foreground rounded-none p-4 md:p-8 mb-24 shadow-lg ring-1 ring-foreground/10">
          <div className="container mx-auto">
          {/* Breadcrumbs */}
          <div className="mb-8">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/business/jobs">Jobs</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{job.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4 tracking-tight text-foreground">About the Role</h2>
                <Markdown content={job.description} />
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4 tracking-tight text-foreground">Apply Now</h3>
                
                {/* Apply Button */}
                {job.applicationUrl && (
                  <Button className="w-full mb-4" size="lg" asChild>
                    <Link href={job.applicationUrl} target="_blank" rel="noopener noreferrer">
                      <ArrowSquareOutIcon className="mr-2 size-4" />
                      Apply or Explore
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        </section>
      </div>
    </div>
  )
}
