"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_URL } from "@/config";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

type AssociationRow = {
  id: string;
  title: string;
  status: string;
  selected: boolean;
};

function useMyProjectAssociations() {
  return useQuery<AssociationRow[]>({
    queryKey: ["my-project-associations"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/projects/my-associations`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load project list");
      return res.json();
    },
  });
}

export function MemberProjectSelection() {
  const queryClient = useQueryClient();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  const {
    data: associationRows = [],
    isLoading,
    isError,
  } = useMyProjectAssociations();

  const myProjects = associationRows.filter((r) => r.selected);

  const initializeSelected = () => {
    setSelectedProjectIds(myProjects.map((r) => r.id));
  };

  const updateAssociations = useMutation({
    mutationFn: async (projectIds: string[]) => {
      const res = await fetch(`${API_URL}/projects/my-associations`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectIds }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Failed to save your projects");
      }
      return res.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["my-project-associations"] });
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      setIsEditorOpen(false);
    },
  });

  const toggleProject = (id: string) => {
    setSelectedProjectIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading your projects...</div>;
  }

  if (isError) {
    return <div className="text-center py-8 text-destructive">Failed to load projects. Please try refreshing the page.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-medium">Your Projects</h2>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setIsEditorOpen((prev) => {
                const next = !prev;
                if (next) initializeSelected();
                return next;
              })
            }
          >
            {isEditorOpen ? "Close" : "Add / edit projects"}
          </Button>
        </div>

        {isEditorOpen && (
          <div className="border rounded-lg p-4 space-y-3 bg-secondary/20">
            <p className="text-sm text-muted-foreground">
              Select all projects you are or have been part of.
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
                  <span className="text-sm font-medium flex-1">{project.title}</span>
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 bg-primary/10 text-primary rounded-full">
                    {project.status}
                  </span>
                </label>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={() => updateAssociations.mutate(selectedProjectIds)}
                disabled={updateAssociations.isPending}
              >
                {updateAssociations.isPending ? "Saving..." : "Save"}
              </Button>
              {updateAssociations.isError && (
                <p className="text-sm text-destructive">
                  {(updateAssociations.error as Error).message}
                </p>
              )}
            </div>
          </div>
        )}

        {myProjects.length === 0 && !isEditorOpen ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            You have not added any projects yet. Click &ldquo;Add / edit projects&rdquo; to get started.
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {myProjects.map((project) => (
              <Link
                href={`/projects/${project.id}`}
                key={project.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/20 transition-colors cursor-pointer"
              >
                <span className="font-semibold text-base">{project.title}</span>
                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 bg-primary/10 text-primary rounded-full">
                  {project.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
