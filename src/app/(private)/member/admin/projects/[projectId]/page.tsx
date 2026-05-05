import { ProjectForm } from "@/components/admin/projects/project-form";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return <ProjectForm projectId={projectId} />;
}
