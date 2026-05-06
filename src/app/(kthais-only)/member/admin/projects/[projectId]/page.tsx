import { ProjectForm } from "@/features/project-management/components/project-form";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return <ProjectForm projectId={projectId} />;
}
