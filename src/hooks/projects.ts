import { useEffect, useState } from "react";

export type ProjectInput = {
  title: string;
  oneLineDescription: string;
  categories: string[];
  techStack: string;
  problemImpact: string;
  keyFeatures: string;
  status: string;
  screenshots: string;
  repoUrl: string;
  contributors: string[];
  affiliations: string;
  timeline: string;
  maintenancePlan: string;
  contact: string;
  logoUrl?: string;
};

export type ProjectPost = ProjectInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "kthais-project-posts";

const getNowIso = () => new Date().toISOString();

const getStoredProjects = (): ProjectPost[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as ProjectPost[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const persistProjects = (projects: ProjectPost[]) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

export function useProjectPosts() {
  const [projects, setProjects] = useState<ProjectPost[]>(() =>
    getStoredProjects(),
  );

  useEffect(() => {
    persistProjects(projects);
  }, [projects]);

  const createProject = (input: ProjectInput) => {
    const now = getNowIso();
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const newProject: ProjectPost = {
      ...input,
      id,
      createdAt: now,
      updatedAt: now,
    };
    setProjects((prev) => [newProject, ...prev]);
  };

  return {
    projects,
    createProject,
  };
}
