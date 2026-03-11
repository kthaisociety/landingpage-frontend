import { NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

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

