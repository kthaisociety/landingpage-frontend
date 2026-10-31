const STORAGE_KEY = "profileTouches:v1";

export interface ProfileTouches {
  askMeAbout: string;
  outsideStudies: string;
  currentlyBuilding: string;
  currentlyReading: string;
  spotifyUrl: string;
}

export const EMPTY_TOUCHES: ProfileTouches = {
  askMeAbout: "",
  outsideStudies: "",
  currentlyBuilding: "",
  currentlyReading: "",
  spotifyUrl: "",
};

export function spotifyUrlFrom(value: { spotifyUrl?: string; spotifyUrls?: string[] } | null | undefined) {
  const direct = value?.spotifyUrl?.trim();
  if (direct) return direct;
  return value?.spotifyUrls?.map((url) => url.trim()).find(Boolean) ?? "";
}

function readAll(): Record<string, ProfileTouches> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, ProfileTouches>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function loadTouches(id: string): ProfileTouches | null {
  if (!id || typeof window === "undefined") return null;
  const stored = readAll()[id] as (ProfileTouches & { spotifyUrls?: string[] }) | undefined;
  if (!stored) return null;
  return {
    askMeAbout: stored.askMeAbout || "",
    outsideStudies: stored.outsideStudies || "",
    currentlyBuilding: stored.currentlyBuilding || "",
    currentlyReading: stored.currentlyReading || "",
    spotifyUrl: spotifyUrlFrom(stored),
  };
}

export function saveTouches(id: string, touches: ProfileTouches) {
  if (!id) return;
  try {
    const all = readAll();
    all[id] = touches;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // Private browsing and full storage both throw.
  }
}

const PREVIEW_DRAFT_KEY = "profilePreviewDraft:v1";

export interface PreviewDraft {
  firstName: string;
  lastName: string;
  university: string;
  programme: string;
  graduationYear: string;
  githubLink: string;
  linkedinLink: string;
  aboutMe: string;
  askMeAbout: string;
  outsideStudies: string;
  currentlyBuilding: string;
  currentlyReading: string;
  currentlyLearning: string;
  currentlyExploring: string;
  spotifyUrl: string;
}

export function loadPreviewDraft(): PreviewDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PREVIEW_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PreviewDraft;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function savePreviewDraft(draft: PreviewDraft) {
  try {
    localStorage.setItem(PREVIEW_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Private browsing and full storage both throw.
  }
}
