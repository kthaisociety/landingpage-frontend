import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import { CompanyAdminPanel } from "@/components/admin/companies/company-admin-panel";

export default function AdminCompaniesPage() {
  return (
    <>
      <AdminSectionHeader
        title="Companies"
        description="Manage company profiles used for job postings."
      />
      <CompanyAdminPanel />
    </>
  );
}
