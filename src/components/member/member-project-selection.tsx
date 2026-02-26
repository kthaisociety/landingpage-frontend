"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { projects } from "@/lib/data/projects";

const MEMBER_PROJECT_SELECTION_STORAGE_KEY = "member-selected-project-ids";

export function MemberProjectSelection() {
  const { toast } = useToast();
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // TODO(api): Replace localStorage preload with a backend request that fetches
    // the member's existing project associations, e.g. GET /api/v1/member/projects.
    const storedIds = localStorage.getItem(MEMBER_PROJECT_SELECTION_STORAGE_KEY);
    if (!storedIds) return;

    try {
      const parsed = JSON.parse(storedIds) as string[];
      const frame = requestAnimationFrame(() => {
        setSelectedProjects(new Set(parsed));
      });
      return () => cancelAnimationFrame(frame);
    } catch {
      localStorage.removeItem(MEMBER_PROJECT_SELECTION_STORAGE_KEY);
    }
  }, []);

  const handleProjectToggle = (projectId: string) => {
    const next = new Set(selectedProjects);
    if (next.has(projectId)) {
      next.delete(projectId);
    } else {
      next.add(projectId);
    }
    setSelectedProjects(next);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // TODO(api): Replace localStorage save with backend persistence,
      // e.g. PUT /api/v1/member/projects with selected project IDs.
      localStorage.setItem(
        MEMBER_PROJECT_SELECTION_STORAGE_KEY,
        JSON.stringify(Array.from(selectedProjects))
      );
      toast({
        title: "Projects updated",
        description: "Your project selections were saved locally for now.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to save project selections.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

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
        <p className="text-sm text-muted-foreground">
          Select the projects where you have contributed.
        </p>

        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <Checkbox
                id={`project-${project.id}`}
                checked={selectedProjects.has(project.id)}
                onCheckedChange={() => handleProjectToggle(project.id)}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <Label
                  htmlFor={`project-${project.id}`}
                  className="font-medium cursor-pointer block"
                >
                  {project.title}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {project.shortDescription}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Project Selections"}
        </Button>
      </div>
    </div>
  );
}

