export interface AdminProfileData {
  /** Profile row UUID — used for admin team entry APIs */
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  university?: string;
  programme?: string;
  graduation_year?: number;
  github_link?: string;
  linkedin_link?: string;
  about_me?: string;
}

export interface UpdateAdminUserProfileData {
  firstName: string;
  lastName: string;
  email: string;
  university?: string;
  programme?: string;
  graduationYear?: number;
  githubLink?: string;
  linkedinLink?: string; // PUT expects lowercase 'i'
  aboutMe?: string;
}

export interface AdminUser {
  user_id: string;
  email: string;
  provider: string;
  created_at: string;
  roles: string[];
  // Left-joined from Profile — blank if the account was provisioned but
  // the member has never signed in to create one yet.
  first_name: string;
  last_name: string;
  team: string;
  board_role: string;
  // Set once OffboardingHandler.Deactivate succeeds for this user; null/
  // absent for an active member. Still present in every /admin/users
  // response (not filtered server-side) so a deactivated member can still
  // be found, e.g. to finish permanently deleting them later — this app's
  // own UI is what excludes them from default counts/views.
  deactivated_at?: string | null;
}

// Every value Profile.BoardRole may hold — mirrors the backend's
// AllBoardRoles. Eight of these are held by exactly one person at a time
// and only change hands via a self-service transfer; "board_advisor" is
// the one multi-holder exception, managed by plain admin add/remove.
export const BOARD_ROLES = [
  "chairperson",
  "vice_chairperson",
  "head_of_it",
  "head_of_business",
  "head_of_development",
  "head_of_research",
  "head_of_growth",
  "board_advisor",
  "treasurer",
] as const;

export type BoardRole = (typeof BOARD_ROLES)[number];

export const BOARD_ROLE_LABELS: Record<BoardRole, string> = {
  chairperson: "Chairperson",
  vice_chairperson: "Vice Chairperson",
  head_of_it: "Head of IT",
  head_of_business: "Head of Business",
  head_of_development: "Head of Development",
  head_of_research: "Head of Research",
  head_of_growth: "Head of Growth",
  board_advisor: "Board Advisor",
  treasurer: "Treasurer",
};

// The eight roles transferred rather than granted/revoked — everything
// except board_advisor, which has no single holder to transfer from.
export const EXACTLY_ONE_BOARD_ROLES = BOARD_ROLES.filter(
  (role): role is Exclude<BoardRole, "board_advisor"> => role !== "board_advisor",
);

/** Matches GET /admin/board-role's response shape. */
export type BoardRoleHolders = {
  [K in Exclude<BoardRole, "board_advisor">]: string | null;
} & {
  board_advisor: string[];
};
