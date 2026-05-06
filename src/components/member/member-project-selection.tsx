"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_URL } from "@/config";
import { useProjects } from "@/hooks/projects";
import { useAuth } from "@/lib/providers/auth-provider/authProvider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export function MemberProjectSelection() {
  const queryClient = useQueryClient();
  const { data: projects = [], isLoading, isError } = useProjects();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  const { isLoading: userIsLoading, user } = useAuth();
  let currentUserEmail = null;
  if (!userIsLoading && user?.email) currentUserEmail = user.email;

  const myProjects = useMemo(
    () =>
      projects.filter((project) =>
        project.contributors?.some(
          (contributor) =>
            contributor.email.toLowerCase() === currentUserEmail?.toLowerCase(),
        ),
      ),
    [projects, currentUserEmail],
  );

  const {
    data: associationRows = [],
    isLoading: isAssociationsLoading,
    isError: isAssociationsError,
  } = useQuery<{ id: string; title: string; status: string; selected: boolean }[]>(
    {
      queryKey: ["my-project-associations"],
      queryFn: async () => {
        const response = await fetch(`${API_URL}/projects/my-associations`, {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to load project list");
        }
        return response.json();
      },
    },
  );

  useEffect(() => {
    setSelectedProjectIds(
      associationRows.filter((row) => row.selected).map((row) => row.id),
    );
  }, [associationRows]);

  const updateAssociations = useMutation({
    mutationFn: async (projectIds: string[]) => {
      const response = await fetch(`${API_URL}/projects/my-associations`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectIds }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.error || "Failed to save your projects");
      }
      return response.json();
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["projects"] }),
        queryClient.invalidateQueries({ queryKey: ["my-project-associations"] }),
      ]);
      setIsEditorOpen(false);
    },
  });

  const toggleProject = (projectId: string) => {
    setSelectedProjectIds((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId],
    );
  };

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
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-medium">Your Projects</h2>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsEditorOpen((prev) => !prev)}
            disabled={isAssociationsLoading || isAssociationsError}
          >
            {isEditorOpen ? "Close" : "Add project"}
          </Button>
        </div>

        {isAssociationsError && (
          <p className="text-sm text-destructive">
            Could not load project options right now.
          </p>
        )}

        {isEditorOpen && !isAssociationsLoading && !isAssociationsError && (
          <div className="border rounded-lg p-4 space-y-3 bg-secondary/20">
            <p className="text-sm text-muted-foreground">
              Mark all projects you are currently part of.
            </p>
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {associationRows.map((project) => (
                <label
                  key={project.id}
                  className="flex items-center gap-3 rounded-md border p-2 bg-background cursor-pointer"
                >
                  <Checkbox
                    checked={selectedProjectIds.includes(project.id)}
                    onCheckedChange={() => toggleProject(project.id)}
                  />
                  <span className="text-sm font-medium">{project.title}</span>
                </label>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={() => updateAssociations.mutate(selectedProjectIds)}
                disabled={updateAssociations.isPending}
              >
                {updateAssociations.isPending ? "Saving..." : "Save projects"}
              </Button>
              {updateAssociations.isError && (
                <p className="text-sm text-destructive">
                  {(updateAssociations.error as Error).message}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {myProjects.map((project) => (
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
