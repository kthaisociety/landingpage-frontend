"use client";
import { useProjects } from "@/hooks/projects";

export function MemberProjectSelection() {
  const { data: projects = [], isLoading, isError } = useProjects();

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading projects...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-destructive">
        Failed to load projects. Please try refreshing the page.
      </div>
    );
  }

  if (!projects.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No projects available in the system.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Available Projects</h2>

        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {projects.map((project) => (
            <div
              key={project.project_id}
              className="flex flex-col p-4 border rounded-lg hover:bg-secondary/20 transition-colors"
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold text-base">{project.name}</h3>
                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 bg-primary/10 text-primary rounded-full">
                  {project.status}
                </span>
              </div>

              <p className="text-sm text-muted-foreground mt-1 mb-3">
                {project.description}
              </p>

              {project.skills && project.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-auto">
                  {project.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs text-muted-foreground font-mono bg-secondary/50 px-2 py-1 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

