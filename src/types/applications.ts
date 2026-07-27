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

export const APPLICATION_INTERESTS = [
  "Machine Learning",
  "Robotics & Autonomous Systems",
  "Computer Vision & Graphics",
  "Natural Language Processing",
  "Data Science & Big Data Infrastructure",
  "Embedded Systems & Edge AI",
  "Cybersecurity & AI Safety Engineering",
  "AI Research & Theoretical ML",
  "Bioinformatics & Computational Biology",
  "Quantitative Finance & Investment",
  "Venture Capital & Private Equity",
  "Startups & Venture Creation",
] as const;

export const APPLICATION_STATUSES = [
  "pending",
  "available",
  "interviewing",
  "ineligible",
  "withdrawn",
] as const;

// Shared with the newsletter signup form so both flows offer the same options.
export const OTHER_PROGRAMME_VALUE = "Other / not listed";
export const OTHER_UNIVERSITY_VALUE = "Other";
export const UNIVERSITIES = [
  "KTH Royal Institute of Technology",
  "Stockholm University",
  "Stockholm School of Economics",
  "Karolinska Institutet",
  "Södertörn University",
  OTHER_UNIVERSITY_VALUE,
] as const;

export function getGraduationYearOptions(): string[] {
  const currentYear = new Date().getFullYear();
  // 6 years out covers students starting a 5-year programme this year.
  return Array.from({ length: 6 }, (_, index) => String(currentYear + index));
}

// Shared by the application and newsletter forms, which both pair a select
// with an "Other" free-text fallback for university/programme.
export function resolveUniversity(values: {
  university: string;
  universityOther: string;
}): string {
  return values.university === OTHER_UNIVERSITY_VALUE
    ? values.universityOther.trim()
    : values.university.trim();
}

export function resolveProgramme(values: {
  programme: string;
  programmeOther: string;
}): string {
  return values.programme === OTHER_PROGRAMME_VALUE
    ? values.programmeOther.trim()
    : values.programme.trim();
}

export type ApplicationTeam = (typeof APPLICATION_TEAMS)[number];
export type ApplicationAvailability = (typeof APPLICATION_AVAILABILITY)[number];
export type ApplicationGender = (typeof APPLICATION_GENDERS)[number];
export type ApplicationInterest = (typeof APPLICATION_INTERESTS)[number];
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const APPLICATION_TEAM_LABELS: Record<ApplicationTeam, string> = {
  Business: "Business Development",
  Development: "AI Development",
  Research: "AI Research",
  Growth: "Growth",
  IT: "IT",
};

export const APPLICATION_TEAM_DESCRIPTIONS: Record<ApplicationTeam, string> = {
  Business:
    "Work with outreach, data analysis, and negotiations to build and maintain partnerships.",
  Development:
    "Build real-world AI applications from prototype to deployment in small teams using LLMs, agents, and modern engineering.",
  Research:
    "Explore frontier and applied AI through student-led research, experiments, prototypes, and technical communication.",
  Growth:
    "Drive member growth through social media, branding, growth initiatives, and internal events.",
  IT:
    "Empower the AI society through high-quality digital infrastructure, custom internal tools, and a robust developer platform.",
};

export const APPLICATION_TEAM_FULL_DESCRIPTIONS: Record<
  ApplicationTeam,
  readonly string[]
> = {
  Development: [
    "The AI Development Team builds real-world AI applications from idea to deployment. As a member, you'll work in small, collaborative project teams as either a developer or technical lead, designing, building, and deploying products powered by LLMs, AI agents, machine learning, and modern software engineering practices.",
    "We're looking for students who enjoy building things, experimenting with new technologies, and learning by doing. You don't need to be an AI expert, but you should be comfortable writing code, curious about intelligent systems, and motivated to turn ideas into useful products with a team. This role is ideal if you want hands-on experience with applied AI, collaborative software development, and taking projects from prototype to production.",
    "We're particularly interested in students with experience in modern software development using languages such as TypeScript, Python, or Rust, and who are comfortable leveraging AI coding agents such as Claude Code or Codex as part of their development workflow. You should be comfortable working across the stack, from frontend and backend development to deployment.",
    "Experience with technologies such as React, Next.js, FastAPI, PostgreSQL, AI-SDK or Langchain for AI, Docker, cloud platforms, Git/GitHub, and CI/CD is a plus. Prior experience building AI-native applications is also valuable—for example, working with agents, RAG pipelines, OCR, vector databases, evaluation frameworks, coding agents, or LLM-powered workflows beyond simple API wrappers."
  ],
  IT: [
    "The IT team is responsible for the digital infrastructure that powers AI Society. Standard obligations include maintaining and improving the AI Society website, developing custom solutions, and enabling other teams by providing a developer platform and internal tools.",
    "To achieve our mission, we are building out two specialized tracks: Software Engineering and Platform Engineering.",
    "Our Software Engineers will be the core builders. You will be a highly code-oriented contributor responsible for maintaining and evolving our key digital assets. This involves direct work on the public website (built with Next.js), backend development (Golang, Postgres), and constructing custom tooling across various frameworks and languages. If you can dive deep into code, adapt quickly to new technologies, and exercise an independent engineering mindset, this track is for you.",
    "Our Platform Engineers will take a broader, system-thinking approach. You will be deeply embedded with all the teams within AI Society, acting as workflow architects. Your mission is to map existing operational workflows, identify organizational bottlenecks and pain points, and design comprehensive solutions. This role requires versatility; the tools might range from light scripting workflows to integrating diverse services of all sorts. If you are passionate about optimizing processes, improving efficiency through systems thinking, and automating absolutely everything possible, you will thrive in this role.",
    "We are looking for students who enjoy building, experimenting, and learning by doing. You do not need to be an expert already, but you should be comfortable writing code, curious about how systems work, and motivated to ship useful projects together with others. The team is a good fit if you want hands-on experience with collaborative software development, resilient system design, and taking technical ideas from prototype to working product.",
  ],
  Research: [
    "The AI Research Team explores frontier and applied AI through student-led research projects, paper reading, experimentation, evaluation, and technical communication. As a member, you will work in small research groups to understand recent AI work, reproduce or extend methods, design experiments, build research prototypes, and turn findings into reports, demos, workshops, or blog posts.",
    "We are looking for students who are curious, rigorous, and excited to think deeply about AI systems. You do not need prior publication experience, but you should be willing to read technical material, reason carefully, write clearly, and learn the tools needed to investigate research questions. The team is a good fit if you are interested in areas such as LLMs, AI evaluation, reinforcement learning, computer vision, multimodal AI, robotics, embodied AI, or machine learning, and want to develop both technical depth and research judgment.",
    "Relevant skills include Python programming, basic machine learning knowledge, mathematical maturity, the ability to read technical material, careful reasoning, clear communication, reliability, and willingness to learn. Experience with PyTorch, TensorFlow, or similar ML frameworks is especially valuable, as is experience training, evaluating, or fine-tuning models. Skills in experiment tracking, Git/GitHub collaboration, data handling with NumPy, pandas, or scikit-learn, and previous work with LLMs, computer vision, robotics, mathematical modeling, or research projects are also useful, but not required.",
  ],
  Growth: [
    "The Growth Team drives the strategic expansion, brand identity, and community vitality of the society through data-driven marketing, ecosystem growth initiatives, and internal culture building. Serving essentially as the organization's Go-To-Market (GTM) engine, this team is the perfect fit for students who want to immerse themselves in the AI ecosystem from a business, strategic, or creative perspective without needing a highly technical background. As a member, you will design and execute marketing strategies—including leading the end-to-end marketing strategy for our recruitment cycles—and own the production of the society's flagship Annual Report. You will also analyze audience data to unlock member growth, curate internal events to foster a strong community, oversee brand compliance across channels, manage merchandise, and handle media capture. This role gives you direct, front-row access to all of our flagship events, workshops, and high-profile networking sessions.",
    "We are looking for students who are proactive, efficient, and excited about building high-growth communities. No prior technical or marketing skills are required, but you must possess a strong sense of ownership, excellent communication skills, and the organizational agility to balance schoolwork with your responsibilities in the society. The team is a highly strategic launchpad if you want to get to know the AI world better, and is an ideal fit for anyone interested in fields like Marketing, Go-To-Market (GTM), Data Analytics, or Management Consulting, looking to develop commercial acumen and organizational leadership.",
    "Relevant skills include high efficiency, reliable execution, clear communication, and a willingness to learn the tools of the trade. While we welcome complete beginners, experience with design tools like Figma, or skills in video editing and content creation are a massive plus.",
  ],
  Business: [
    "The Business Team owns every relationship between KTHAIS and the outside world - from the first outreach to a signed partnership, from a sponsorship negotiation to a long-term strategic collaboration with some of the most relevant companies in AI and tech.",
    "This is not a passive role. You will be the main contact to companies, running negotiations, structuring deals, and representing KTHAIS in rooms where it matters. You will analyze data to understand what partnerships will deliver value, write reports that inform how we operate, and help build the infrastructure that makes KTHAIS a credible counterpart to enterprise partners and institutions.",
    "We are growing fast. KTHAIS is increasingly recognized internationally and is playing an active role in shaping AI ecosystems beyond Stockholm. The Business Team is a direct part of that trajectory.",
    "We are looking for people who are both business oriented and technically sharp, take initiative without being asked, and care about building something that lasts beyond their own time in the role. Prior experience is secondary - ambition and execution are not.",
  ],
};

export type GeneralApplication = {
  id: string;
  application_year: number;
  first_name: string;
  last_name: string;
  email: string;
  gender: ApplicationGender;
  university: string;
  programme: string;
  graduation_year: number;
  linkedin_url: string;
  additional_links: string[] | null;
  resume_file_name: string;
  resume_content_type: string;
  teams: ApplicationTeam[];
  team_preferences_ranked: boolean;
  team_interest_reason: string;
  interests: ApplicationInterest[];
  availability: ApplicationAvailability;
  contribution: string;
  data_retention_consent: boolean;
  status: ApplicationStatus;
  interviewing_by_user_id: string | null;
  interviewing_by_email: string;
  interviewed_by: string[];
  interview_invite_sent_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateGeneralApplicationInput = {
  firstName: string;
  lastName: string;
  email: string;
  gender: ApplicationGender;
  university: string;
  programme: string;
  graduationYear: number;
  linkedinUrl: string;
  additionalLinks: string[];
  resume: File;
  teams: ApplicationTeam[];
  interests: ApplicationInterest[];
  availability: ApplicationAvailability;
  contribution: string;
  dataRetentionConsent: boolean;
  newsletterOptIn: boolean;
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

export type TeamQuestion = {
  id: string;
  text: string;
  required: boolean;
};

export type TeamQuestionsForm = {
  first_name: string;
  teams: ApplicationTeam[];
  questions: Partial<Record<ApplicationTeam, TeamQuestion[]>>;
};

export type TeamQuestionsAnswers = Record<string, Record<string, string>>;

export type TeamQuestionsSubmitInput = {
  answers: TeamQuestionsAnswers;
  withdrawn_teams: string[];
};

export type TeamQuestionsSubmitResponse = {
  status: ApplicationStatus;
};

export type TeamQuestionsSubmission =
  | { submitted: false }
  | {
      submitted: true;
      answers: TeamQuestionsAnswers;
      withdrawn_teams: string[];
      submitted_at: string;
    };

export type TeamQuestionsTemplate = {
  email_template: string;
  updated_by_email: string;
  can_edit: boolean;
};

export type TeamQuestionsSendBulkResult = {
  sent: number;
  failed: string[];
};

export type TeamQuestionsSendBulkPreview = {
  count: number;
};
