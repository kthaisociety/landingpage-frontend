import { getProjectById, type Project } from "@/lib/data/projects";

export type MemberStatus = "Active" | "Alumni";

export interface MockMemberEvent {
  id: string;
  name: string;
  startAt: string;
  coverImage?: string;
  url: string;
  status?: "past" | "upcoming";
}

export interface MockMemberProfileData {
  slug: string;
  firstName: string;
  lastName: string;
  programme: string;
  memberStatus: MemberStatus;
  linkedInLink?: string;
  aboutMe: string;
  profileImage?: string | null;
  projectIds: string[];
  events: MockMemberEvent[];
}

export interface ResolvedMockMemberProfile
  extends Omit<MockMemberProfileData, "projectIds"> {
  fullName: string;
  projects: Project[];
}

const mockMemberProfiles: MockMemberProfileData[] = [
  {
    slug: "demo-member",
    firstName: "Maja",
    lastName: "Lindholm",
    programme: "MSc Machine Learning",
    memberStatus: "Active",
    linkedInLink: "https://linkedin.com/in/demo-member",
    aboutMe:
      "I am interested in applied AI, product thinking, and building useful systems that move from prototype to deployment. I enjoy working across research, engineering, and strategy, and I am especially drawn to projects where technical depth meets real user value.",
    profileImage: null,
    projectIds: ["gnosis", "pyrmit", "topovision"],
    events: [
      {
        id: "mock-event-1",
        name: "KTH AI Build Night",
        startAt: "2026-02-14T17:30:00Z",
        coverImage: "/event-placeholder.jpg",
        url: "https://lu.ma/",
        status: "past",
      },
      {
        id: "mock-event-2",
        name: "Applied AI Product Showcase",
        startAt: "2026-05-09T16:00:00Z",
        coverImage: "/event-placeholder.jpg",
        url: "https://lu.ma/",
        status: "upcoming",
      },
    ],
  },
  {
    slug: "research-lead-demo",
    firstName: "Elias",
    lastName: "Sundberg",
    programme: "BSc Computer Science",
    memberStatus: "Alumni",
    linkedInLink: "https://linkedin.com/in/research-lead-demo",
    aboutMe:
      "My focus is on technical research projects with clear execution paths. I like turning ambiguous ideas into testable systems, and I care about building teams that can move quickly without losing rigor.",
    profileImage: null,
    projectIds: ["flow-matching", "kth-course-community"],
    events: [
      {
        id: "mock-event-3",
        name: "Research Sprint Kickoff",
        startAt: "2026-01-20T18:00:00Z",
        coverImage: "/event-placeholder.jpg",
        url: "https://lu.ma/",
        status: "past",
      },
    ],
  },
];

export function getResolvedMockMemberProfileBySlug(
  slug: string,
): ResolvedMockMemberProfile | undefined {
  const profile = mockMemberProfiles.find((entry) => entry.slug === slug);

  if (!profile) {
    return undefined;
  }

  const projects = profile.projectIds
    .map((projectId) => getProjectById(projectId))
    .filter((project): project is Project => Boolean(project));

  return {
    ...profile,
    fullName: `${profile.firstName} ${profile.lastName}`.trim(),
    projects,
  };
}