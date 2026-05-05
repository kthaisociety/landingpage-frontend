"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import { Plus, Search, Edit, Trash2, Briefcase } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useJobPosts, type JobPostInput } from "@/hooks/jobs";
import { useCompanies } from "@/hooks/companies";
import { API_URL } from "@/config";

const jobTypeOptions = ["Full time", "Part time"];

const emptyForm: JobPostInput = {
  title: "",
  description: "",
  type: jobTypeOptions[0],
  location: "",
  salary: "",
  companyId: "",
  publishAt: "",
  unpublishAt: "",
};

export function JobAdminPanel() {
  const { createJob } = useJobPosts();
  const { companies, isLoading } = useCompanies(); // Added isLoading here
  const [form, setForm] = useState<JobPostInput>(emptyForm);
  const [dateWarning, setDateWarning] = useState<string | null>(null);

  const handleChange =
    (field: keyof JobPostInput) =>
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      form.publishAt &&
      form.unpublishAt &&
      form.unpublishAt < form.publishAt
    ) {
      setDateWarning("Unpublish date must be after publish date.");
      return;
    }
    setDateWarning(null);
    createJob(form);
    setForm(emptyForm);
  };

  const filteredJobs = useMemo(() => {
    if (!jobSearchQuery) return jobs;
    return jobFuse.search(jobSearchQuery).map((result) => result.item);
  }, [jobSearchQuery, jobs, jobFuse]);

  return (
    <section className="space-y-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Job Posts</h2>
          <p className="text-sm text-muted-foreground">
            Manage roles for the KTH AIS community.
          </p>
        </div>
        <span className="text-xs text-muted-foreground">
          {isLoading
            ? "Loading companies..."
            : `${companies.length} companies available`}
        </span>
      </div>

      {/* --- JOB POST FORM --- */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>New job post</CardTitle>
            <CardDescription>
              Choose a company from the Companies tab before publishing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="job-title">Title</Label>
                  <Input
                    id="job-title"
                    value={form.title}
                    onChange={handleChange("title")}
                    placeholder="AI Engineer Intern"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job-type">Type</Label>
                  <Select
                    id="job-type"
                    value={form.type}
                    onChange={handleChange("type")}
                    required
                  >
                    {jobTypeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job-location">Location</Label>
                  <Input
                    id="job-location"
                    value={form.location}
                    onChange={handleChange("location")}
                    placeholder="Stockholm, Sweden"
                    required
                  />
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

                <div className="space-y-2">
                  <Label htmlFor="job-unpublish-at">Unpublish date</Label>
                  <Input
                    id="job-unpublish-at"
                    type="datetime-local"
                    value={form.unpublishAt || ""}
                    onChange={handleChange("unpublishAt")}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="job-company">Company</Label>
                  <Select
                    id="job-company"
                    value={form.companyId}
                    onChange={handleChange("companyId")}
                    required
                    disabled={!hasCompanies || isLoading}
                  >
                    <option value="" disabled>
                      {isLoading
                        ? "Loading companies..."
                        : hasCompanies
                          ? "Select a company"
                          : "Add a company first"}
                    </option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </Select>
                  {!hasCompanies && !isLoading ? (
                    <p className="text-xs text-muted-foreground">
                      Add at least one company in the Companies tab.
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="job-description">Job description</Label>
                  <Textarea
                    id="job-description"
                    value={form.description}
                    onChange={handleChange("description")}
                    placeholder="Describe the role, responsibilities, and the team."
                    required
                  />
                </div>
                {dateWarning ? (
                  <p className="text-xs text-destructive md:col-span-2">
                    {dateWarning}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={!canSubmitJob}>
                  Publish job
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* --- AVAILABLE COMPANIES GRID --- */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Available Companies</h3>
          <p className="text-sm text-muted-foreground">
            Companies fetched directly from the database.
          </p>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : companies.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No companies found. Create one in the Companies tab!
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {companies.map((company) => {
              const imageUrl = company.logo
                ? `${API_URL}/company/logo?id=${company.logo}`
                : "/placeholder.png";

              return (
                <Card key={company.id} className="bg-secondary/10">
                  <CardHeader className="p-4 flex flex-row items-center gap-4">
                    {company.logo && (
                      <img
                        src={imageUrl}
                        alt={`${company.name || "Company"} logo preview`}
                        className="h-40 w-40 rounded-md object-contain border bg-white"
                      />
                    )}
                    <div>
                      <CardTitle className="text-base">
                        {company.name}
                      </CardTitle>
                      <CardDescription className="text-xs break-all truncate">
                        ID: {company.id}
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}