import { useEffect, useMemo, useState } from "react";
import type { JobListing } from "@/app/api/jobs/route";
import type { JobDetail } from "@/app/api/jobs/[id]/route";

export type JobPostInput = {
  title: string;
  description: string;
  type: string;
  location: string;
  salary: string;
  companyId: string;
};

export type JobPost = JobPostInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

// Re-export JobListing type from API route
export type { JobListing } from "@/app/api/jobs/route";

// Extended JobListing type with optional fields for job details
export type ExtendedJobListing = JobListing & {
  contactEmail?: string;
  applicationUrl?: string;
};

const STORAGE_KEY = "kthais-job-listings";
const STORAGE_VERSION_KEY = "kthais-job-listings-version";
const CURRENT_VERSION = "1.0.0";

const getNowIso = () => new Date().toISOString();

// Helper function to persist jobs (needs to be defined before getStoredJobs)
const persistJobs = (jobs: ExtendedJobListing[]) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
    window.localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION);
  } catch (error) {
    // Handle quota exceeded or other storage errors
    console.error("Failed to persist jobs to localStorage:", error);
  }
};

// Validate job structure
const isValidJob = (job: unknown): job is ExtendedJobListing => {
  if (!job || typeof job !== "object") return false;
  const j = job as Record<string, unknown>;
  return (
    typeof j.id === "string" &&
    typeof j.title === "string" &&
    typeof j.company === "string" &&
    typeof j.jobType === "string" &&
    typeof j.location === "string" &&
    typeof j.description === "string" &&
    typeof j.createdAt === "string" &&
    typeof j.updatedAt === "string"
  );
};

// Seed data for initial jobs
// NOTE: This is a temporary solution until the backend API is available.
// In production, jobs should be managed through the backend API.
const getSeedJobs = (): ExtendedJobListing[] => {
  const now = getNowIso();
  return [
    {
      id: "andon-labs-research-study",
      title: "Paid Research Study",
      company: "Andon Labs",
      jobType: "Other",
      location: "Remote",
      salary: "200 SEK/hour",
      contactEmail: "hanna@andonlabs.com",
      applicationUrl: "https://docs.google.com/forms/d/1moSWzGseg4h6rJUmRSoK1U9b192QNczLUVgbZELHhS4/viewform",
      description: `Are you a Master's or PhD student and want to earn some extra money by comparing your mind to AI? Andon Labs and Google DeepMind are collaborating on a project exploring how intelligent AI is compared to some of the smartest people around. We're looking for students to represent humanity in this experiment!

## Key Info

**Details:**

- The study consists of 3 separate tests, each taking about 1 hour to complete
- You can do them remotely, whenever it suits you, within a limited time window
- Compensation: 200 SEK/hour
- Apply before: 2026-01-01

**Requirements:**

- Master's or PhD student (any field)
- Basic knowledge of command line usage

Questions? Reach out to hanna@andonlabs.com`,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "blenda-labs-fullstack",
      title: "Join Blenda Labs: Where AI Meets Filmmaking",
      company: "Blenda Labs",
      jobType: "Full-time job",
      location: "Stockholm",
      applicationUrl: "https://blendalabs.notion.site/Job-Ads-Blenda-Labs-27248bf3a0928045a482e6e9ace4a7d0",
      description: `Are you passionate about building products at the intersection of technology and creativity? At Blenda Labs, we're reimagining how movies are made, combining cutting-edge AI tools with creative talent to produce high-quality, cost-effective video at scale. We're now hiring for two key roles on our growing tech team:

## Key Info

**Roles:**

- Fullstack TypeScript Developer: AI Movies
- Fullstack Product + Data Lead (Analytics & Dashboard)

**Who:** You're a hungry, ambitious Fullstack Developer who thrives in a startup environment

**Skills:** Specific to roles, see the application link for more information

**Location:** Hybrid role in Stockholm

**Duration:** Start with a 3 month consultant role to see if we're a good fit.

**Apply before:** 2026-01-01`,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "vantir-ab-foundry",
      title: "Forging founders from KTH talent",
      company: "Vantir AB",
      jobType: "Other",
      location: "Remote",
      applicationUrl: "https://vantir.se/careers#application-form",
      description: `Do you dream of building a start-up? Vantir Foundry gives you the chance to join a team, build from idea to product to market, and earn equity.

Our team brings experience from Amazon, Avanza, and Netlight, private-equity evaluations of 15+ BSEK, and 500+ MSEK raised in venture capital.

Join our founding team for a live case:

• CTO – responsible for architecture & stack.

• 2 × Fullstack Developers – React Native + backend.

• Data Scientists – MLOps & AI Focus

• Data Engineers – Focus on Data Warehouse and pipelines

• UX/UI Designer – creates intuitive interfaces.

• Growth Hacker – drives TikTok, community & viral growth

**Apply before:** 2026-01-01`,
      createdAt: now,
      updatedAt: now,
    },
  ];
};

const getStoredJobs = (): ExtendedJobListing[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const version = window.localStorage.getItem(STORAGE_VERSION_KEY);
    
    if (!raw || version !== CURRENT_VERSION) {
      // Initialize or migrate with seed data
      const seedJobs = getSeedJobs();
      persistJobs(seedJobs);
      return seedJobs;
    }
    
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      // Invalid data structure, reset with seed data
      const seedJobs = getSeedJobs();
      persistJobs(seedJobs);
      return seedJobs;
    }
    
    // Validate and filter out invalid jobs
    const storedJobs = parsed.filter(isValidJob);
    
    // Update existing jobs with seed data (for migrations and new fields)
    const seedJobs = getSeedJobs();
    const seedJobsMap = new Map(seedJobs.map(job => [job.id, job]));
    let updated = false;
    
    const updatedJobs = storedJobs.map(job => {
      const seedJob = seedJobsMap.get(job.id);
      if (seedJob) {
        // Merge seed job data with stored job (seed takes precedence for URLs/emails)
        const merged = {
          ...job,
          ...(seedJob.applicationUrl && { applicationUrl: seedJob.applicationUrl }),
          ...(seedJob.contactEmail && { contactEmail: seedJob.contactEmail }),
        };
        if (JSON.stringify(merged) !== JSON.stringify(job)) {
          updated = true;
          return merged;
        }
      }
      return job;
    });
    
    // Add any new seed jobs that don't exist in stored jobs
    const existingIds = new Set(storedJobs.map(j => j.id));
    const newJobs = seedJobs.filter(j => !existingIds.has(j.id));
    if (newJobs.length > 0) {
      updatedJobs.push(...newJobs);
      updated = true;
    }
    
    if (updated) {
      persistJobs(updatedJobs);
      return updatedJobs;
    }
    
    return storedJobs;
  } catch (error) {
    console.error("Error loading jobs from localStorage:", error);
    // On error, return seed data as fallback
    const seedJobs = getSeedJobs();
    try {
      persistJobs(seedJobs);
    } catch {
      // If we can't persist, continue anyway
    }
    return seedJobs;
  }
};

export function useJobPosts() {
  const [jobs, setJobs] = useState<JobPost[]>([]);

  useEffect(() => {
    // This hook is for JobPost type, not JobListing
    // Keeping it separate for now
  }, [jobs]);

  const createJob = (input: JobPostInput) => {
    const now = getNowIso();
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const newJob: JobPost = {
      ...input,
      id,
      createdAt: now,
      updatedAt: now,
    };
    setJobs((prev) => [newJob, ...prev]);
  };

  const updateJob = (id: string, input: JobPostInput) => {
    const now = getNowIso();
    setJobs((prev) =>
      prev.map((job) =>
        job.id === id ? { ...job, ...input, updatedAt: now } : job,
      ),
    );
  };

  const deleteJob = (id: string) => {
    setJobs((prev) => prev.filter((job) => job.id !== id));
  };

  const sortedJobs = useMemo(() => {
    return [...jobs].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [jobs]);

  return {
    jobs: sortedJobs,
    createJob,
    updateJob,
    deleteJob,
  };
}

// Hook for fetching job listings from localStorage
// NOTE: This is a temporary solution. Once the backend API is available,
// this should fall back to the API route for server-side data.
export function useJobs() {
  const [jobs, setJobs] = useState<ExtendedJobListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      const storedJobs = getStoredJobs();
      setJobs(storedJobs);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load jobs";
      console.error("Error in useJobs:", err);
      setError(new Error(errorMessage));
      // Set empty array on error to prevent UI crashes
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    data: jobs,
    isLoading,
    error,
  };
}

// Hook for fetching individual job details from localStorage
// NOTE: This is a temporary solution. Once the backend API is available,
// this should fall back to the API route for server-side data.
export function useJob(jobId: string | undefined) {
  const [job, setJob] = useState<JobDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!jobId) {
      setError(new Error("Job ID is required"));
      setIsLoading(false);
      return;
    }

    try {
      const storedJobs = getStoredJobs();
      const foundJob = storedJobs.find((j) => j.id === jobId);
      
      if (!foundJob) {
        setError(new Error("Job not found"));
        setJob(null);
      } else {
        // Convert ExtendedJobListing to JobDetail (they're compatible)
        // JobDetail includes optional fields that ExtendedJobListing has
        setJob(foundJob as JobDetail);
        setError(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load job";
      console.error("Error in useJob:", err);
      setError(new Error(errorMessage));
      setJob(null);
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  return {
    data: job,
    isLoading,
    error,
  };
}
