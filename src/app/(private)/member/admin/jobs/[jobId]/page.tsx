import { JobForm } from "@/components/admin/jobs/job-form"; // adjust path

export default async function EditJobPage({ params }: { params: Promise<{ jobId: string }> }) {
    const { jobId } = await params;
  return <JobForm jobId={jobId} />;
}
