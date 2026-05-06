"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
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
} from "@/shared/ui/alert-dialog";
import { useDeleteProject } from "@/features/admin";
import {useProjects} from "@/entities/projects/projects"

export function ProjectAdminPanel() {
  const { data: projects, isLoading, isError } = useProjects();
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject();

  const [searchQuery, setSearchQuery] = useState("");

  // Filter projects based on search query
  const filteredProjects = projects?.filter((project) => {
    const query = searchQuery.toLowerCase();
    return (
      project.title.toLowerCase().includes(query) ||
      project.oneLineDescription.toLowerCase().includes(query) ||
      project.status.toLowerCase().includes(query)
    );
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Project entries</h2>
          <p className="text-sm text-muted-foreground">
            Manage your showcase projects here.
          </p>
        </div>
        <Link href="/member/admin/projects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
          <CardDescription>
            Search and filter existing projects to edit or remove them.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search/Filter Bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by title, description, or status..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Loading / Error States */}
          {isLoading && (
            <p className="text-sm text-muted-foreground">Loading projects...</p>
          )}
          {isError && (
            <p className="text-sm text-destructive">Failed to load projects.</p>
          )}

          {/* Project List */}
          {!isLoading && !isError && filteredProjects && (
            <div className="rounded-md border">
              {filteredProjects.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No projects found matching `{searchQuery}`.
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
                          <a
                            href={project.repoUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              title="View Repo"
                            >
                              <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </a>
                        )}

                        <Link href={`/member/admin/projects/${project.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                        </Link>

                        {/* SHADCN ALERT DIALOG FOR DELETION */}
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
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete{" "}
                                <strong>{project.title}</strong> and remove all
                                associated team relationships from our servers.
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel variant={undefined} size={undefined}>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteProject(project.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90" variant={undefined} size={undefined}                              >
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