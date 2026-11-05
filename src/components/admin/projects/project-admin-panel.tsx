"use client";

import { useState } from "react";
import { Plus, Search, Edit, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDeleteProject } from "@/hooks/admin";
import { useProjects } from "@/hooks/projects";
import { AdminFormSheet } from "@/components/admin/admin-form-sheet";
import { ProjectForm } from "@/components/admin/projects/project-form";

type FormMode = { type: "new" } | { type: "edit"; projectId: string } | null;

export function ProjectAdminPanel() {
  const { data: projects, isLoading, isError } = useProjects();
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject();

  const [searchQuery, setSearchQuery] = useState("");
  const [formMode, setFormMode] = useState<FormMode>(null);

  const filteredProjects = projects?.filter((project) => {
    const query = searchQuery.toLowerCase();
    return (
      project.title.toLowerCase().includes(query) ||
      project.oneLineDescription.toLowerCase().includes(query) ||
      project.status.toLowerCase().includes(query)
    );
  });

  const closeForm = () => setFormMode(null);

  return (
    <section className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setFormMode({ type: "new" })}>
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      <AdminFormSheet
        open={formMode !== null}
        title={formMode?.type === "edit" ? "Edit Project" : "New Project"}
        description={
          formMode?.type === "edit"
            ? "Modify existing project details."
            : "Capture project details for the public showcase."
        }
        onClose={closeForm}
      >
        {formMode && (
          <ProjectForm
            projectId={formMode.type === "edit" ? formMode.projectId : undefined}
            onClose={closeForm}
          />
        )}
      </AdminFormSheet>

      {/* Listings */}
      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
          <CardDescription>
            Search and filter existing projects to edit or remove them.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by title, description, or status..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isLoading && (
            <p className="text-sm text-muted-foreground">Loading projects...</p>
          )}
          {isError && (
            <p className="text-sm text-destructive">Failed to load projects.</p>
          )}

          {!isLoading && !isError && filteredProjects && (
            <div className="rounded-md border">
              {filteredProjects.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  {searchQuery
                    ? `No projects found matching "${searchQuery}".`
                    : "No projects yet. Click New Project to add one."}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center hover:bg-secondary/10 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{project.title}</h4>
                          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary/30 text-secondary-foreground">
                            {project.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {project.oneLineDescription}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Members: {project.contributors?.length || 0}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {project.repoUrl && (
                          <a href={project.repoUrl} target="_blank" rel="noreferrer">
                            <Button variant="ghost" size="icon" title="View Repo">
                              <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </a>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFormMode({ type: "edit", projectId: project.id });
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={isDeleting}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete{" "}
                                <strong>{project.title}</strong> and remove all
                                associated team relationships. This action cannot
                                be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteProject(project.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Yes, delete project
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
