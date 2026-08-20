"use client";

import { useState, useMemo } from "react";
import Fuse from "fuse.js";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Briefcase,
  X,
  MousePointerClick,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
} from "@/components/ui/alert-dialog";

import { useJobs, useDeleteJob } from "@/hooks/admin";
import { JobForm } from "@/components/admin/jobs/job-form";

type FormMode = { type: "new" } | { type: "edit"; jobId: string } | null;

export function JobAdminPanel() {
  const { mutate: deleteJob, isPending: isDeleting } = useDeleteJob();
  const { data: jobs = [], isLoading: isLoadingJobs, isError } = useJobs();

  const [jobSearchQuery, setJobSearchQuery] = useState("");
  const [formMode, setFormMode] = useState<FormMode>(null);

  const jobFuse = useMemo(
    () =>
      new Fuse(jobs, { keys: ["title", "company", "jobType"], threshold: 0.4 }),
    [jobs],
  );

  const filteredJobs = useMemo(() => {
    if (!jobSearchQuery) return jobs;
    return jobFuse.search(jobSearchQuery).map((result) => result.item);
  }, [jobSearchQuery, jobs, jobFuse]);

  const closeForm = () => setFormMode(null);

  return (
    <section className="space-y-6">
      {!formMode && (
        <div className="flex justify-end">
          <Button onClick={() => setFormMode({ type: "new" })}>
            <Plus className="mr-2 h-4 w-4" /> New Job
          </Button>
        </div>
      )}

      {/* Inline Form — drops in above listings */}
      {formMode && (
        <Card className="border-primary/30 shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div>
              <CardTitle>
                {formMode.type === "edit" ? "Edit Job Post" : "New Job Post"}
              </CardTitle>
              <CardDescription className="mt-1">
                {formMode.type === "edit"
                  ? "Update the details for the selected job."
                  : "Provide role details. You can preview before publishing."}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={closeForm}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <JobForm
              jobId={formMode.type === "edit" ? formMode.jobId : undefined}
              onClose={closeForm}
            />
          </CardContent>
        </Card>
      )}

      {/* Listings Card */}
      <Card>
        <CardHeader>
          <CardTitle>All Listings</CardTitle>
          <CardDescription>
            Search and manage published job roles.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

          {isLoadingJobs && (
            <p className="text-sm text-muted-foreground">Loading jobs...</p>
          )}
          {isError && (
            <p className="text-sm text-destructive">Failed to load jobs.</p>
          )}

          {!isLoadingJobs && !isError && (
            <div className="rounded-md border">
              {filteredJobs.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  {jobSearchQuery
                    ? `No jobs found matching "${jobSearchQuery}".`
                    : "No jobs yet. Click New Job to add one."}
                </div>
              ) : (
                <div className="divide-y max-h-[600px] overflow-y-auto">
                  {filteredJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center hover:bg-secondary/10 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1 overflow-hidden">
                        <div className="h-10 w-10 shrink-0 rounded-md border bg-white flex items-center justify-center text-muted-foreground">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <div className="space-y-1 overflow-hidden">
                          <p className="font-medium truncate">{job.title}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {job.company} • {job.jobType}
                          </p>
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MousePointerClick className="h-3 w-3" />
                            {job.applyClickCount ?? 0} apply clicks
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFormMode({ type: "edit", jobId: job.id });
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </Button>

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
                                This will permanently delete{" "}
                                <strong>{job.title}</strong> at {job.company}.
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteJob(job.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
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
