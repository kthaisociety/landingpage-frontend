import { CompanyForm } from "@/features/company-management/components/company-form";

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
    const { companyId } = await params;
  return <CompanyForm companyId={companyId} />;
}
