"use client";

import {
  useState,
  useMemo,
  useEffect,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Fuse from "fuse.js";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { API_URL } from "@/shared/lib/config";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { type JobPostInput, type ContactDTO } from "@/features/admin";
import { useCompanies, useCreateJob, useUpdateJob } from "@/features/admin";
import { SharedJobView } from "@/entities/jobs/shared-job-view";

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

export function JobForm({ jobId }: { jobId?: string }) {

  const { mutateAsync: createJob, isPending: isCreating } = useCreateJob();
  const { mutateAsync: updateJob, isPending: isUpdating } = useUpdateJob();
  const isSubmitting = isCreating || isUpdating;

  const { data: companies = [], isLoading: isLoadingCompanies } =
    useCompanies();

  const [form, setForm] = useState<JobPostInput>(emptyForm);
  const [dateWarning, setDateWarning] = useState<string | null>(null);
  const [isFetchingJob, setIsFetchingJob] = useState(false);

  // Search state
  const [companySearch, setCompanySearch] = useState("");
  const [showCompanyList, setShowCompanyList] = useState(false);
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
          // Safely ignore parsing errors
        }

        // Format ISO string to datetime-local format (YYYY-MM-DDTHH:mm)
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
          companyId: fullJob.company || "", // backend maps UUID to 'company'
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

  // Sync company search input when form.companyId or companies data loads
  useEffect(() => {
    if (form.companyId && companies.length > 0 && !companySearch) {
      const comp = companies.find((c) => c.id === form.companyId);
      if (comp) setCompanySearch(comp.name);
    }
  }, [form.companyId, companies, companySearch]);

  // --- Handlers ---
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
    } catch (error) {
      console.error("Submission failed", error);
    }
  };

  // --- Fuse.js Setup ---
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
    <div className="flex justify-center mt-24 px-24">
      <div className="w-full max-w-7xl space-y-6">
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

        <div className="grid gap-6">
          <Card className={jobId ? "border-primary shadow-sm" : ""}>
            <CardHeader>
              <CardTitle>{jobId ? "Edit Job Post" : "New Job Post"}</CardTitle>
              <CardDescription>
                {jobId
                  ? "Update the details for the selected job."
                  : "Provide role details. You can preview changes before publishing."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isFetchingJob ? (
                <div className="py-12 text-center text-sm text-muted-foreground animate-pulse">
                  Loading job data...
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Title */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="job-title">Job Title</Label>
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
                      <Label>Job Type</Label>
                      <Select
                        value={form.jobType}
                        onValueChange={(val) =>
                          handleSelectChange("jobType", val)
                        }
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
                      <Label htmlFor="job-salary">
                        Salary (Range or Exact)
                      </Label>
                      <Input
                        id="job-salary"
                        value={form.salary}
                        onChange={handleTextChange("salary")}
                        placeholder="e.g. 30,000 - 32,000 kr/month"
                        required
                      />
                    </div>

                    {/* Location Place */}
                    <div className="space-y-2">
                      <Label htmlFor="job-location-place">Location Place</Label>
                      <Input
                        id="job-location-place"
                        value={form.location.place}
                        onChange={(e) =>
                          handleLocationChange("place", e.target.value)
                        }
                        placeholder="Stockholm, Sweden"
                        required
                      />
                    </div>

                    {/* Location Tag */}
                    <div className="space-y-2">
                      <Label>Location Tag</Label>
                      <Select
                        value={form.location.tag}
                        onValueChange={(val) =>
                          handleLocationChange("tag", val)
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select location model" />
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
                      <Label htmlFor="job-start-at">Start Date</Label>
                      <Input
                        id="job-start-at"
                        type="datetime-local"
                        value={form.startdate}
                        onChange={handleTextChange("startdate")}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="job-end-at">End Date</Label>
                      <Input
                        id="job-end-at"
                        type="datetime-local"
                        value={form.enddate}
                        onChange={handleTextChange("enddate")}
                        required
                      />
                    </div>

                    {/* Application URL */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="job-appurl">Application URL</Label>
                      <Input
                        id="job-appurl"
                        type="url"
                        value={form.appurl}
                        onChange={handleTextChange("appurl")}
                        placeholder="https://company.com/apply"
                        required
                      />
                    </div>

                    {/* Company Fuzzy Search */}
                    <div className="space-y-2 md:col-span-2 relative">
                      <Label htmlFor="job-company">Company</Label>
                      <Input
                        id="job-company"
                        placeholder="Search company (fuzzy search)..."
                        value={companySearch}
                        onChange={(e) => {
                          setCompanySearch(e.target.value);
                          setShowCompanyList(true);
                        }}
                        onFocus={() => setShowCompanyList(true)}
                        onBlur={() =>
                          setTimeout(() => setShowCompanyList(false), 200)
                        }
                        disabled={!hasCompanies || isLoadingCompanies}
                      />
                      {form.companyId && (
                        <p className="text-xs text-green-600 mt-1">
                          Selected:{" "}
                          {companies.find((c) => c.id === form.companyId)?.name}
                        </p>
                      )}
                      {showCompanyList && filteredCompanies.length > 0 && (
                        <div className="absolute z-10 w-full bg-white border border-gray-200 shadow-md rounded-md mt-1 max-h-48 overflow-y-auto">
                          {filteredCompanies.map((company) => (
                            <div
                              key={company.id}
                              className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                              onMouseDown={() => {
                                setForm((prev) => ({
                                  ...prev,
                                  companyId: company.id,
                                }));
                                setCompanySearch(company.name);
                                setShowCompanyList(false);
                              }}
                            >
                              {company.name}
                            </div>
                          ))}
                        </div>
                      )}
                      {!hasCompanies && !isLoadingCompanies ? (
                        <p className="text-xs text-muted-foreground">
                          Add at least one company in the Companies tab.
                        </p>
                      ) : null}
                    </div>

                    {/* --- Dynamic Contacts Array --- */}
                    <div className="space-y-4 md:col-span-2 bg-secondary/5 p-4 rounded-lg border border-border">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold">
                          Contact Information
                        </h3>
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
                          // Use the stable index
                          key={index}
                          className="space-y-4 pt-4 border-t border-border first:border-0 first:pt-0"
                        >
                          <div className="flex justify-between items-center">
                            <Label className="text-muted-foreground">
                              Person {index + 1}
                            </Label>
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
                                  handleContactChange(
                                    index,
                                    "name",
                                    e.target.value,
                                  )
                                }
                                required
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
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Email</Label>
                              <Input
                                type="email"
                                value={contact.email}
                                onChange={(e) =>
                                  handleContactChange(
                                    index,
                                    "email",
                                    e.target.value,
                                  )
                                }
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Phone Number (Optional)</Label>
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
                        <Label htmlFor="job-description">Job description</Label>
                        <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded">
                          Markdown Supported
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
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPreview(true)}
                    >
                      Preview
                    </Button>
                    <Button
                      type="submit"
                      disabled={!canSubmitJob || isSubmitting}
                    >
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}