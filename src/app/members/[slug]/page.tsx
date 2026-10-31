"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Loader2, ChevronRight, BookOpen, Compass, GraduationCap, Hammer, Pause, Play, Plus, X } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AsciiGrid } from "@/components/ui/ascii-grid";
import { usePublicProfile, type PublicProfile } from "@/hooks/team";
import { API_URL } from "@/config";
import { EMPTY_TOUCHES, loadPreviewDraft, loadTouches, savePreviewDraft, spotifyUrlFrom, type PreviewDraft, type ProfileTouches } from "@/lib/profile-touches";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { ProgrammeSelect } from "@/components/member/programme-select";
import { OTHER_PROGRAMME_VALUE, OTHER_UNIVERSITY_VALUE, UNIVERSITIES } from "@/types/applications";

const CURRENTLY_FIELDS = [
  { key: "currentlyBuilding", label: "Building", icon: Hammer },
  { key: "currentlyReading", label: "Reading", icon: BookOpen },
  { key: "currentlyLearning", label: "Learning", icon: GraduationCap },
  { key: "currentlyExploring", label: "Exploring", icon: Compass },
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
    currentlyReading: draft.currentlyReading,
    spotifyUrl: draft.spotifyUrl,
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
    currentlyLearning: "",
    currentlyExploring: "",
    spotifyUrl: profile.spotifyUrl || "",
  };
}

function mergePreviewDraft(base: PreviewDraft, stored: PreviewDraft | null): PreviewDraft {
  if (!stored) return base;
  const next = { ...base };
  (Object.keys(base) as (keyof PreviewDraft)[]).forEach((key) => {
    if (typeof stored[key] === "string") next[key] = stored[key];
  });
  return next;
}
function personalityFor(profile: PublicProfile, routeSlug: string): ProfileTouches {
  const stored = loadTouches(profile.slug || routeSlug);
  return {
    askMeAbout: profile.askMeAbout || stored?.askMeAbout || "",
    outsideStudies: profile.outsideStudies || stored?.outsideStudies || "",
    currentlyBuilding: profile.currentlyBuilding || stored?.currentlyBuilding || "",
    currentlyReading: profile.currentlyReading || stored?.currentlyReading || "",
    spotifyUrl: spotifyUrlFrom(profile) || (stored ? spotifyUrlFrom(stored) : ""),
  };
}

type SpotifySong = { href: string; title: string; artist: string; image: string; preview: string };

function useSpotifySong(url: string) {
  const [song, setSong] = useState<SpotifySong | null>(null);

  useEffect(() => {
    const trimmed = url.trim();
    if (!trimmed) {
      setSong(null);
      return;
    }

    let cancelled = false;
    fetch(`/api/spotify?url=${encodeURIComponent(trimmed)}`)
      .then(async (res) => (res.ok ? ((await res.json()) as SpotifySong) : null))
      .then((data) => {
        if (cancelled) return;
        setSong(data?.title && data.image ? data : null);
      })
      .catch(() => {
        if (!cancelled) setSong(null);
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return song;
}

const WAVE_BARS = 5;
const WAVE_DIGITS = "31415926535897932384626433";
const loudnessGraphs = new WeakMap<HTMLAudioElement, AnalyserNode>();

function attachLoudness(audio: HTMLAudioElement) {
  let analyser = loudnessGraphs.get(audio);
  if (!analyser) {
    const context = new AudioContext();
    const source = context.createMediaElementSource(audio);
    analyser = context.createAnalyser();
    analyser.fftSize = 64;
    source.connect(analyser);
    analyser.connect(context.destination);
    loudnessGraphs.set(audio, analyser);
  }
  void analyser.context.resume();
}

function PlayingWave({ audio }: { audio: HTMLAudioElement | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const analyser = audio ? loudnessGraphs.get(audio) : null;
    if (!audio || !analyser) return;

    const canvas = canvasRef.current;
    const pen = canvas?.getContext("2d");
    if (!canvas || !pen) return;
    const bins = new Uint8Array(analyser.frequencyBinCount);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let raf = 0;

    const draw = () => {
      analyser.getByteFrequencyData(bins);
      pen.clearRect(0, 0, canvas.width, canvas.height);
      pen.font = "9px ui-monospace, monospace";
      pen.textAlign = "center";
      pen.textBaseline = "middle";
      pen.fillStyle = "#1751A6";
      const step = Math.max(1, Math.floor(bins.length / WAVE_BARS));
      for (let i = 0; i < WAVE_BARS; i += 1) {
        const rows = 1 + Math.round((bins[i * step] / 255) * 4);
        for (let row = 0; row < rows; row += 1) {
          const digit = WAVE_DIGITS[(i * 3 + row + (reduce ? 0 : Math.floor(frame / 6))) % WAVE_DIGITS.length];
          pen.globalAlpha = 0.4 + (row / rows) * 0.6;
          pen.fillText(digit, 6 + i * 9, canvas.height - 5 - row * 8);
        }
      }
      frame += 1;
      if (!reduce) raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [audio]);

  return <canvas ref={canvasRef} width={48} height={40} aria-hidden className="mt-1 h-10 w-12" />;
}

export default function MemberPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const isPreview = slug === "preview";
  const { data, isLoading, isError } = usePublicProfile(isPreview ? "" : slug);
  const source = isPreview ? PREVIEW_PROFILE : data;
  const [draft, setDraft] = useState<PreviewDraft | null>(null);
  const [editing, setEditing] = useState(false);
  const [otherProgramme, setOtherProgramme] = useState(false);
  const [addingCurrently, setAddingCurrently] = useState<(typeof CURRENTLY_FIELDS)[number]["key"] | null>(null);
  const [addingText, setAddingText] = useState("");
  const profile = isPreview && draft ? withPreviewDraft(PREVIEW_PROFILE, draft) : source;
  const [textMask, setTextMask] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!isPreview) return;
    setDraft(mergePreviewDraft(draftFromProfile(PREVIEW_PROFILE), loadPreviewDraft()));
  }, [isPreview]);

  useEffect(() => {
    if (!isPreview || !draft) return;
    savePreviewDraft(draft);
  }, [draft, isPreview]);

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
    : isPreview && draft
      ? {
          askMeAbout: draft.askMeAbout,
          outsideStudies: draft.outsideStudies,
          currentlyBuilding: draft.currentlyBuilding,
          currentlyReading: draft.currentlyReading,
          spotifyUrl: draft.spotifyUrl,
        }
      : personalityFor(profile, slug);
  const song = useSpotifySong(touches.spotifyUrl);
  const previewRef = useRef<HTMLAudioElement>(null);
  const [previewPlaying, setPreviewPlaying] = useState(false);

  useEffect(() => {
    setPreviewPlaying(false);
    previewRef.current?.pause();
  }, [song?.preview]);

  function togglePreview() {
    const audio = previewRef.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      setPreviewPlaying(false);
      return;
    }
    attachLoudness(audio);
    void audio.play().then(() => setPreviewPlaying(true)).catch(() => setPreviewPlaying(false));
  }

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

  // Group team history by year
  const historyByYear = (profile.teamHistory ?? []).reduce<
    Record<string, { role: string; department: string; id: number }[]>
  >((acc, entry) => {
    const year = entry.academicYear || "Unknown";
    if (!acc[year]) acc[year] = [];
    acc[year].push(entry);
    return acc;
  }, {});

  const sortedYears = Object.keys(historyByYear).sort().reverse();
  const prompts = [
    { key: "askMeAbout" as const, label: "Ask me about…", value: touches.askMeAbout },
    { key: "outsideStudies" as const, label: "Outside of studies you'll find me…", value: touches.outsideStudies },
  ].filter((prompt) => editing || prompt.value);

  function updateDraft(key: keyof PreviewDraft, value: string) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  function currentlyValue(key: (typeof CURRENTLY_FIELDS)[number]["key"]) {
    if (draft) return draft[key];
    if (key === "currentlyBuilding" || key === "currentlyReading") return touches[key];
    return "";
  }

  function commitCurrently(key: (typeof CURRENTLY_FIELDS)[number]["key"], value: string) {
    const next = value.trim().slice(0, 80);
    if (next) updateDraft(key, next);
    setAddingCurrently(null);
    setAddingText("");
  }

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

        <div className="container relative z-10 mx-auto max-w-7xl pb-8 pl-4 pr-40 md:pl-6 md:pr-72">
          <h1 className="text-5xl md:text-7xl font-base tracking-tighter">
            {profile.firstName} {profile.lastName}
          </h1>
        </div>
      </section>

      {/* Content */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-8 xl:px-8">
        <section className="relative max-w-7xl mx-auto z-20 -mt-24 bg-neutral-50 rounded-3xl p-4 md:p-8 mb-24 shadow-lg border">
          <div className="absolute right-4 bottom-full z-30 mb-4 md:right-8">
            <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-primary/10 shadow-md md:h-56 md:w-56">
              {pictureUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- per-user backend image
                <img
                  src={pictureUrl}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-primary md:text-5xl">
                  {getInitials(profile.firstName, profile.lastName)}
                </div>
              )}
            </div>
          </div>
          {/* Breadcrumb */}
          <div className="mb-8 flex items-center">
            <Link href="/" className="text-secondary-gray hover:text-primary transition-colors text-sm font-medium">Home</Link>
            <span className="text-gray-300 mx-2">/</span>
            <Link href="/about" className="text-secondary-gray hover:text-primary transition-colors text-sm font-medium">About</Link>
            <span className="text-gray-300 mx-2">/</span>
            <span className="text-primary font-medium text-sm truncate">
              {profile.firstName} {profile.lastName}
            </span>
            {isPreview ? (
              <Button type="button" variant="outline" size="sm" className="ml-auto" onClick={() => setEditing((current) => !current)} disabled={!draft}>
                {editing ? "Done" : "Edit"}
              </Button>
            ) : null}
          </div>

          <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="space-y-8">
              {editing && draft ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input value={draft.firstName} onChange={(e) => updateDraft("firstName", e.target.value)} placeholder="First name" aria-label="First name" />
                  <Input value={draft.lastName} onChange={(e) => updateDraft("lastName", e.target.value)} placeholder="Last name" aria-label="Last name" />
                </div>
              ) : null}
              {(profile.aboutMe || editing) && (
                <div>
                  <h3 className="text-lg font-medium text-secondary-black mb-3">About</h3>
                  {editing && draft ? (
                    <Textarea value={draft.aboutMe} onChange={(e) => updateDraft("aboutMe", e.target.value)} placeholder="Write a short bio" className="min-h-28 font-serif" />
                  ) : (
                    <p className="text-secondary-black/80 leading-relaxed font-serif">{profile.aboutMe}</p>
                  )}
                </div>
              )}

              {prompts.length > 0 ? (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-medium text-secondary-black mb-4">Get to know me</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {prompts.map((prompt) => (
                        <div key={prompt.label} className="rounded-xl border border-secondary-light-gray/60 bg-white p-4">
                          <p className="text-xs text-secondary-gray mb-2">{prompt.label}</p>
                          {editing && draft ? (
                            <Input value={prompt.value} onChange={(e) => updateDraft(prompt.key, e.target.value)} />
                          ) : (
                            <p className="text-sm font-medium text-secondary-black leading-relaxed">{prompt.value}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}

              {/* Team history */}
              {sortedYears.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-medium text-secondary-black mb-4">Team history</h3>
                    <div className="space-y-4">
                      {sortedYears.map((year) => (
                        <div key={year}>
                          <p className="text-xs font-mono text-secondary-gray mb-2 uppercase tracking-widest">{year}</p>
                          <div className="space-y-2">
                            {historyByYear[year].map((entry) => (
                              <div key={entry.id} className="flex items-center gap-3">
                                <Badge variant="outline" className="font-mono text-xs shrink-0">
                                  {entry.department}
                                </Badge>
                                {entry.role && (
                                  <span className="text-sm text-secondary-black">{entry.role}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Projects */}
              {profile.projects && profile.projects.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-medium text-secondary-black mb-4">Projects</h3>
                    <div className="space-y-3">
                      {profile.projects.map((project) => (
                        <Link
                          key={project.id}
                          href={`/projects/${project.id}`}
                          className="flex items-start gap-3 p-3 rounded-xl border border-secondary-light-gray/60 bg-white hover:border-primary/40 hover:shadow-sm transition-all group"
                        >
                          <ChevronRight className="h-4 w-4 text-primary mt-0.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                          <div>
                            <p className="font-medium text-secondary-black group-hover:text-primary transition-colors">
                              {project.title}
                            </p>
                            {project.oneLineDescription && (
                              <p className="text-sm text-secondary-gray mt-0.5 line-clamp-1">
                                {project.oneLineDescription}
                              </p>
                            )}
                          </div>
                          {project.status && (
                            <Badge variant="secondary" className="ml-auto shrink-0 text-xs font-mono">
                              {project.status}
                            </Badge>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Sidebar */}
            <div>
              <div className="md:sticky md:top-20 space-y-5">
                {profile.university || profile.programme || profile.graduationYear || CURRENTLY_FIELDS.some((field) => currentlyValue(field.key)) || song || editing ? (
                <div className="rounded-xl border border-secondary-light-gray/60 bg-white p-4 space-y-5">
                {profile.university || profile.programme || profile.graduationYear || editing ? (
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono uppercase tracking-widest text-secondary-gray">Info</h4>
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
                ) : null}

                {CURRENTLY_FIELDS.some((field) => currentlyValue(field.key)) || editing ? (
                  <div className={`space-y-3 ${profile.university || profile.programme || profile.graduationYear || editing ? "border-t border-secondary-light-gray/60 pt-4" : ""}`}>
                    <h4 className="text-xs font-mono uppercase tracking-widest text-secondary-gray">Currently</h4>
                    {editing && draft ? (
                      <div className="space-y-2">
                        {CURRENTLY_FIELDS.map((field) => {
                          const value = draft[field.key];
                          const Icon = field.icon;
                          if (!value) return null;
                          return (
                            <span key={field.key} className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
                              <Icon className="h-4 w-4 shrink-0" />
                              <span className="min-w-0 flex-1 truncate">{field.label}: {value}</span>
                              <button type="button" aria-label={`Remove ${field.label}`} className="shrink-0" onClick={() => updateDraft(field.key, "")}>
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </span>
                          );
                        })}
                        <div className="flex flex-wrap gap-2">
                          {CURRENTLY_FIELDS.map((field) => {
                            if (draft[field.key]) return null;
                            const Icon = field.icon;
                            if (addingCurrently === field.key) {
                              return (
                                <input
                                  key={field.key}
                                  autoFocus
                                  aria-label={field.label}
                                  placeholder={field.label}
                                  value={addingText}
                                  onChange={(e) => setAddingText(e.target.value)}
                                  className="h-8 w-full rounded-full border border-dashed border-primary/40 bg-primary/10 px-3 text-sm text-primary outline-none"
                                  onBlur={(e) => {
                                    if (e.currentTarget.dataset.skip) return;
                                    commitCurrently(field.key, e.currentTarget.value);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      commitCurrently(field.key, e.currentTarget.value);
                                    }
                                    if (e.key === "Escape") {
                                      e.currentTarget.dataset.skip = "1";
                                      setAddingCurrently(null);
                                    }
                                  }}
                                />
                              );
                            }
                            return (
                              <button key={field.key} type="button" className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-primary/40 px-3 py-1.5 text-sm text-primary" onClick={() => { setAddingText(""); setAddingCurrently(field.key); }}>
                                <Plus className="h-3.5 w-3.5" />
                                <Icon className="h-4 w-4" />
                                {field.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                    <div className="flex flex-col items-start gap-2">
                      {CURRENTLY_FIELDS.map((field) => {
                        const value = currentlyValue(field.key);
                        if (!value) return null;
                        const Icon = field.icon;
                        return (
                          <span key={field.key} className="inline-flex h-8 max-w-full items-center gap-2 rounded-md border border-border bg-background px-2.5 text-sm font-medium text-secondary-black">
                            <Icon className="h-4 w-4 shrink-0" />
                            <span className="truncate">{field.label}: {value}</span>
                          </span>
                        );
                      })}
                    </div>
                    )}
                  </div>
                ) : null}

                {song || editing ? (
                  <div className={`space-y-3 ${CURRENTLY_FIELDS.some((field) => currentlyValue(field.key)) || editing ? "" : profile.university || profile.programme || profile.graduationYear ? "border-t border-secondary-light-gray/60 pt-4" : ""}`}>
                    <h4 className="text-xs font-mono uppercase tracking-widest text-secondary-gray">Listening to</h4>
                    {editing && draft ? (
                      <Input value={draft.spotifyUrl} onChange={(e) => updateDraft("spotifyUrl", e.target.value)} placeholder="Paste a Spotify song link" aria-label="Spotify link" />
                    ) : null}
                    {song ? (
                    <div className="flex items-center gap-3">
                      {song.preview ? (
                        <button
                          type="button"
                          onClick={togglePreview}
                          aria-label={previewPlaying ? `Pause ${song.title}` : `Play a preview of ${song.title}`}
                          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element -- Spotify album art */}
                          <img src={song.image} alt="" className="h-full w-full object-cover" />
                          <span className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-secondary-black shadow-sm">
                            {previewPlaying ? <Pause className="h-3 w-3 fill-current" /> : <Play className="h-3 w-3 fill-current" />}
                          </span>
                          <audio
                            ref={previewRef}
                            src={song.preview}
                            crossOrigin="anonymous"
                            preload="none"
                            onEnded={() => setPreviewPlaying(false)}
                          />
                        </button>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element -- Spotify album art
                        <img src={song.image} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                      )}
                      <div className="min-w-0">
                        <a href={song.href} target="_blank" rel="noopener noreferrer" className="min-w-0">
                          <p className="text-base font-semibold leading-tight text-secondary-black">{song.title}</p>
                          {song.artist ? (
                            <p className="mt-1 text-sm text-secondary-gray">{song.artist}</p>
                          ) : null}
                        </a>
                        {previewPlaying ? <PlayingWave audio={previewRef.current} /> : null}
                      </div>
                    </div>
                    ) : null}
                  </div>
                ) : null}
                </div>
                ) : null}
                {editing && draft ? (
                  <div className="space-y-2">
                    <Input value={draft.githubLink} onChange={(e) => updateDraft("githubLink", e.target.value)} placeholder="GitHub link" aria-label="GitHub link" />
                    <Input value={draft.linkedinLink} onChange={(e) => updateDraft("linkedinLink", e.target.value)} placeholder="LinkedIn link" aria-label="LinkedIn link" />
                  </div>
                ) : null}
                {profile.githubLink || profile.linkedinLink ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.githubLink ? (
                      <Button variant="outline" asChild>
                        <Link href={profile.githubLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                          <FaGithub className="h-4 w-4" />
                          GitHub
                        </Link>
                      </Button>
                    ) : null}
                    {profile.linkedinLink ? (
                      <Button variant="outline" asChild>
                        <Link href={profile.linkedinLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                          <FaLinkedin className="h-4 w-4" />
                          LinkedIn
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
