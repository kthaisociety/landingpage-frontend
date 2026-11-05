import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import { ProjectAdminPanel } from "@/components/admin/projects/project-admin-panel";

export default function AdminProjectsPage() {
  return (
    <>
      <AdminSectionHeader
        title="Project entries"
        description="Manage your showcase projects here."
      />
      <ProjectAdminPanel />
    </>
  );
}
