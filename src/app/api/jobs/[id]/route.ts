import { NextResponse } from "next/server"
import { API_BASE } from "@/config/env"

// BACKEND_URL is read at runtime (see src/config/env.ts), not at build.
export const dynamic = "force-dynamic"

const API_URL = API_BASE

export type JobDetail = {
  id: string
  title: string
  company: string
  companyLogo?: string
  jobType: string
  location: string
  salary?: string
  description: string
  requirements?: string[]
  responsibilities?: string[]
  benefits?: string[]
  applicationUrl?: string
  contactEmail?: string
  createdAt: string
  updatedAt: string
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: jobId } = await params

  try {
    const response = await fetch(`${API_URL}/api/v1/jobs/${jobId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Job not found" },
          { status: 404 }
        )
      }
      throw new Error(`Backend API error: ${response.status}`)
    }

    const job = await response.json()

    return NextResponse.json({
      job,
    })
  } catch (error) {
    console.error("Error fetching job:", error)
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch job",
      },
      { status: 500 }
    )
  }
}

