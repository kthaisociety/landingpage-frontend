import { CompanyForm } from "@/components/admin/companies/company-form";

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
    const { companyId } = await params;
  return <CompanyForm companyId={companyId} />;
}
