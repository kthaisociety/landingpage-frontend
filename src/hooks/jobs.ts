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
  publishAt?: string;
  unpublishAt?: string;
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
      id: "multiply-ai-first-software-engineer",
      title: "AI First Software Engineer",
      company: "Multiply",
      companyLogo: "/cover-multiply.png",
      jobType: "Full-time job",
      location: "Artillerigatan, Östermalm Stockholm",
      contactEmail: "oskar@multiply.co",
      applicationUrl: "mailto:oskar@multiply.co",
      description: `Multiply is building an AI powered creative operating system for agencies. We are five developers and a growing fleet of AI agents, building infrastructure where humans and models collaborate seamlessly.

We are now looking for an **AI First Software Engineer** to join us early.

**What you will be doing**

• Building AI first product features powered by LLM agents 
• Designing orchestration systems and agent workflows 
• Shipping fast with minimal overhead
• Exploring new AI tooling and integrating it directly into production
• Thinking in systems, not just writing code


**What we are looking for**
• You think AI first and build with agents, not just for them
• You are curious, fast and hungry
• You like small teams with strong technical leverage
• Experience with Clojure or Lisp is a bonus, not required

**Key details**

- **Location:** Artillerigatan, Östermalm Stockholm
- **Setup:** Onsite or hybrid
- **Start:** By agreement

To apply, send two sentences about what you have built with AI agents in the last six months and why you are a great fit for our team.`,
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
