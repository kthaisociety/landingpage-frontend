export const APPLICATION_TEAMS = [
  "Business",
  "Development",
  "Research",
  "Growth",
  "IT",
] as const;

export const APPLICATION_AVAILABILITY = [
  "4-6 hours",
  "6-8 hours",
  "8 hours or more",
] as const;

export const APPLICATION_STATUSES = [
  "pending",
  "reviewed",
  "accepted",
  "rejected",
] as const;

export type ApplicationTeam = (typeof APPLICATION_TEAMS)[number];
export type ApplicationAvailability = (typeof APPLICATION_AVAILABILITY)[number];
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const APPLICATION_TEAM_DESCRIPTIONS: Record<ApplicationTeam, string> = {
  Business:
    "Build partnerships, secure funding, and organise events that support long-term growth.",
  Development:
    "Build real AI projects with ML, LLMs, and product-focused engineering.",
  Research:
    "Explore AI trends, write insights, and lead discussions that deepen shared knowledge.",
  Growth:
    "Shape social media, branding, internal events, and member engagement.",
  IT: "Maintain the website, internal tools, automation, and digital infrastructure.",
};

export type GeneralApplication = {
  id: string;
  application_year: number;
  first_name: string;
  last_name: string;
  email: string;
  programme: string;
  graduation_year: number;
  linkedin_url: string;
  additional_links: string[] | null;
  resume_file_name: string;
  resume_content_type: string;
  teams: ApplicationTeam[];
  team_interest_reason: string;
  availability: ApplicationAvailability;
  contribution: string;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
};

export type CreateGeneralApplicationInput = {
  firstName: string;
  lastName: string;
  email: string;
  programme: string;
  graduationYear: number;
  linkedinUrl: string;
  additionalLinks: string[];
  resume: File;
  teams: ApplicationTeam[];
  teamInterestReason: string;
  availability: ApplicationAvailability;
  contribution: string;
};

export type CreateGeneralApplicationResponse = {
  id: string;
  status: ApplicationStatus;
  created_at: string;
};

export type AdminApplicationsFilters = {
  year?: number;
  status?: ApplicationStatus | "all";
  team?: ApplicationTeam | "all";
  q?: string;
};
