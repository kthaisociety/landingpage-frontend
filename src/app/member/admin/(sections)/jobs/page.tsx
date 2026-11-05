import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import { JobAdminPanel } from "@/components/admin/jobs/job-admin-panel";

export default function AdminJobsPage() {
  return (
    <>
      <AdminSectionHeader
        title="Job Posts"
        description="Manage roles for the KTH AIS community."
      />
      <JobAdminPanel />
    </>
  );
}
