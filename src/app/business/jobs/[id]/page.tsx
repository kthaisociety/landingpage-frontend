"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AsciiGrid } from "@/components/ui/ascii-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { useJob } from "@/hooks/jobs";
import { SharedJobView } from "@/components/jobs/shared-job-view";

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params?.id as string;
  const { data: job, isLoading: loading, error: queryError } = useJob(jobId);
  const [jobsTextMask, setJobsTextMask] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    // Create a canvas-based text mask
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "bold 200px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    const text = "JOB";
    ctx.fillText(text, 50, 50);

    const dataUrl = canvas.toDataURL("image/png");
    requestAnimationFrame(() => {
      setJobsTextMask(dataUrl);
    });
  }, []);

  const error =
    queryError instanceof Error
      ? queryError.message
      : queryError
        ? String(queryError)
        : null;

  if (loading) {
    return (
      <div className="min-h-screen">
        <section className="relative bg-white text-secondary-black pt-64 pb-24 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <AsciiGrid
              color="rgba(0, 0, 0, 0.2)"
              cellSize={12}
              logoSrc={jobsTextMask}
              logoPosition="center"
              logoScale={0.6}
              enableDripping={false}
              className="w-full h-full"
            />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none" />
          </div>
          <div className="container max-w-7xl relative z-10 mx-auto px-4 md:px-6">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        </section>
        <div className="px-4 sm:px-6 md:px-8 lg:px-8 xl:px-8">
          <section className="relative max-w-7xl mx-auto z-20 -mt-24 bg-neutral-50 rounded-3xl p-4 md:p-8 mb-24 shadow-lg border">
            <Skeleton className="h-64 w-full" />
          </section>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen">
        <section className="relative bg-white text-secondary-black pt-64 pb-24 overflow-hidden">
          <div className="container max-w-7xl relative z-10 mx-auto px-4 md:px-6">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter">
              Job Not Found
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-2xl opacity-95 leading-relaxed font-serif">
              {error || "The job you're looking for doesn't exist."}
            </p>
            <Button asChild>
              <Link href="/business/jobs">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Jobs
              </Link>
            </Button>
          </div>
        </section>
      </div>
    );
  }

  // Define breadcrumbs to pass down
  const breadcrumbs = (
    <div className="text-sm font-medium">
      <Link
        href="/"
        className="text-secondary-gray hover:text-primary transition-colors"
      >
        Home
      </Link>
      <span className="text-gray-300 mx-2">/</span>
      <Link
        href="/business/jobs"
        className="text-secondary-gray hover:text-primary transition-colors"
      >
        Jobs
      </Link>
      <span className="text-gray-300 mx-2">/</span>
      <span className="text-primary">{job.title}</span>
    </div>
  );

  return (
    <SharedJobView
      job={job}
      asciiMask={jobsTextMask}
      breadcrumbs={breadcrumbs}
    />
  );
}