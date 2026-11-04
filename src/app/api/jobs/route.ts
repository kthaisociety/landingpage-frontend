import { NextResponse } from "next/server"
import { API_BASE } from "@/config/env"

// BACKEND_URL is read at runtime (see src/config/env.ts), not at build.
export const dynamic = "force-dynamic"

const API_URL = API_BASE

export type JobListing = {
  id: string
  title: string
  company: string
  companyLogo?: string
  jobType: string
  tags?: string[]
  location: string
  salary?: string
  description: string
  createdAt: string
  updatedAt: string
}

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/api/v1/jobs`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const jobs = await response.json()

    return NextResponse.json({
      jobs: jobs || [],
    })
  } catch (error) {
    console.error("Error fetching jobs:", error)
    
    // Return empty array if backend is not available
    return NextResponse.json({
      jobs: [],
      error: error instanceof Error ? error.message : "Failed to fetch jobs",
    })
  }
}

