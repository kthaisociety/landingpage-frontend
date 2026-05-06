"use client";

import {
  useState,
  useMemo,
  useEffect,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Fuse from "fuse.js";
import { X, Plus, Trash2, Search, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { API_URL } from "@/config";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type JobPostInput, type ContactDTO } from "@/hooks/admin";
import { useCompanies, useCreateJob, useUpdateJob } from "@/hooks/admin";
import { SharedJobView } from "@/components/jobs/shared-job-view";

const jobTypeOptions = [
  "Full-time",
  "Part-time",
  "Internship",
  "Summer Internship",
  "Master Thesis",
  "Bachelor Thesis",
  "Volunteering",
  "Other",
];

const locationTags = ["On-site", "Remote", "Hybrid"];

const emptyContact: ContactDTO = {
  name: "",
  lastName: "",
  email: "",
  phoneNumber: "",
};

const emptyForm: JobPostInput = {
  title: "",
  description: "",
  jobType: jobTypeOptions[0],
  location: { place: "", tag: locationTags[0] },
  salary: "",
  companyId: "",
  startdate: "",
  enddate: "",
  appurl: "",
  contacts: [{ ...emptyContact }],
};

function Req() {
  return <span className="text-destructive ml-0.5">*</span>;
}

export function JobForm({
  jobId,
  onClose,
}: {
  jobId?: string;
  onClose?: () => void;
}) {
  const { mutateAsync: createJob, isPending: isCreating } = useCreateJob();
  const { mutateAsync: updateJob, isPending: isUpdating } = useUpdateJob();
  const isSubmitting = isCreating || isUpdating;

  const { data: companies = [], isLoading: isLoadingCompanies } =
    useCompanies();

  const [form, setForm] = useState<JobPostInput>(emptyForm);
  const [dateWarning, setDateWarning] = useState<string | null>(null);
  const [isFetchingJob, setIsFetchingJob] = useState(false);
  const [companySearch, setCompanySearch] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!jobId) return;

    const fetchJob = async () => {
      setIsFetchingJob(true);
      try {
        const res = await fetch(`${API_URL}/joblistings/job?id=${jobId}`);
        if (!res.ok) throw new Error("Failed to fetch job details");
        const fullJob = await res.json();

        let parsedLocation = { place: "", tag: locationTags[0] };
        try {
          parsedLocation =
            typeof fullJob.location === "string"
              ? JSON.parse(fullJob.location)
              : fullJob.location;
        } catch {
          parsedLocation = {
            place: fullJob.location || "",
            tag: locationTags[0],
          };
        }

        let parsedContacts = [{ ...emptyContact }];
        try {
          const c =
            typeof fullJob.contact === "string"
              ? JSON.parse(fullJob.contact)
              : fullJob.contact;
          if (Array.isArray(c) && c.length > 0) parsedContacts = c;
        } catch {
          // ignore
        }

        const formatDate = (isoString?: string) => {
          if (!isoString) return "";
          const date = new Date(isoString);
          return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
        };

        setForm({
          title: fullJob.title || "",
          description: fullJob.description || "",
          jobType: fullJob.jobType || jobTypeOptions[0],
          location: parsedLocation,
          salary: fullJob.salary || "",
          companyId: fullJob.company || "",
          startdate: formatDate(fullJob.startdate),
          enddate: formatDate(fullJob.enddate),
          appurl: fullJob.appurl || "",
          contacts: parsedContacts,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setIsFetchingJob(false);
      }
    };

    fetchJob();
  }, [jobId]);

  const handleTextChange =
    (field: keyof JobPostInput) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSelectChange = (field: keyof JobPostInput, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (field: "place" | "tag", value: string) => {
    setForm((prev) => ({
      ...prev,
      location: { ...prev.location, [field]: value },
    }));
  };

  const addContact = () => {
    setForm((prev) => ({
      ...prev,
      contacts: [...prev.contacts, { ...emptyContact }],
    }));
  };

  const removeContact = (index: number) => {
    setForm((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index),
    }));
  };

  const handleContactChange = (
    index: number,
    field: keyof ContactDTO,
    value: string,
  ) => {
    setForm((prev) => {
      const updatedContacts = [...prev.contacts];
      updatedContacts[index] = { ...updatedContacts[index], [field]: value };
      return { ...prev, contacts: updatedContacts };
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.startdate && form.enddate && form.enddate < form.startdate) {
      setDateWarning("End date must be after start date.");
      return;
    }
    setDateWarning(null);

    try {
      if (jobId) {
        await updateJob({ id: jobId, data: form });
      } else {
        await createJob(form);
      }
      onClose?.();
    } catch (error) {
      console.error("Submission failed", error);
    }
  };

  const fuse = useMemo(
    () => new Fuse(companies, { keys: ["name"], threshold: 0.4 }),
    [companies],
  );

  const filteredCompanies = useMemo(() => {
    if (!companySearch) return companies;
    return fuse.search(companySearch).map((result) => result.item);
  }, [companySearch, companies, fuse]);

  const hasCompanies = companies.length > 0;
  const canSubmitJob = hasCompanies && Boolean(form.companyId);

  return (
    <div className="space-y-6">
      {/* PREVIEW MODAL */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <div className="sticky top-0 z-50 flex justify-between items-center p-4 bg-white border-b shadow-sm">
            <h2 className="text-xl font-bold">Preview Mode</h2>
            <Button
              variant="destructive"
              onClick={() => setShowPreview(false)}
            >
              <X className="mr-2 h-4 w-4" /> Close Preview
            </Button>
          </div>
          <SharedJobView job={form} />
        </div>
      )}

      {isFetchingJob ? (
        <div className="py-12 text-center text-sm text-muted-foreground animate-pulse">
          Loading job data...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ── COMPANY FIRST ── */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Company <Req />
            </Label>
            {isLoadingCompanies ? (
              <p className="text-sm text-muted-foreground">
                Loading companies...
              </p>
            ) : !hasCompanies ? (
              <p className="text-sm text-muted-foreground">
                No companies found. Add at least one company in the Companies
                tab before creating a job.
              </p>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Filter companies..."
                    className="pl-9"
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                  />
                </div>
                <div className="rounded-md border divide-y max-h-48 overflow-y-auto">
                  {filteredCompanies.length === 0 ? (
                    <p className="p-3 text-sm text-muted-foreground">
                      No companies match &quot;{companySearch}&quot;.
                    </p>
                  ) : (
                    filteredCompanies.map((company) => (
                      <button
                        key={company.id}
                        type="button"
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors hover:bg-secondary/10 ${
                          form.companyId === company.id
                            ? "bg-secondary/20 font-medium"
                            : ""
                        }`}
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            companyId: company.id,
                          }))
                        }
                      >
                        <span>{company.name}</span>
                        {form.companyId === company.id && (
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── REST OF FORM ── */}
          <div className="border-t pt-6 grid gap-4 md:grid-cols-2">
            {/* Title */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="job-title">
                Job Title <Req />
              </Label>
              <Input
                id="job-title"
                value={form.title}
                onChange={handleTextChange("title")}
                placeholder="AI Engineer Intern"
                required
              />
            </div>

            {/* Job Type */}
            <div className="space-y-2">
              <Label>
                Job Type <Req />
              </Label>
              <Select
                value={form.jobType}
                onValueChange={(val) => handleSelectChange("jobType", val)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  {jobTypeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Salary */}
            <div className="space-y-2">
              <Label htmlFor="job-salary">Salary</Label>
              <Input
                id="job-salary"
                value={form.salary}
                onChange={handleTextChange("salary")}
                placeholder="e.g. 30,000 - 32,000 kr/month"
              />
            </div>

            {/* Location Place */}
            <div className="space-y-2">
              <Label htmlFor="job-location-place">
                Location <Req />
              </Label>
              <Input
                id="job-location-place"
                value={form.location.place}
                onChange={(e) => handleLocationChange("place", e.target.value)}
                placeholder="Stockholm, Sweden"
                required
              />
            </div>

            {/* Location Tag */}
            <div className="space-y-2">
              <Label>
                Work Model <Req />
              </Label>
              <Select
                value={form.location.tag}
                onValueChange={(val) => handleLocationChange("tag", val)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select work model" />
                </SelectTrigger>
                <SelectContent>
                  {locationTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dates */}
            <div className="space-y-2">
              <Label htmlFor="job-start-at">
                Listing start date <Req />
              </Label>
              <Input
                id="job-start-at"
                type="datetime-local"
                value={form.startdate}
                onChange={handleTextChange("startdate")}
                required
              />
              <p className="text-xs text-muted-foreground">When the posting goes live on the site.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="job-end-at">
                Listing end date <Req />
              </Label>
              <Input
                id="job-end-at"
                type="datetime-local"
                value={form.enddate}
                onChange={handleTextChange("enddate")}
                required
              />
              <p className="text-xs text-muted-foreground">When the posting is removed from the site.</p>
            </div>

            {/* Application URL */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="job-appurl">How to apply</Label>
              <Input
                id="job-appurl"
                type="text"
                value={form.appurl}
                onChange={handleTextChange("appurl")}
                placeholder="https://company.com/apply or jobs@company.com"
              />
            </div>

            {/* ── CONTACTS ── */}
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  Contact Information
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addContact}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Contact
                </Button>
              </div>

              {form.contacts.map((contact, index) => (
                <div
                  key={`${contact.email}-${contact.name}-${contact.lastName}-${contact.phoneNumber}`}
                  className="space-y-4 pt-4 border-t border-border first:border-0 first:pt-0"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground font-medium">
                      Person {index + 1}
                    </span>
                    {form.contacts.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeContact(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input
                        value={contact.name}
                        onChange={(e) =>
                          handleContactChange(index, "name", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input
                        value={contact.lastName}
                        onChange={(e) =>
                          handleContactChange(
                            index,
                            "lastName",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={contact.email}
                        onChange={(e) =>
                          handleContactChange(index, "email", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>
                        Phone Number{" "}
                        <span className="text-muted-foreground text-xs font-normal">
                          (optional)
                        </span>
                      </Label>
                      <Input
                        type="tel"
                        value={contact.phoneNumber}
                        onChange={(e) =>
                          handleContactChange(
                            index,
                            "phoneNumber",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="space-y-2 md:col-span-2">
              <div className="flex justify-between items-end">
                <Label htmlFor="job-description">
                  Description <Req />
                </Label>
                <span className="text-xs text-muted-foreground bg-secondary/20 px-2 py-1 rounded">
                  Supports Markdown (visible in preview)
                </span>
              </div>
              <Textarea
                id="job-description"
                className="min-h-[200px]"
                value={form.description}
                onChange={handleTextChange("description")}
                placeholder="## About the Role&#10;Describe responsibilities and requirements..."
                required
              />
            </div>

            {dateWarning && (
              <p className="text-xs text-destructive md:col-span-2">
                {dateWarning}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t">
            {onClose && (
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreview(true)}
            >
              Preview
            </Button>
            <Button type="submit" disabled={!canSubmitJob || isSubmitting}>
              {isSubmitting
                ? jobId
                  ? "Saving..."
                  : "Publishing..."
                : jobId
                  ? "Save Changes"
                  : "Publish Job"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
