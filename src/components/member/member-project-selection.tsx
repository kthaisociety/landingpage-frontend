"use client";

import Link from "next/link";
import { useState } from "react";
import { useProjects } from "@/hooks/projects";
import { useAuth } from "@/lib/providers/auth-provider/authProvider";
import { API_URL } from "@/config";

export function MemberProjectSelection() {
  const { data: projects = [], isLoading, isError, refetch } = useProjects();
  const [uploadingProjectId, setUploadingProjectId] = useState<string | null>(null);
  const [projectMedia, setProjectMedia] = useState<
    Record<string, { coverImage: File | null; screenshots: File[] }>
  >({});

  const { isLoading: userIsLoading, user } = useAuth();
  let currentUserEmail = null;
  if (!userIsLoading && user?.email) currentUserEmail = user.email;

  const myProjects = projects.filter((project) =>
    project.contributors?.some(
      (contributor) =>
        contributor.email.toLowerCase() === currentUserEmail?.toLowerCase(),
    ),
  );

  const updateProjectMediaState = (
    projectId: string,
    patch: Partial<{ coverImage: File | null; screenshots: File[] }>,
  ) => {
    setProjectMedia((prev) => ({
      ...prev,
      [projectId]: {
        coverImage: prev[projectId]?.coverImage ?? null,
        screenshots: prev[projectId]?.screenshots ?? [],
        ...patch,
      },
    }));
  };

  const uploadProjectMedia = async (projectId: string) => {
    const selected = projectMedia[projectId];
    if (!selected || (!selected.coverImage && selected.screenshots.length === 0)) {
      return;
    }

    const body = new FormData();
    if (selected.coverImage) {
      body.append("coverImage", selected.coverImage);
    }
    selected.screenshots.forEach((file) => body.append("screenshots", file));

    setUploadingProjectId(projectId);
    try {
      const res = await fetch(`${API_URL}/projects/${projectId}/media`, {
        method: "PUT",
        credentials: "include",
        body,
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || "Failed to upload project media");
      }

      await refetch();
      updateProjectMediaState(projectId, { coverImage: null, screenshots: [] });
      window.alert("Project media uploaded.");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploadingProjectId(null);
    }
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
        <h2 className="text-lg font-medium">Your Projects</h2>

        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {myProjects.map((project) => (
            <div
              key={project.id}
              className="flex flex-col gap-3 p-4 border rounded-lg hover:bg-secondary/20 transition-colors"
            >
              <Link href={`/projects/${project.id}`} className="block cursor-pointer">
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

              <div className="border-t pt-3 space-y-2">
                <p className="text-xs font-mono text-muted-foreground">
                  Update project media (cover + screenshots)
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    updateProjectMediaState(project.id, {
                      coverImage: e.target.files?.[0] ?? null,
                    })
                  }
                  className="text-xs"
                />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) =>
                    updateProjectMediaState(project.id, {
                      screenshots: Array.from(e.target.files ?? []),
                    })
                  }
                  className="text-xs"
                />
                <button
                  type="button"
                  onClick={() => uploadProjectMedia(project.id)}
                  disabled={uploadingProjectId === project.id}
                  className="text-xs font-medium px-3 py-1.5 rounded bg-primary text-white disabled:opacity-60"
                >
                  {uploadingProjectId === project.id ? "Uploading..." : "Upload images"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
