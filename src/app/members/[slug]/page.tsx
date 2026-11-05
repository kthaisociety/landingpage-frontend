"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Briefcase, Camera, Check, ExternalLink, Music, Plus, Trash2, User } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AsciiGrid } from "@/components/ui/ascii-grid";
import { useAddMyTeamEntry, usePublicProfile, useRemoveMyTeamEntry, type PublicProfile } from "@/hooks/team";
import { useUpdateMemberProfile } from "@/hooks/member";
import { MemberProjectSelection } from "@/components/member/member-project-selection";
import { SongSearch } from "@/components/member/song-search";
import { API_URL } from "@/config";
import { useAuth } from "@/lib/providers/auth-provider/authProvider";
import { EMPTY_TOUCHES, loadPreviewDraft, loadTouches, savePreviewDraft, saveTouches, songFromFields, spotifyUrlFrom, type PreviewDraft, type ProfileSong, type ProfileTouches } from "@/lib/profile-touches";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { ProgrammeSelect } from "@/components/member/programme-select";
import { OTHER_PROGRAMME_VALUE, OTHER_UNIVERSITY_VALUE, UNIVERSITIES } from "@/types/applications";
import { ACADEMIC_YEARS } from "@/lib/academic-years";

const TEAMS = ["Board", "Research", "IT", "Development", "Business", "Growth"];

const CURRENTLY_FIELDS = [
  { key: "currentlyBuilding", label: "Building", placeholder: "a UX research tool" },
  { key: "currentlyLearning", label: "Learning", placeholder: "Rust" },
  { key: "currentlyReading", label: "Reading", placeholder: "Designing for the Digital Age" },
] as const;

const PROMPT_FIELDS = [
  { key: "askMeAbout", label: "Ask me about..." },
  { key: "outsideStudies", label: "Outside of studies you'll find me..." },
] as const;

const KNOWN_UNIVERSITIES = UNIVERSITIES.filter((uni) => uni !== OTHER_UNIVERSITY_VALUE);

function graduationYearOptions(current: string) {
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: 37 }, (_, i) => String(thisYear + 6 - i));
  return current && !years.includes(current) ? [current, ...years] : years;
}

const PREVIEW_PROFILE: PublicProfile = {
  id: "preview",
  slug: "preview",
  firstName: "Noor",
  lastName: "Salama",
  profilePicture: "",
  university: "Kungliga Tekniska Högskolan (KTH)",
  programme: "Master's Programme, Interactive Media Technology",
  graduationYear: 2027,
  githubLink: "https://github.com",
  linkedinLink: "https://www.linkedin.com",
  aboutMe:
    "I'm a master's student in Interactive Media Technology who loves the space where design meets AI. In the society I build our frontend and try to make things feel a little more human.",
  askMeAbout: "How AI and design create meaningful digital experiences.",
  outsideStudies: "Figure skating and swimming :)",
  currentlyBuilding: "a UX research tool",
  currentlyReading: "Designing for the Digital Age",
  spotifyUrl: "https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b",
  teamHistory: [
    { id: 1, role: "Software Engineer", department: "IT", academicYear: "2026/2027" },
    { id: 2, role: "Frontend Developer", department: "IT", academicYear: "2025/2026" },
  ],
  projects: [],
};

function withPreviewDraft(base: PublicProfile, draft: PreviewDraft): PublicProfile {
  const year = Number.parseInt(draft.graduationYear, 10);
  return {
    ...base,
    firstName: draft.firstName,
    lastName: draft.lastName,
    university: draft.university,
    programme: draft.programme,
    graduationYear: Number.isFinite(year) ? year : 0,
    githubLink: draft.githubLink,
    linkedinLink: draft.linkedinLink,
    aboutMe: draft.aboutMe,
    askMeAbout: draft.askMeAbout,
    outsideStudies: draft.outsideStudies,
    currentlyBuilding: draft.currentlyBuilding,
    currentlyLearning: draft.currentlyLearning,
    currentlyReading: draft.currentlyReading,
    songId: draft.songId,
    songTitle: draft.songTitle,
    songArtist: draft.songArtist,
    songImage: draft.songImage,
    songHref: draft.songHref,
    spotifyUrl: draft.spotifyUrl,
    teamHistory: draft.teamHistory,
  };
}

function draftFromProfile(profile: PublicProfile): PreviewDraft {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    university: profile.university,
    programme: profile.programme,
    graduationYear: profile.graduationYear ? String(profile.graduationYear) : "",
    githubLink: profile.githubLink,
    linkedinLink: profile.linkedinLink,
    aboutMe: profile.aboutMe,
    askMeAbout: profile.askMeAbout || "",
    outsideStudies: profile.outsideStudies || "",
    currentlyBuilding: profile.currentlyBuilding || "",
    currentlyReading: profile.currentlyReading || "",
    currentlyLearning: profile.currentlyLearning || "",
    currentlyExploring: "",
    spotifyUrl: profile.spotifyUrl || "",
    teamHistory: profile.teamHistory ?? [],
    songId: profile.songId || "",
    songTitle: profile.songTitle || "",
    songArtist: profile.songArtist || "",
    songImage: profile.songImage || "",
    songHref: profile.songHref || "",
  };
}

function profileHasPersonalDetails(profile: PublicProfile) {
  return Boolean(
    profile.askMeAbout?.trim() ||
      profile.outsideStudies?.trim() ||
      profile.currentlyBuilding?.trim() ||
      profile.currentlyLearning?.trim() ||
      profile.currentlyReading?.trim() ||
      profile.songTitle?.trim(),
  );
}

function draftForMember(profile: PublicProfile, userId?: string): PreviewDraft {
  const base = draftFromProfile(profile);
  if (profileHasPersonalDetails(profile)) return base;
  const stored = loadTouches(profile.slug) ?? (userId ? loadTouches(userId) : null);
  if (!stored) return base;
  return {
    ...base,
    askMeAbout: stored.askMeAbout,
    outsideStudies: stored.outsideStudies,
    currentlyBuilding: stored.currentlyBuilding,
    currentlyReading: stored.currentlyReading,
    currentlyLearning: stored.currentlyLearning || "",
    currentlyExploring: stored.currentlyExploring || "",
    spotifyUrl: stored.spotifyUrl,
    teamHistory: profile.teamHistory ?? [],
    songId: stored.songId || "",
    songTitle: stored.songTitle || "",
    songArtist: stored.songArtist || "",
    songImage: stored.songImage || "",
    songHref: stored.songHref || "",
  };
}

function mergePreviewDraft(base: PreviewDraft, stored: PreviewDraft | null): PreviewDraft {
  if (!stored) return base;
  const next = { ...base };
  (Object.keys(base) as (keyof PreviewDraft)[]).forEach((key) => {
    if (key === "teamHistory") return;
    const value = stored[key];
    if (typeof value === "string") next[key] = value;
  });
  if (Array.isArray(stored.teamHistory)) next.teamHistory = stored.teamHistory;
  return next;
}
function personalityFor(profile: PublicProfile): ProfileTouches {
  return {
    askMeAbout: profile.askMeAbout || "",
    outsideStudies: profile.outsideStudies || "",
    currentlyBuilding: profile.currentlyBuilding || "",
    currentlyReading: profile.currentlyReading || "",
    currentlyLearning: profile.currentlyLearning || "",
    spotifyUrl: spotifyUrlFrom(profile),
    songId: profile.songId || "",
    songTitle: profile.songTitle || "",
    songArtist: profile.songArtist || "",
    songImage: profile.songImage || "",
    songHref: profile.songHref || "",
  };
}

type DisplaySong = { href: string; title: string; artist: string; image: string };
function useSpotifySong(url: string) {
  const trimmed = url.trim();
  const [song, setSong] = useState<{ url: string; data: DisplaySong | null } | null>(null);

  useEffect(() => {
    if (!trimmed) return;

    let cancelled = false;
    fetch(`/api/spotify?url=${encodeURIComponent(trimmed)}`)
      .then(async (res) => (res.ok ? ((await res.json()) as DisplaySong) : null))
      .then((data) => {
        if (cancelled) return;
        setSong({
          url: trimmed,
          data: data?.title ? { href: data.href || "", title: data.title, artist: data.artist || "", image: data.image || "" } : null,
        });
      })
      .catch(() => {
        if (!cancelled) setSong({ url: trimmed, data: null });
      });

    return () => {
      cancelled = true;
    };
  }, [trimmed]);

  if (!trimmed || song?.url !== trimmed) return null;
  return song.data;
}

function JewelCasePlayer({
  song,
  caption,
}: {
  song: DisplaySong;
  caption?: string;
}) {
  const cover = song.image ? (
    // eslint-disable-next-line @next/next/no-img-element -- album art from the song lookup
    <img src={song.image} alt="" className="h-full w-full object-cover" />
  ) : (
    <span className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground dark:bg-muted">
      <Music className="h-8 w-8" aria-hidden />
    </span>
  );

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="w-36 sm:w-[13.5rem]">
        <div className="group/jewel relative h-36 w-36">
          <div
            className="absolute top-0 left-0 h-36 w-36 translate-x-2 transition-[translate] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none group-hover/jewel:translate-x-1/2"
            aria-hidden
          >
            <div className="cd-disc relative h-full w-full">
              <div className="absolute inset-0 rounded-full bg-zinc-100 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.9)] [mask-image:radial-gradient(circle_closest-side,transparent_11%,black_13.5%)] dark:bg-zinc-300">
                <div className="absolute inset-0 bg-[repeating-radial-gradient(circle,transparent_0,transparent_3px,rgba(148,163,184,0.45)_3.5px,transparent_4.5px)]" />
              </div>
              <span className="pointer-events-none absolute top-[14%] left-1/2 z-10 -translate-x-1/2 opacity-0 transition-opacity duration-300 group-hover/jewel:opacity-100">
                <span className="cd-laser block size-2 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
              </span>
            </div>
          </div>
          <div className="relative z-10 h-full w-full overflow-hidden rounded-xl border-4 border-white/70 bg-white/20 shadow-md backdrop-blur-sm dark:border-white/25 dark:bg-white/10">
            {cover}
            <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_30%,rgba(255,255,255,0.55)_46%,transparent_60%)] dark:bg-[linear-gradient(115deg,transparent_30%,rgba(255,255,255,0.22)_46%,transparent_60%)]" />
          </div>
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-base font-semibold leading-tight text-secondary-black dark:text-foreground">{song.title}</p>
        {song.artist ? <p className="mt-1 text-sm text-muted-foreground">{song.artist}</p> : null}
        {caption ? <p className="mt-2 text-sm italic leading-relaxed text-foreground/90">{caption}</p> : null}
        {song.href ? (
          <a
            href={song.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${song.title}`}
            className="mt-3 inline-flex text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : null}
      </div>
    </div>
  );
}

function isWebUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed || /\s/.test(trimmed)) return false;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    return (url.protocol === "http:" || url.protocol === "https:") && url.hostname.includes(".");
  } catch {
    return false;
  }
}

function isSpotifyLink(value: string) {
  try {
    const url = new URL(value.trim());
    if (!url.hostname.endsWith("spotify.com")) return false;
    const parts = url.pathname.split("/").filter(Boolean);
    const kinds = ["track", "album", "playlist", "episode", "artist"];
    const kindIndex = parts.findIndex((part) => kinds.includes(part));
    return kindIndex >= 0 && Boolean(parts[kindIndex + 1]);
  } catch {
    return false;
  }
}

function profileCompletion(
  draft: PreviewDraft,
  extras: { otherProgramme: boolean },
) {
  const links = [draft.githubLink, draft.linkedinLink].map((link) => link.trim()).filter(Boolean);
  const programmeDone = extras.otherProgramme
    ? draft.programme.trim().length > 0 && draft.programme !== OTHER_PROGRAMME_VALUE
    : draft.programme.trim().length > 0;
  return [
    { id: "profile-name", label: "Name", done: draft.firstName.trim().length > 0 && draft.lastName.trim().length > 0 },
    { id: "profile-bio", label: "About", done: draft.aboutMe.trim().length > 0 },
    {
      id: "profile-currently",
      label: "Currently",
      done: CURRENTLY_FIELDS.some((field) => draft[field.key].trim().length > 0),
    },
    { id: "profile-listening", label: "Listening to", done: Boolean(draft.songTitle.trim()) || isSpotifyLink(draft.spotifyUrl) },
    {
      id: "profile-info",
      label: "Info",
      done: programmeDone && draft.graduationYear.trim().length > 0 && draft.university.trim().length > 0,
    },
    { id: "profile-social", label: "Social links", done: links.length > 0 && links.every(isWebUrl) },
  ];
}

function CompleteMark({ show }: { show: boolean }) {
  if (!show) return null;
  return <Check className="h-3.5 w-3.5 text-secondary-gray" aria-label="Complete" />;
}

function focusProfileSection(id: string) {
  const node = document.getElementById(id);
  if (!node) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  node.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  const fields = [...node.querySelectorAll<HTMLElement>("input, textarea, select")];
  const empty = fields.find((field) => "value" in field && typeof field.value === "string" && !field.value.trim());
  const target = empty ?? fields[0] ?? node.querySelector<HTMLElement>("button");
  window.setTimeout(() => target?.focus({ preventScroll: true }), reduce ? 0 : 350);
}

export default function MemberPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const isPreview = slug === "preview";
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const updateProfile = useUpdateMemberProfile();
  const addTeam = useAddMyTeamEntry();
  const removeTeam = useRemoveMyTeamEntry();
  const { data, isLoading, isError } = usePublicProfile(isPreview ? "" : slug);
  const source = isPreview ? PREVIEW_PROFILE : data;
  const isOwner = Boolean(
    !isPreview &&
      isAuthenticated &&
      user &&
      data &&
      (user.slug === data.slug || user.slug === slug || user.userId === slug),
  );
  const canEdit = isPreview || isOwner;
  const [draft, setDraft] = useState<PreviewDraft | null>(null);
  const draftRef = useRef<PreviewDraft | null>(null);
  const savedDraft = useRef<PreviewDraft | null>(null);
  const pictureInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const localTeamId = useRef(0);
  const [dashboardTab, setDashboardTab] = useState<"profile" | "projects">("profile");
  const [saving, setSaving] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [otherProgramme, setOtherProgramme] = useState(false);
  const [newTeamEntry, setNewTeamEntry] = useState({ role: "", department: "", academicYear: "" });
  const profile = source && draft && canEdit ? withPreviewDraft(source, draft) : source;
  const [textMask, setTextMask] = useState<string | undefined>(undefined);

  const loadKey = isPreview ? "preview" : isOwner && data ? data.slug || slug : "";
  const [loadedFor, setLoadedFor] = useState("");
  if (loadKey && loadedFor !== loadKey) {
    const loaded = isPreview || !data
      ? mergePreviewDraft(draftFromProfile(PREVIEW_PROFILE), loadPreviewDraft())
      : draftForMember(data, user?.userId);
    setLoadedFor(loadKey);
    setDraft(loaded);
  }

  const snapshottedFor = useRef("");
  useEffect(() => {
    if (!draft || loadedFor !== loadKey || snapshottedFor.current === loadKey) return;
    snapshottedFor.current = loadKey;
    draftRef.current = draft;
    savedDraft.current = draft;
  }, [draft, loadedFor, loadKey]);
  useEffect(() => {
    if (!profile?.firstName) return;

    const canvas = document.createElement("canvas");
    canvas.width = 1400;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "bold 200px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(profile.firstName.toUpperCase(), canvas.width / 2, canvas.height * 0.32);

    const dataUrl = canvas.toDataURL("image/png");
    requestAnimationFrame(() => setTextMask(dataUrl));
  }, [profile?.firstName]);

  const getInitials = (first: string, last: string) =>
    `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();

  const touches = !profile
    ? EMPTY_TOUCHES
    : draft
      ? {
          askMeAbout: draft.askMeAbout,
          outsideStudies: draft.outsideStudies,
          currentlyBuilding: draft.currentlyBuilding,
          currentlyReading: draft.currentlyReading,
          currentlyLearning: draft.currentlyLearning,
          spotifyUrl: draft.spotifyUrl,
          songId: draft.songId,
          songTitle: draft.songTitle,
          songArtist: draft.songArtist,
          songImage: draft.songImage,
          songHref: draft.songHref,
        }
      : personalityFor(profile);
  const picked = songFromFields(touches);
  const legacySong = useSpotifySong(picked ? "" : touches.spotifyUrl);
  const song: DisplaySong | null = picked
    ? { href: picked.href, title: picked.title, artist: picked.artist, image: picked.image }
    : legacySong;

  if (!isPreview && isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-secondary-black font-medium">Loading profile...</p>
      </div>
    );
  }

  if (!profile || (!isPreview && isError)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-secondary-black">Member not found</h1>
          <p className="text-secondary-gray mb-8">This profile does not exist or could not be loaded.</p>
          <Button asChild><Link href="/about">Back to About</Link></Button>
        </div>
      </div>
    );
  }

  const pictureUrl = profile.profilePicture
    ? `${API_URL}/profile/picture?id=${profile.profilePicture}`
    : null;

  const timeline = [...(profile.teamHistory ?? [])].sort((a, b) => b.academicYear.localeCompare(a.academicYear));

  function updateDraft(key: Exclude<keyof PreviewDraft, "teamHistory">, value: string) {
    setDraft((current) => {
      const base = current ?? draftRef.current;
      if (!base) return current;
      const next = { ...base, [key]: value };
      draftRef.current = next;
      return next;
    });
  }

  function updateDraftSong(pickedSong: ProfileSong) {
    setDraft((current) => {
      const base = current ?? draftRef.current;
      if (!base) return current;
      const next = {
        ...base,
        songId: pickedSong.id,
        songTitle: pickedSong.title,
        songArtist: pickedSong.artist,
        songImage: pickedSong.image,
        songHref: pickedSong.href,
        spotifyUrl: "",
      };
      draftRef.current = next;
      return next;
    });
  }

  async function saveProfile() {
    const current = draftRef.current;
    if (!current || saving) return;
    if (isPreview) {
      const next = { ...current };
      savePreviewDraft(next);
      savedDraft.current = next;
      draftRef.current = next;
      setDraft(next);
      setNewTeamEntry({ role: "", department: "", academicYear: "" });
      setDashboardTab("profile");
      setEditing(false);
      toast.success("Changes saved");
      return;
    }
    if (!isOwner || !user?.email || !data) {
      toast.error("Could not save profile", { description: "Sign in again and try once more." });
      return;
    }
    if (!current.firstName.trim() || !current.lastName.trim()) {
      toast.error("Please enter your first and last name");
      return;
    }

    const profileTouches: ProfileTouches = {
      askMeAbout: current.askMeAbout.trim(),
      outsideStudies: current.outsideStudies.trim(),
      currentlyBuilding: current.currentlyBuilding.trim(),
      currentlyReading: current.currentlyReading.trim(),
      currentlyLearning: current.currentlyLearning.trim(),
      currentlyExploring: current.currentlyExploring.trim(),
      spotifyUrl: current.songTitle.trim() ? "" : current.spotifyUrl.trim(),
      songId: current.songId.trim(),
      songTitle: current.songTitle.trim(),
      songArtist: current.songArtist.trim(),
      songImage: current.songImage.trim(),
      songHref: current.songHref.trim(),
    };
    const previousTeams = savedDraft.current?.teamHistory ?? [];
    const nextIds = new Set(current.teamHistory.map((entry) => entry.id));
    const previousIds = new Set(previousTeams.map((entry) => entry.id));

    setSaving(true);
    try {
      await updateProfile.mutateAsync({
        firstName: current.firstName.trim(),
        lastName: current.lastName.trim(),
        email: user.email,
        university: current.university.trim(),
        programme: current.programme.trim() || undefined,
        graduationYear: Number.parseInt(current.graduationYear, 10) || undefined,
        githubLink: current.githubLink.trim(),
        linkedinLink: current.linkedinLink.trim(),
        aboutMe: current.aboutMe.trim(),
        askMeAbout: profileTouches.askMeAbout,
        outsideStudies: profileTouches.outsideStudies,
        currentlyBuilding: profileTouches.currentlyBuilding,
        currentlyLearning: profileTouches.currentlyLearning,
        currentlyReading: profileTouches.currentlyReading,
        songId: profileTouches.songId,
        songTitle: profileTouches.songTitle,
        songArtist: profileTouches.songArtist,
        songImage: profileTouches.songImage,
        songHref: profileTouches.songHref,
      });
      saveTouches(data.slug || slug, profileTouches);
      if (user.userId) saveTouches(user.userId, profileTouches);
      await Promise.all(
        previousTeams
          .filter((entry) => !nextIds.has(entry.id))
          .map((entry) => removeTeam.mutateAsync(entry.id)),
      );
      await Promise.all(
        current.teamHistory
          .filter((entry) => !previousIds.has(entry.id))
          .map((entry) =>
            addTeam.mutateAsync({
              role: entry.role,
              department: entry.department,
              academicYear: entry.academicYear,
            }),
          ),
      );

      await queryClient.invalidateQueries({ queryKey: ["public-profile", slug] });
      const refreshed = queryClient.getQueryData<PublicProfile>(["public-profile", slug]);
      const next = refreshed ? draftForMember(refreshed, user.userId) : { ...current };
      savedDraft.current = next;
      draftRef.current = next;
      setDraft(next);
      setNewTeamEntry({ role: "", department: "", academicYear: "" });
      setDashboardTab("profile");
      setEditing(false);
      toast.success("Changes saved");
    } catch {
      toast.error("Could not save profile", { description: "Please try again in a moment." });
    } finally {
      setSaving(false);
    }
  }

  async function uploadPicture(file: File) {
    setUploadingPicture(true);
    try {
      const body = new FormData();
      body.append("picture", file);
      const res = await fetch(`${API_URL}/profile/picture`, {
        method: "POST",
        credentials: "include",
        body,
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(err?.error || "Upload failed");
      }
      await queryClient.invalidateQueries({ queryKey: ["public-profile", slug] });
      toast.success("Profile picture updated");
    } catch (err) {
      toast.error("Upload failed", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setUploadingPicture(false);
    }
  }

  function cancelEdit() {
    if (savedDraft.current) {
      const restored = { ...savedDraft.current };
      draftRef.current = restored;
      setDraft(restored);
    }
    setOtherProgramme(false);
    setNewTeamEntry({ role: "", department: "", academicYear: "" });
    setDashboardTab("profile");
    setEditing(false);
  }

  function setTeamHistory(teamHistory: PreviewDraft["teamHistory"]) {
    setDraft((current) => {
      const base = current ?? draftRef.current;
      if (!base) return current;
      const next = { ...base, teamHistory };
      draftRef.current = next;
      return next;
    });
  }

  function addTeamEntry() {
    if (!newTeamEntry.academicYear || !newTeamEntry.department) return;
    const current = draftRef.current;
    if (!current) return;
    localTeamId.current -= 1;
    setTeamHistory([
      ...current.teamHistory,
      {
        id: localTeamId.current,
        role: newTeamEntry.role.trim(),
        department: newTeamEntry.department,
        academicYear: newTeamEntry.academicYear,
      },
    ]);
    setNewTeamEntry({ role: "", department: "", academicYear: "" });
  }

  function currentlyValue(key: (typeof CURRENTLY_FIELDS)[number]["key"]) {
    if (draft) return draft[key];
    const value = touches[key];
    return typeof value === "string" ? value : "";
  }

  const showGetToKnowMe =
    CURRENTLY_FIELDS.some((field) => currentlyValue(field.key)) ||
    Boolean(touches.askMeAbout.trim() || touches.outsideStudies.trim()) ||
    Boolean(song) ||
    editing;
  const completion = editing && draft
    ? profileCompletion(draft, { otherProgramme })
    : [];
  const completionPercent = completion.length
    ? Math.round((completion.filter((section) => section.done).length / completion.length) * 100)
    : 0;
  const nextSection = completion.find((section) => !section.done);
  const sectionDone = (id: string) => completion.some((section) => section.id === id && section.done);

  const avatar = (
    <div className="relative flex aspect-square h-full w-full items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-primary/10 text-3xl font-semibold text-primary shadow-md md:text-5xl">
      {pictureUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- per-user backend image
        <img src={pictureUrl} alt={`${profile.firstName} ${profile.lastName}`} className="h-full w-full object-cover" />
      ) : (
        getInitials(profile.firstName, profile.lastName)
      )}
      {isOwner && editing ? (
        <button
          type="button"
          className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity hover:opacity-100"
          aria-label="Upload profile picture"
          disabled={uploadingPicture}
          onClick={() => pictureInputRef.current?.click()}
        >
          {uploadingPicture ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
        </button>
      ) : null}
    </div>
  );

  const listeningSection = song || editing ? (
    <div id="profile-listening" className="scroll-mt-32 space-y-3">
      <style>{`
        @keyframes cd-spin {
          to { transform: rotate(360deg); }
        }
        .cd-disc {
          transform-origin: center;
          animation: cd-spin 2.8s linear infinite;
          animation-play-state: paused;
        }
        [class~="group/jewel"]:hover .cd-disc { animation-play-state: running; }
        @media (prefers-reduced-motion: reduce) {
          .cd-disc { animation: none; }
        }
        @keyframes cd-laser {
          0%, 100% { opacity: 0.45; }
          50% { opacity: 1; }
        }
        .cd-laser { animation: cd-laser 1.4s ease-in-out infinite; }
      `}</style>
      <h4 className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-secondary-gray">
        Listening to
        <CompleteMark show={sectionDone("profile-listening")} />
      </h4>
      {editing && draft ? <SongSearch onSelect={updateDraftSong} /> : null}
      {song ? <JewelCasePlayer song={song} /> : null}
    </div>
  ) : null;

  const socialLinks = (editing && draft) || profile.githubLink || profile.linkedinLink ? (
    <div id="profile-social" className="scroll-mt-32 space-y-3">
      {editing && draft ? (
        <div className="space-y-2">
          <h4 className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-secondary-gray">
            Social links
            <CompleteMark show={sectionDone("profile-social")} />
          </h4>
          <Input value={draft.githubLink} onChange={(e) => updateDraft("githubLink", e.target.value)} placeholder="GitHub link" aria-label="GitHub link" />
          <Input value={draft.linkedinLink} onChange={(e) => updateDraft("linkedinLink", e.target.value)} placeholder="LinkedIn link" aria-label="LinkedIn link" />
        </div>
      ) : null}
      {!editing && (profile.githubLink || profile.linkedinLink) ? (
        <div className="flex flex-wrap gap-2">
          {profile.githubLink ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={profile.githubLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <FaGithub className="h-4 w-4" />
                GitHub
              </Link>
            </Button>
          ) : null}
          {profile.linkedinLink ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={profile.linkedinLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <FaLinkedin className="h-4 w-4" />
                LinkedIn
              </Link>
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  ) : null;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative bg-white text-secondary-black pt-64 pb-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <AsciiGrid
            color="rgba(0, 0, 0, 0.2)"
            cellSize={12}
            logoSrc={textMask}
            logoPosition="center"
            logoScale={1}
            enableDripping={false}
            className="h-full w-full"
          />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-white via-white/50 to-transparent pointer-events-none" />
        </div>

        <div className="container relative z-10 mx-auto max-w-7xl pb-8 pl-4 md:pl-6">
          <div className="h-12 md:h-[4.5rem]" />
        </div>
      </section>

      {/* Content */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-8 xl:px-8">
        <section className="relative max-w-7xl mx-auto z-20 -mt-24 mb-24 rounded-3xl border bg-neutral-50 px-4 pt-24 pb-4 shadow-lg md:px-8 md:pt-36 md:pb-8">
            <div className="absolute top-0 left-4 z-30 flex -translate-y-[calc(100%+0.5rem)] items-end gap-6 md:left-8">
              <div className="size-32 shrink-0 translate-y-[calc(50%+0.5rem)] md:size-56">{avatar}</div>
              <h1 className="text-5xl md:text-7xl font-base tracking-tighter">
                {profile.firstName} {profile.lastName}
              </h1>
            </div>
          <div className="mb-8 flex items-center">
            <Link href="/" className="text-secondary-gray hover:text-primary transition-colors text-sm font-medium">Home</Link>
            <span className="text-gray-300 mx-2">/</span>
            <Link href="/about" className="text-secondary-gray hover:text-primary transition-colors text-sm font-medium">About</Link>
            <span className="text-gray-300 mx-2">/</span>
            <span className="text-primary font-medium text-sm truncate">
              {profile.firstName} {profile.lastName}
            </span>
            {canEdit && (!editing || dashboardTab === "profile") ? (
              <div className="ml-auto flex items-center gap-2">
                {editing ? (
                  <>
                    <Button type="button" variant="outline" size="sm" onClick={cancelEdit} disabled={saving}>
                      Cancel
                    </Button>
                    <Button type="button" size="sm" onClick={saveProfile} disabled={!draft || saving}>
                      {saving ? "Saving..." : "Save profile"}
                    </Button>
                  </>
                ) : (
                  <Button type="button" variant="outline" size="sm" onClick={() => setEditing(true)} disabled={!draft}>
                    Edit profile
                  </Button>
                )}
              </div>
            ) : null}
            {isOwner ? (
              <input
                ref={pictureInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) void uploadPicture(file);
                }}
              />
            ) : null}
          </div>

          {canEdit && editing ? (
            <Tabs value={dashboardTab} onValueChange={(value) => setDashboardTab(value === "projects" ? "projects" : "profile")} className="mb-8">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="projects" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Projects
                </TabsTrigger>
              </TabsList>
            </Tabs>
          ) : null}

          {canEdit && editing && dashboardTab === "projects" ? (
            <MemberProjectSelection />
          ) : (
          <>
          {editing && draft ? (
            <div className="sticky top-24 z-30 -mx-4 mb-6 border-b border-border bg-neutral-50/95 px-4 py-3 backdrop-blur-sm md:-mx-8 md:px-8">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <p className="text-sm font-medium tabular-nums text-primary">{completionPercent}%</p>
                <div
                  className="order-last h-1.5 w-full overflow-hidden rounded-full bg-primary/15 sm:order-none sm:w-auto sm:flex-1"
                  role="progressbar"
                  aria-valuenow={completionPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Profile completion"
                >
                  <div
                    className="h-full rounded-full bg-primary motion-safe:transition-[width] motion-safe:duration-300"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
                {nextSection ? (
                  <button
                    type="button"
                    onClick={() => focusProfileSection(nextSection.id)}
                    className="shrink-0 rounded-full bg-primary px-3 py-1 text-xs font-medium text-white"
                  >
                    Next: {nextSection.label}
                  </button>
                ) : (
                  <p className="shrink-0 text-xs text-secondary-gray">Ready to save</p>
                )}
              </div>
            </div>
          ) : null}

          {socialLinks ? (
            <div className="mb-8 flex flex-wrap items-center justify-end gap-4">
              <div className={editing ? "w-full max-w-sm" : ""}>{socialLinks}</div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="space-y-8">
              {editing && draft ? (
                <div id="profile-name" className="scroll-mt-32 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input value={draft.firstName} onChange={(e) => updateDraft("firstName", e.target.value)} placeholder="First name" aria-label="First name" />
                  <Input value={draft.lastName} onChange={(e) => updateDraft("lastName", e.target.value)} placeholder="Last name" aria-label="Last name" />
                </div>
              ) : null}
              {(profile.aboutMe || editing) && (
                <div id="profile-bio" className="scroll-mt-32">
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-medium text-secondary-black">
                    About
                    <CompleteMark show={sectionDone("profile-bio")} />
                  </h3>
                  {editing && draft ? (
                    <Textarea value={draft.aboutMe} onChange={(e) => updateDraft("aboutMe", e.target.value)} placeholder="Write a short bio" className="min-h-28 font-serif" />
                  ) : (
                    <p className="text-secondary-black/80 leading-relaxed font-serif">{profile.aboutMe}</p>
                  )}
                  </div>
              )}

              {showGetToKnowMe ? (
                <>
                  <Separator />
                  <div className="space-y-5">
                    {CURRENTLY_FIELDS.some((field) => currentlyValue(field.key)) || editing ? (
                      <div id="profile-currently" className={`scroll-mt-32 space-y-3 ${editing && draft ? "" : "border-l-2 border-primary pl-4"}`}>
                        <h4 className={`flex items-center gap-2 text-xs font-mono uppercase tracking-widest ${editing && draft ? "text-secondary-gray" : "text-primary"}`}>
                          Currently
                          <CompleteMark show={sectionDone("profile-currently")} />
                        </h4>
                        {editing && draft ? (
                  <div>
                            <p className="mb-3 font-serif text-sm text-secondary-gray">Fill in whichever rows apply - leave the rest blank.</p>
                            <div className="border-y border-secondary-light-gray/70">
                              {CURRENTLY_FIELDS.map((field) => (
                                <div key={field.key} className="grid grid-cols-[8.5rem_minmax(0,1fr)] items-center gap-4 border-b border-secondary-light-gray/70 py-3 last:border-b-0">
                                  <label htmlFor={`currently-${field.key}`} className="font-serif text-base text-primary">{field.label}:</label>
                                  <input
                                    id={`currently-${field.key}`}
                                    value={draft[field.key]}
                                    maxLength={80}
                                    placeholder={field.placeholder}
                                    onChange={(e) => updateDraft(field.key, e.target.value)}
                                    className="w-full bg-transparent font-serif text-base leading-relaxed text-secondary-black/80 outline-none placeholder:text-secondary-gray/70"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {CURRENTLY_FIELDS.map((field) => {
                              const value = currentlyValue(field.key);
                              if (!value) return null;
                              return (
                                <p key={field.key} className="font-serif leading-relaxed text-secondary-black/80">
                                  <span className="text-primary">{field.label}</span> {value}
                                </p>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : null}
                    {editing || touches.askMeAbout.trim() || touches.outsideStudies.trim() ? (
                      <>
                        <Separator />
                        <div className="space-y-5">
                          <h3 className="text-lg font-medium text-secondary-black">Get to know me</h3>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {PROMPT_FIELDS.map((field) => {
                              const value = (editing && draft ? draft[field.key] : touches[field.key]).trim();
                              if (!value && !editing) return null;
                              return (
                                <div key={field.key} className="rounded-2xl border border-secondary-light-gray/70 bg-white px-5 py-4">
                                  <p className="text-sm text-primary">{field.label}</p>
                                  {editing && draft ? (
                                    <Textarea value={draft[field.key]} onChange={(e) => updateDraft(field.key, e.target.value)} aria-label={field.label} className="mt-2 min-h-16 resize-none border-0 bg-transparent p-0 font-serif text-lg leading-relaxed shadow-none focus-visible:ring-0" />
                                  ) : (
                                    <p className="mt-2 font-serif text-lg leading-relaxed text-secondary-black/80">{value}</p>
                                )}
                              </div>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>
                </>
              ) : null}

              {/* Team history */}
              {timeline.length > 0 || editing ? (
                <>
                  <Separator />
                  <div id="profile-team" className="scroll-mt-32">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-secondary-black">
                      Team history
                      <CompleteMark show={sectionDone("profile-team")} />
                    </h3>
                    {timeline.length > 0 ? (
                      <ol className="space-y-6 border-l border-border">
                        {timeline.map((entry, index) => (
                          <li key={entry.id} className="relative pl-6">
                            <span
                              className={`absolute top-1 left-0 size-2.5 -translate-x-1/2 rounded-full ${index === 0 ? "bg-primary" : "border-2 border-primary bg-neutral-50"}`}
                              aria-hidden
                            />
                            <p className="text-xs font-mono text-secondary-gray">{entry.academicYear}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className="font-mono text-xs shrink-0">{entry.department}</Badge>
                              {entry.role ? <span className="text-sm text-secondary-black">{entry.role}</span> : null}
                              {editing ? (
                                <button
                                  type="button"
                                  className="ml-auto text-secondary-gray hover:text-secondary-black"
                                  aria-label={`Remove ${entry.department} ${entry.academicYear}`}
                                  onClick={() => setTeamHistory((draftRef.current?.teamHistory ?? []).filter((item) => item.id !== entry.id))}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              ) : null}
                            </div>
                          </li>
                        ))}
                      </ol>
                    ) : null}
                    {editing && draft ? (
                      <div className={timeline.length > 0 ? "mt-6 space-y-3" : "space-y-3"}>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <div className="space-y-1">
                            <p className="text-xs text-secondary-gray">Academic year</p>
                            <NativeSelect className="w-full" aria-label="Academic year" value={newTeamEntry.academicYear} onChange={(e) => setNewTeamEntry((prev) => ({ ...prev, academicYear: e.target.value }))}>
                              <NativeSelectOption value="">Select year</NativeSelectOption>
                              {ACADEMIC_YEARS.map((year) => (
                                <NativeSelectOption key={year} value={year}>{year}</NativeSelectOption>
                              ))}
                            </NativeSelect>
                              </div>
                          <div className="space-y-1">
                            <p className="text-xs text-secondary-gray">Team</p>
                            <NativeSelect className="w-full" aria-label="Team" value={newTeamEntry.department} onChange={(e) => setNewTeamEntry((prev) => ({ ...prev, department: e.target.value }))}>
                              <NativeSelectOption value="">Select team</NativeSelectOption>
                              {TEAMS.map((team) => (
                                <NativeSelectOption key={team} value={team}>{team}</NativeSelectOption>
                              ))}
                            </NativeSelect>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-secondary-gray">Role (optional)</p>
                            <Input
                              aria-label="Role"
                              placeholder="e.g. President"
                              value={newTeamEntry.role}
                              onChange={(e) => setNewTeamEntry((prev) => ({ ...prev, role: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && newTeamEntry.academicYear && newTeamEntry.department) {
                                  e.preventDefault();
                                  addTeamEntry();
                                }
                              }}
                            />
                          </div>
                        </div>
                        <Button type="button" variant="outline" size="sm" disabled={!newTeamEntry.academicYear || !newTeamEntry.department} onClick={addTeamEntry}>
                          <Plus className="h-4 w-4" />
                          Add entry
                        </Button>
                    </div>
                    ) : null}
                  </div>
                </>
              ) : null}
            </div>

            {/* Sidebar */}
            <div>
              <div className={`md:sticky space-y-5 ${editing ? "md:top-36" : "md:top-20"}`}>
                {profile.university || profile.programme || profile.graduationYear || editing ? (
                <div id="profile-info" className="scroll-mt-32 rounded-xl border border-secondary-light-gray/60 bg-white p-4">
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-secondary-gray">
                      Info
                      <CompleteMark show={sectionDone("profile-info")} />
                    </h4>
                    {profile.programme || editing ? (
                    <div>
                      <p className="text-xs text-secondary-gray">Programme</p>
                        {editing && draft ? (
                          <>
                            <ProgrammeSelect
                              id="preview-programme"
                              label=""
                              value={otherProgramme ? OTHER_PROGRAMME_VALUE : draft.programme}
                              onValueChange={(value) => {
                                if (value === OTHER_PROGRAMME_VALUE) {
                                  setOtherProgramme(true);
                                  return;
                                }
                                setOtherProgramme(false);
                                updateDraft("programme", value);
                              }}
                              placeholder="Select your programme"
                              customOptions={[OTHER_PROGRAMME_VALUE]}
                            />
                            {otherProgramme ? (
                              <Input value={draft.programme} onChange={(e) => updateDraft("programme", e.target.value)} placeholder="Your programme or degree" aria-label="Programme or degree" className="mt-2" />
                            ) : null}
                          </>
                        ) : (
                      <p className="text-sm font-medium text-secondary-black">{profile.programme}</p>
                        )}
                    </div>
                    ) : null}
                    {profile.graduationYear || editing ? (
                      <div>
                        <p className="text-xs text-secondary-gray">Graduation</p>
                        {editing && draft ? (
                          <NativeSelect className="w-full" aria-label="Graduation year" value={draft.graduationYear} onChange={(e) => updateDraft("graduationYear", e.target.value)}>
                            <NativeSelectOption value="">Not set</NativeSelectOption>
                            {graduationYearOptions(draft.graduationYear).map((year) => (
                              <NativeSelectOption key={year} value={year}>{year}</NativeSelectOption>
                            ))}
                          </NativeSelect>
                        ) : (
                        <p className="text-sm font-medium text-secondary-black">{profile.graduationYear}</p>
                        )}
                      </div>
                    ) : null}
                    {profile.university || editing ? (
                      <div>
                        <p className="text-xs text-secondary-gray">University</p>
                        {editing && draft ? (
                          <>
                            <NativeSelect
                              className="w-full"
                              aria-label="University"
                              value={(KNOWN_UNIVERSITIES as readonly string[]).includes(draft.university) ? draft.university : OTHER_UNIVERSITY_VALUE}
                              onChange={(e) => {
                                const next = e.target.value;
                                if (next === OTHER_UNIVERSITY_VALUE) {
                                  if ((KNOWN_UNIVERSITIES as readonly string[]).includes(draft.university)) updateDraft("university", "");
                                  return;
                                }
                                updateDraft("university", next);
                              }}
                            >
                              {UNIVERSITIES.map((uni) => (
                                <NativeSelectOption key={uni} value={uni}>{uni}</NativeSelectOption>
                              ))}
                            </NativeSelect>
                            {(KNOWN_UNIVERSITIES as readonly string[]).includes(draft.university) ? null : (
                              <Input value={draft.university} onChange={(e) => updateDraft("university", e.target.value)} placeholder="Enter your university" aria-label="Other university" className="mt-2" />
                            )}
                          </>
                        ) : (
                        <p className="text-sm font-medium text-secondary-black">{profile.university}</p>
                        )}
                      </div>
                    ) : null}
                  </div>
              </div>
                ) : null}
                {listeningSection}
              </div>
            </div>
          </div>
          </>
          )}
        </section>
      </div>
    </div>
  );
}


