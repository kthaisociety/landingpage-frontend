export const CONTACT_TEAMS = [
  "board",
  "research",
  "it",
  "development",
  "business",
  "growth",
] as const;

export type ContactTeam = (typeof CONTACT_TEAMS)[number];

export const CONTACT_TEAM_LABELS: Record<ContactTeam, string> = {
  board: "Board",
  research: "AI Research",
  it: "IT",
  development: "AI Development",
  business: "Business Development",
  growth: "Growth",
};

/** Short “when to pick this” copy shown under the selected team. */
export const CONTACT_TEAM_GUIDANCE: Record<ContactTeam, string> = {
  board:
    "General questions, governance, and anything that does not fit another team.",
  research: "Student research initiatives and AI Research collaborations.",
  it: "Website issues, internal tools, bugs, and digital infrastructure.",
  development:
    "Student AI projects and product work with the AI Development team.",
  business:
    "Partnerships, sponsorship, job posts, and company collaborations. External collabs start here, even when the work involves another team.",
  growth: "Events, media, branding, social channels, and community outreach.",
};

export interface ContactMessageInput {
  name: string;
  email: string;
  team: ContactTeam;
  subject: string;
  message: string;
}

export interface ContactMessageResponse {
  status: string;
  team: string;
}
