import { useQuery } from "@tanstack/react-query";
import { API_BASE, API_URL } from "@/config";


export type BackendMemberResponse = {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  department: string;
  profile_picture?: string; // Optional,
};

export type BackendProjectResponse = {
  id: string;
  team_id?: string;
  title: string;                 // JSON uses "title", not "Name"
  oneLineDescription: string;
  categories: string;            // JSON uses a comma string: "Research team, IT team"
  techStack: string;             // JSON uses a comma string: "testAPI, testAPI2.0"
  problemImpact: string;
  keyFeatures: string;           // JSON uses <SEP>: "Feat 1<SEP>Feat 2"
  status: string;
  screenshots: string;           // JSON stringified array
  repoUrl: string;
  affiliations: string;
  timeline: string;              // JSON stringified object
  maintenancePlan: string;
  contact: string;
  members: BackendMemberResponse[];
};


export type ExtendedProjectInput = {
  id: string;
  title: string;
  teamName: string;
  oneLineDescription: string;
  shortDescription: string;
  categories: string[];
  techStack: string[];
  problemImpact: string;
  keyFeatures: string[];
  status: string;
  coverImage: string;
  websiteUrl: string;
  repoUrl: string;
  screenshots: { image: string; caption: string; alt?: string }[];
  contributors: {
    profileId: string;
    name: string;
    email: string;
    role: string;
    team: string;
    avatar: string;
  }[];
  affiliations: string;
  timeline: {
    startDate: string;
    currentPhase: string;
    upcomingMilestones: string[];
  };
  maintenancePlan: string;
  contact: string;
};

export function transformProjectData(
  backendData: BackendProjectResponse,
): ExtendedProjectInput {
  const normalizeMediaUrl = (url: string): string => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    if (url.startsWith("/api/v1/")) {
      return `${API_BASE}${url}`;
    }
    return url;
  };

  const safeJsonParse = <T>(jsonString: string, fallback: T): T => {
    if (!jsonString) return fallback;
    try {
      return JSON.parse(jsonString) as T;
    } catch {
      return fallback;
    }
  };

  // Safe string-to-array parser (for commas)
  const parseCommaStringToArray = (str: string | string[]): string[] => {
    if (!str) return [];
    if (Array.isArray(str)) return str;
    if (str.trim().startsWith("[")) return safeJsonParse<string[]>(str, []);
    return str
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  // Safe string-to-array parser (for <SEP>)
  const parseSepStringToArray = (str: string): string[] => {
    if (!str) return [];
    return str
      .split("<SEP>")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const parsedScreenshotsRaw = safeJsonParse<
    { image: string; caption: string; alt?: string }[]
  >(backendData.screenshots, []);
  const parsedScreenshots = parsedScreenshotsRaw.map((shot) => ({
    ...shot,
    image: normalizeMediaUrl(shot.image),
  }));

  return {
    id: backendData.id || "", 
    title: backendData.title || "",
    oneLineDescription: backendData.oneLineDescription || "",
    shortDescription: backendData.oneLineDescription || "",
    
    // Parse the comma-separated strings
    categories: parseCommaStringToArray(backendData.categories),
    techStack: parseCommaStringToArray(backendData.techStack),
    
    // Parse the <SEP> separated string
    keyFeatures: parseSepStringToArray(backendData.keyFeatures),
    
    problemImpact: backendData.problemImpact || "",
    status: backendData.status || "planning",

    coverImage: parsedScreenshots.length > 0 ? parsedScreenshots[0].image : "",
    screenshots: parsedScreenshots,

    websiteUrl: "", // Missing from DB
    repoUrl: backendData.repoUrl || "",
    affiliations: backendData.affiliations || "",
    maintenancePlan: backendData.maintenancePlan || "",
    contact: backendData.contact || "",

    timeline: safeJsonParse(backendData.timeline, {
      startDate: "",
      currentPhase: "",
      upcomingMilestones: [],
    }),

    // Map Contributors matching the new snake_case properties
    contributors: (backendData.members || []).map((member) => {
      const fullName = `${member.first_name || ""} ${member.last_name || ""}`.trim();

      return {
        profileId: member.user_id || "",
        name: fullName || member.email || "Unknown Contributor",
        email: member.email || "",
        role: member.role || "Contributor",
        team: member.department || "Core Team",
        avatar: member.profile_picture || "",
      };
    }),

    teamName: backendData.team_id
      ? "Fetched Team (Name Missing in DB)"
      : "No Team",
  };
}

export function useProject(id: string) {
  return useQuery<ExtendedProjectInput, Error>({
    enabled: !!id,
    queryKey: ["project", id],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/projects/${id}`, {
        credentials: "include",
      });

      if (!response.ok)
        throw new Error(`Failed to fetch project: ${response.status}`);
      const rawData: BackendProjectResponse = await response.json();

      return transformProjectData(rawData);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useProjects() {
  return useQuery<ExtendedProjectInput[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/projects`, {
        credentials: "include",
      });

      if (!response.ok)
        throw new Error(`Failed to fetch projects: ${response.status}`);
      
      const rawData: BackendProjectResponse[] = await response.json();
      
      return rawData.map(transformProjectData);
    },
    staleTime: 5 * 60 * 1000,
  });
}