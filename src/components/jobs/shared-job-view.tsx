"use client";

import { MapPin, Briefcase, DollarSign, ExternalLink } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/ui/markdown";
import { AsciiGrid } from "@/components/ui/ascii-grid";
import { useCompany } from "@/hooks/admin";
import { API_URL } from "@/config";
import type { JobPostInput, FullJobListing, ContactDTO } from "@/hooks/admin";

export function SharedJobView({
  job,
  asciiMask,
  breadcrumbs,
}: {
  job: JobPostInput | FullJobListing;
  asciiMask?: string;
  breadcrumbs?: React.ReactNode;
}) {
  const companyId = (job as Partial<JobPostInput>).companyId || (job as Partial<FullJobListing>).company;
  const appUrl = (job as Partial<JobPostInput>).appurl || (job as Partial<FullJobListing>).appurl;

  let location = { place: "", tag: "" };
  try {
    location =
      typeof job.location === "string"
        ? JSON.parse(job.location)
        : job.location || { place: "", tag: "" };
  } catch {
    location = {
      place: typeof job.location === "string" ? job.location : "",
      tag: "",
    };
  }

  let contacts: ContactDTO[] = [];
  try {
    const rawContacts = (job as Partial<JobPostInput>).contacts || (job as Partial<FullJobListing>).contact;
    contacts =
      typeof rawContacts === "string"
        ? JSON.parse(rawContacts)
        : rawContacts || [];
  } catch {
    contacts = [];
  }

  const { data: company, isLoading: isLoadingCompany } = useCompany(companyId || "");

  return (
    <div className="min-h-screen pb-24">
      {/* Header Section */}
      <section className="relative bg-white text-secondary-black pt-32 md:pt-64 pb-24 overflow-hidden border-b">
        {/* Optional AsciiGrid Background (Used on live page) */}
        {asciiMask !== undefined && (
          <div className="absolute inset-0 pointer-events-none">
            <AsciiGrid
              color="rgba(0, 0, 0, 0.2)"
              cellSize={12}
              logoSrc={asciiMask}
              logoPosition="center"
              logoScale={0.6}
              enableDripping={false}
              className="w-full h-full"
            />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none" />
          </div>
        )}

        <div className="container max-w-7xl relative z-10 mx-auto px-4 md:px-6">
          <h1 className="text-5xl md:text-7xl font-base mb-2 tracking-tighter">
            {job.title || "Untitled Job"}
          </h1>

          {/* Company Name Subheader */}
          <div className="text-xl md:text-2xl text-muted-foreground mb-8 font-medium min-h-[32px]">
            {isLoadingCompany ? (
              <span className="animate-pulse bg-gray-200 text-transparent rounded">
                Loading company...
              </span>
            ) : company ? (
              `at ${company.name}`
            ) : (
              "No company selected"
            )}
          </div>

          <div className="flex flex-wrap gap-6 text-base text-gray-700">
            {location.place && (
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>
                  {location.place} {location.tag ? `(${location.tag})` : ""}
                </span>
              </div>
            )}
            {job.jobType && (
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                <span className="capitalize">{job.jobType}</span>
              </div>
            )}
            {job.salary && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                <span>{job.salary}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content Area */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-8 xl:px-8">
        <section
          className={`relative max-w-7xl mx-auto z-20 bg-neutral-50 rounded-3xl p-4 md:p-8 shadow-lg border ${asciiMask !== undefined ? "-mt-24" : "-mt-12"}`}
        >
          <div className="container mx-auto">
            {/* Optional Breadcrumbs */}
            {breadcrumbs && <div className="mb-8">{breadcrumbs}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-4 tracking-tight text-secondary-black">
                    About the Role
                  </h2>
                  {job.description ? (
                    <Markdown content={job.description} />
                  ) : (
                    <p className="text-gray-400 italic">
                      No description provided yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Apply Button */}
                <div>
                  <h3 className="text-xl font-bold mb-4 tracking-tight text-secondary-black">
                    Apply Now
                  </h3>
                  {appUrl ? (
                    <Button className="w-full mb-4" size="lg" asChild>
                      <a
                        href={appUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" /> Apply Here
                      </a>
                    </Button>
                  ) : (
                    <Button disabled className="w-full mb-4" size="lg">
                      Provide a URL to apply
                    </Button>
                  )}
                </div>

                {/* Company Info Box */}
                {company && (
                  <div className="bg-white p-4 rounded-xl border space-y-3">
                    <div className="flex items-center gap-3">
                      {company.logo ? (
                        <Image
                          src={`${API_URL}/company/logo?id=${company.logo}`}
                          alt={`${company.name} logo`}
                          width={40}
                          height={40}
                          className="object-contain rounded border bg-white"
                        unoptimized
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gray-100 rounded border flex items-center justify-center">
                          <Briefcase className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <h4 className="font-semibold">{company.name}</h4>
                    </div>

                    {company.description && (
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {company.description}
                      </p>
                    )}

                    {company.websiteUrl && (
                      <a
                        href={company.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Visit Website <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                )}

                {/* Application Dates */}
                <div className="bg-white p-4 rounded-xl border">
                  <h4 className="font-semibold mb-3">Application Dates</h4>
                  <p className="text-sm">
                    <strong>Published:</strong>{" "}
                    {job.startdate
                      ? new Date(job.startdate).toLocaleDateString()
                      : "TBD"}
                  </p>
                  <p className="text-sm">
                    <strong>Expires:</strong>{" "}
                    {job.enddate
                      ? new Date(job.enddate).toLocaleDateString()
                      : "TBD"}
                  </p>
                </div>

                {/* Contacts */}
                <div className="bg-white p-4 rounded-xl border space-y-4">
                  <h4 className="font-semibold">Contacts</h4>
                  {contacts.some((c) => c.name || c.lastName) ? (
                    contacts.map((contact) => (
                      <div
                        key={`${contact.email || `${contact.name}-${contact.lastName}`}`}
                        className="text-sm border-t pt-2 first:border-0 first:pt-0"
                      >
                        <p className="font-medium">
                          {contact.name} {contact.lastName}
                        </p>
                        {contact.email && (
                          <p className="text-gray-600">{contact.email}</p>
                        )}
                        {contact.phoneNumber && (
                          <p className="text-gray-600">{contact.phoneNumber}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 italic">
                      No contact provided
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
