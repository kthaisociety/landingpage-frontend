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

export const APPLICATION_GENDERS = [
  "Female",
  "Male",
  "Non-binary",
  "Prefer not to say",
  "Other",
] as const;

export const APPLICATION_STATUSES = [
  "pending",
  "reviewed",
  "accepted",
  "rejected",
] as const;

export type ApplicationTeam = (typeof APPLICATION_TEAMS)[number];
export type ApplicationAvailability = (typeof APPLICATION_AVAILABILITY)[number];
export type ApplicationGender = (typeof APPLICATION_GENDERS)[number];
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const APPLICATION_TEAM_DESCRIPTIONS: Record<ApplicationTeam, string> = {
  Business:
    "Work with outreach, data analysis, and negotiations to build and maintain partnerships",
  Development:
    "Build real-world AI applications from prototype to deployment in small teams using LLMs, agents, and modern engineering.",
  Research:
    "Explore frontier and applied AI through student-led research, experiments, prototypes, and technical communication.",
  Growth:
    "Drive member growth through social media, branding, growth initiatives, and internal events.",
  IT:
    "Empower the AI society through high-quality digital infrastructure, custom internal tools, and a robust developer platform.",
};

export type GeneralApplication = {
  id: string;
  application_year: number;
  first_name: string;
  last_name: string;
  email: string;
  gender: ApplicationGender;
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
  data_retention_consent: boolean;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
};

export type CreateGeneralApplicationInput = {
  firstName: string;
  lastName: string;
  email: string;
  gender: ApplicationGender;
  programme: string;
  graduationYear: number;
  linkedinUrl: string;
  additionalLinks: string[];
  resume: File;
  teams: ApplicationTeam[];
  teamInterestReason: string;
  availability: ApplicationAvailability;
  contribution: string;
  dataRetentionConsent: boolean;
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
