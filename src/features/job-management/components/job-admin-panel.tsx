"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import { Plus, Search, Edit, Trash2, Briefcase } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";

import { useJobs, useDeleteJob } from "@/features/admin";

export function JobAdminPanel() {
  const { mutate: deleteJob, isPending: isDeleting } = useDeleteJob();
  const { data: jobs = [], isLoading: isLoadingJobs, isError } = useJobs();

  const [jobSearchQuery, setJobSearchQuery] = useState("");

  // --- Fuzzy Search Setup ---
  const jobFuse = useMemo(
    () =>
      new Fuse(jobs, { keys: ["title", "company", "jobType"], threshold: 0.4 }),
    [jobs],
  );

  const filteredJobs = useMemo(() => {
    if (!jobSearchQuery) return jobs;
    return jobFuse.search(jobSearchQuery).map((result) => result.item);
  }, [jobSearchQuery, jobs, jobFuse]);

  return (
    <section className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Job Posts</h2>
          <p className="text-sm text-muted-foreground">
            Manage roles for the KTH AIS community.
          </p>
        </div>
        <Link href="/member/admin/jobs/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Job
          </Button>
        </Link>
      </div>

      {/* Main Listing Card */}
      <Card>
        <CardHeader>
          <CardTitle>All Listings</CardTitle>
          <CardDescription>
            Search and manage published job roles.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search jobs by title, company, or type..."
              className="pl-9"
              value={jobSearchQuery}
              onChange={(e) => setJobSearchQuery(e.target.value)}
            />
          </div>

          {/* Status States */}
          {isLoadingJobs && (
            <p className="text-sm text-muted-foreground">Loading jobs...</p>
          )}
          {isError && (
            <p className="text-sm text-destructive">Failed to load jobs.</p>
          )}

          {/* Job List */}
          {!isLoadingJobs && !isError && (
            <div className="rounded-md border">
              {filteredJobs.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No jobs found matching `{jobSearchQuery}`.
                </div>
              ) : (
                <div className="divide-y max-h-[600px] overflow-y-auto">
                  {filteredJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center hover:bg-secondary/10 transition-colors"
                    >
                      {/* Left Side: Job Info */}
                      <div className="flex items-center gap-4 flex-1 overflow-hidden">
                        <div className="h-10 w-10 shrink-0 rounded-md border bg-white flex items-center justify-center text-muted-foreground">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <div className="space-y-1 overflow-hidden">
                          <p className="font-medium truncate">{job.title}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {job.company} • {job.jobType}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link href={`/member/admin/jobs/${job.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </Button>
                        </Link>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={isDeleting}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the job post{" "}
                                <strong>{job.title}</strong> at {job.company}.
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel variant={undefined} size={undefined}>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteJob(job.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90" size={undefined} variant={undefined}                              >
                                Yes, delete job
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}