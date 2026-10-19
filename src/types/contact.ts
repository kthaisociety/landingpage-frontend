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
  research: "Research",
  it: "IT",
  development: "Development",
  business: "Business",
  growth: "Growth",
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
