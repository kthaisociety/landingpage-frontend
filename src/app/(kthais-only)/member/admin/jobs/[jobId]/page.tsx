import { JobForm } from "@/features/job-management/components/job-form"; // adjust path

export default async function EditJobPage({ params }: { params: Promise<{ jobId: string }> }) {
    const { jobId } = await params;
  return <JobForm jobId={jobId} />;
}
