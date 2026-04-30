"use client";

import Link from "next/link";
import { useProjects } from "@/hooks/projects";
import { useAuth } from "@/lib/providers/auth-provider/authProvider";

export function MemberProjectSelection() {
  const { data: projects = [], isLoading, isError } = useProjects();

  const { isLoading: userIsLoading, user } = useAuth();
  let currentUserEmail = "test@example.com";
  if (!userIsLoading && user?.email) currentUserEmail = user.email;

  const myProjects = projects.filter((project) =>
    project.contributors?.some(
      (contributor) =>
        contributor.email.toLowerCase() === currentUserEmail?.toLowerCase(),
    ),
  );

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading your projects...
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

  if (!myProjects.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        You are not currently listed as a contributor on any projects.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Your Projects</h2>

        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {myProjects.map((project) => (
            // Changed div to Link and added href
            <Link
              href={`/projects/${project.id}`}
              key={project.id}
              className="flex flex-col p-4 border rounded-lg hover:bg-secondary/20 transition-colors block cursor-pointer"
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold text-base">{project.title}</h3>
                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 bg-primary/10 text-primary rounded-full">
                  {project.status}
                </span>
              </div>

              <p className="text-sm text-muted-foreground mt-1 mb-3">
                {project.shortDescription || project.oneLineDescription}
              </p>

              {/* Displaying techStack instead of the old 'skills' array */}
              {project.techStack && project.techStack.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-auto">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="text-xs text-muted-foreground font-mono bg-secondary/50 px-2 py-1 rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
