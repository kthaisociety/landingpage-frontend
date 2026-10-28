"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Camera,
  Loader2,
  User,
  Plus,
  Trash2,
  Music2,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { ProgrammeSelect } from "@/components/member/programme-select";
import { SpotifyEarwormEmbed } from "@/components/member/spotify-earworm-embed";
import { useMemberProfile, useUpdateMemberProfile } from "@/hooks/member";
import { useAddMyTeamEntry, useRemoveMyTeamEntry } from "@/hooks/team";
import {
  useProfileEarworm,
  useSaveProfileEarworm,
} from "@/hooks/profile-touches";
import { API_URL } from "@/config";
import { ACADEMIC_YEARS } from "@/lib/academic-years";
import {
  buildGitHubUrl,
  buildLinkedInUrl,
  optionalProfileLinks,
} from "@/lib/social-links";
import {
  isValidSpotifyOpenUrl,
  toSpotifyEmbedUrl,
} from "@/lib/spotify-earworm";
import {
  UNIVERSITIES,
  OTHER_UNIVERSITY_VALUE,
  OTHER_PROGRAMME_VALUE,
  resolveUniversity,
  resolveProgramme,
} from "@/types/applications";

const DEPARTMENTS = ["Board", "Research", "IT", "Development", "Business", "Growth"];
const ABOUT_ME_MAX = 500;

// Unlike the application form, members may already have graduated, so past years are included.
const GRADUATION_YEARS_BACK = 30;
const GRADUATION_YEARS_AHEAD = 6;

function getProfileGraduationYears(current: string): string[] {
  const thisYear = new Date().getFullYear();
  const years = Array.from(
    { length: GRADUATION_YEARS_BACK + GRADUATION_YEARS_AHEAD + 1 },
    (_, i) => String(thisYear + GRADUATION_YEARS_AHEAD - i),
  );
  return current && !years.includes(current) ? [current, ...years] : years;
}

interface TeamEntryLocal {
  id: number;
  role: string;
  team: string;
  academic_year: string;
}

function useMyTeamEntries() {
  return useQuery<TeamEntryLocal[]>({
    queryKey: ["my-team-entries"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/team/my-entries`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch team entries");
      return res.json();
    },
    staleTime: 2 * 60 * 1000,
  });
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  university: string;
  universityOther: string;
  programme: string;
  programmeOther: string;
  graduationYear: string;
  githubLink: string;
  linkedinLink: string;
  aboutMe: string;
}

const EMPTY_FORM: ProfileFormData = {
  firstName: "",
  lastName: "",
  email: "",
  university: UNIVERSITIES[0],
  universityOther: "",
  programme: "",
  programmeOther: "",
  graduationYear: "",
  githubLink: "",
  linkedinLink: "",
  aboutMe: "",
};

function FormSection({
  title,
  description,
  children,
  complete,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  complete?: boolean;
}) {
  return (
    <section className="space-y-4 animate-fade-in">
      <div className="flex items-start gap-2">
        <div className="mt-0.5 shrink-0 text-primary">
          {complete ? (
            <CheckCircle2 className="h-4 w-4" aria-hidden />
          ) : (
            <Circle className="h-4 w-4 text-muted-foreground/50" aria-hidden />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold">{title}</h3>
          {description ? (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          ) : null}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-6">{children}</div>
    </section>
  );
}

function GraduationYearSelect({
  value,
  years,
  onChange,
}: {
  value: string;
  years: string[];
  onChange: (value: string) => void;
}) {
  return (
    <NativeSelect id="graduationYear" value={value} onChange={(e) => onChange(e.target.value)}>
      <NativeSelectOption value="">Not set</NativeSelectOption>
      {years.map((year) => (
        <NativeSelectOption key={year} value={year}>
          {year}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  );
}

// Kept outside the profile <form> so Enter in the role input doesn't submit the profile.
function TeamMembershipSection() {
  const { data: teamEntries = [], refetch: refetchTeam } = useMyTeamEntries();
  const addEntry = useAddMyTeamEntry();
  const removeEntry = useRemoveMyTeamEntry();
  const [newEntry, setNewEntry] = useState({ role: "", department: "", academicYear: "" });
  // isPending only flips after a rerender, so a second Enter press could slip through without this.
  const addInFlightRef = useRef(false);

  const handleAdd = async () => {
    if (addInFlightRef.current) return;
    addInFlightRef.current = true;
    try {
      await addEntry.mutateAsync({
        role: newEntry.role.trim(),
        department: newEntry.department,
        academicYear: newEntry.academicYear,
      });
      setNewEntry({ role: "", department: "", academicYear: "" });
      refetchTeam();
      toast.success("Team entry added");
    } catch {
      toast.error("Failed to add team entry");
    } finally {
      addInFlightRef.current = false;
    }
  };

  const handleRemove = async (id: number) => {
    try {
      await removeEntry.mutateAsync(id);
      refetchTeam();
    } catch {
      toast.error("Failed to remove team entry");
    }
  };

  const canAdd = Boolean(newEntry.academicYear && newEntry.department) && !addEntry.isPending;

  return (
    <section className="border-t pt-6 space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Team membership</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Add the years and teams you have been part of. This shows on your public profile and in About Us.
        </p>
      </div>

      {teamEntries.length > 0 ? (
        <div className="space-y-2">
          {teamEntries.map((entry) => (
            <div key={entry.id} className="flex items-center gap-3 p-3 rounded-lg border bg-secondary/10">
              <Badge variant="outline" className="font-mono text-xs shrink-0">{entry.team}</Badge>
              <span className="text-sm flex-1 min-w-0 truncate">
                {entry.role || <span className="text-muted-foreground italic">No role</span>}
              </span>
              <span className="text-xs text-muted-foreground font-mono">{entry.academic_year}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                aria-label={`Remove ${entry.team} ${entry.academic_year}`}
                disabled={removeEntry.isPending}
                onClick={() => handleRemove(entry.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Academic year</Label>
          <Select
            value={newEntry.academicYear}
            onValueChange={(v) => setNewEntry((prev) => ({ ...prev, academicYear: v }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {ACADEMIC_YEARS.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Team</Label>
          <Select
            value={newEntry.department}
            onValueChange={(v) => setNewEntry((prev) => ({ ...prev, department: v }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select team" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="teamRole" className="text-xs">Role (optional)</Label>
          <Input
            id="teamRole"
            placeholder="e.g. President"
            value={newEntry.role}
            onChange={(e) => setNewEntry((prev) => ({ ...prev, role: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canAdd) {
                e.preventDefault();
                handleAdd();
              }
            }}
          />
        </div>
      </div>
      <Button type="button" variant="outline" size="sm" disabled={!canAdd} onClick={handleAdd}>
        <Plus className="h-4 w-4 mr-2" />
        Add entry
      </Button>
    </section>
  );
}

function SpotifyEarwormSection({
  storageKey,
  aliases,
}: {
  storageKey: string;
  aliases: string[];
}) {
  const { data: saved, isLoading } = useProfileEarworm(storageKey);
  const saveEarworm = useSaveProfileEarworm();
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const seededRef = useRef(false);

  useEffect(() => {
    if (!saved || seededRef.current) return;
    seededRef.current = true;
    setUrl(saved.url);
    setLabel(saved.label ?? "");
  }, [saved]);

  const previewOk = isValidSpotifyOpenUrl(url);
  const dirty =
    url.trim() !== (saved?.url ?? "") ||
    (label.trim() || undefined) !== (saved?.label || undefined);

  const handleSave = async () => {
    try {
      if (!url.trim()) {
        await saveEarworm.mutateAsync({
          key: storageKey,
          aliases,
          url: "",
          clear: true,
        });
        toast.success("Earworm cleared");
        return;
      }
      if (!previewOk) {
        toast.error("That does not look like a Spotify link", {
          description: "Paste an open.spotify.com track, album, playlist, or episode URL.",
        });
        return;
      }
      await saveEarworm.mutateAsync({
        key: storageKey,
        aliases,
        url: url.trim(),
        label: label.trim() || undefined,
      });
      toast.success("Earworm saved — it will show on your public profile");
    } catch (err) {
      toast.error("Could not save earworm", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    }
  };

  return (
    <section className="border-t pt-6 space-y-4 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Music2 className="h-4 w-4" aria-hidden />
        </div>
        <div>
          <h3 className="text-sm font-semibold">Current earworm</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Share what you cannot stop playing. Paste a Spotify link — it shows as a player on your public profile.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground pl-11">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Loading earworm…
        </div>
      ) : (
        <div className="space-y-3 pl-11">
          <div className="space-y-2">
            <Label htmlFor="earwormUrl">Spotify link</Label>
            <Input
              id="earwormUrl"
              type="url"
              inputMode="url"
              placeholder="https://open.spotify.com/track/…"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="earwormLabel">Label (optional)</Label>
            <Input
              id="earwormLabel"
              placeholder="e.g. Late-night coding fuel"
              value={label}
              maxLength={80}
              onChange={(e) => setLabel(e.target.value.slice(0, 80))}
            />
          </div>

          {previewOk && toSpotifyEmbedUrl(url) ? (
            <div className="pt-1 transition-opacity duration-300">
              <SpotifyEarwormEmbed
                url={url}
                label={label.trim() || "Preview"}
                compact
              />
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={saveEarworm.isPending || (!dirty && Boolean(saved))}
              onClick={handleSave}
            >
              {saveEarworm.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : url.trim() ? (
                "Save earworm"
              ) : (
                "Clear earworm"
              )}
            </Button>
            {saved ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={saveEarworm.isPending}
                onClick={() => {
                  setUrl("");
                  setLabel("");
                  void saveEarworm
                    .mutateAsync({
                      key: storageKey,
                      aliases,
                      url: "",
                      clear: true,
                    })
                    .then(() => toast.success("Earworm cleared"))
                    .catch(() => toast.error("Could not clear earworm"));
                }}
              >
                Remove
              </Button>
            ) : null}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Proof of concept — stored via a Next route until a backend field lands. Needs Sam&apos;s OK before production.
          </p>
        </div>
      )}
    </section>
  );
}

export function MemberProfileForm() {
  const { data: profile, isLoading, refetch } = useMemberProfile();
  const updateProfile = useUpdateMemberProfile();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProfileFormData>(EMPTY_FORM);
  const setField = <K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  // Seed once when profile data arrives — including exists:false, so name/email
  // from the account still populate. Re-seeding on every refetch would wipe edits.
  const seededRef = useRef(false);
  useEffect(() => {
    if (!profile || seededRef.current) return;
    seededRef.current = true;
    const university = profile.university?.trim() || UNIVERSITIES[0];
    const isKnownUniversity = (UNIVERSITIES as readonly string[]).includes(university);
    const programme = profile.programme?.trim() || "";
    setFormData({
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      email: profile.email || "",
      university: isKnownUniversity ? university : OTHER_UNIVERSITY_VALUE,
      universityOther: isKnownUniversity ? "" : university,
      programme,
      programmeOther: "",
      graduationYear: profile.graduationYear ? String(profile.graduationYear) : "",
      githubLink: profile.githubLink || "",
      linkedinLink: profile.linkedInLink || "",
      aboutMe: profile.aboutMe || "",
    });
  }, [profile]);

  const handlePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => setPicturePreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setIsUploadingPicture(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("picture", file);

      const res = await fetch(`${API_URL}/profile/picture`, {
        method: "POST",
        credentials: "include",
        body: uploadFormData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || "Upload failed");
      }

      await refetch();
      toast.success("Profile picture updated");
    } catch (err) {
      setPicturePreview(null);
      toast.error("Upload failed", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setIsUploadingPicture(false);
    }
  };

  const handleSocialBlur = (field: "githubLink" | "linkedinLink") => {
    const raw = formData[field].trim();
    if (!raw) return;
    const normalized =
      field === "githubLink" ? buildGitHubUrl(raw) : buildLinkedInUrl(raw);
    if (normalized && normalized !== raw) {
      setField(field, normalized);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error("Please enter your first and last name");
      return;
    }
    const university = resolveUniversity(formData);
    if (!university) {
      toast.error("Please enter your university");
      return;
    }
    const programme = resolveProgramme(formData);
    if (formData.programme === OTHER_PROGRAMME_VALUE && !programme) {
      toast.error("Please enter your programme or degree");
      return;
    }

    const githubRaw = formData.githubLink.trim();
    const linkedinRaw = formData.linkedinLink.trim();
    if (githubRaw && !buildGitHubUrl(githubRaw)) {
      toast.error("GitHub link looks off", {
        description: "Use a github.com URL or your username.",
      });
      return;
    }
    if (linkedinRaw && !buildLinkedInUrl(linkedinRaw)) {
      toast.error("LinkedIn link looks off", {
        description: "Use a linkedin.com/in/… URL or your handle.",
      });
      return;
    }

    const links = optionalProfileLinks({
      githubLink: githubRaw,
      linkedinLink: linkedinRaw,
    });

    try {
      await updateProfile.mutateAsync({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        university,
        programme: programme || undefined,
        graduationYear: formData.graduationYear
          ? parseInt(formData.graduationYear, 10)
          : undefined,
        ...links,
        aboutMe: formData.aboutMe.trim() || undefined,
      });
      // Keep displayed social fields in normalized form after a successful save.
      setFormData((prev) => ({
        ...prev,
        githubLink: links.githubLink ?? "",
        linkedinLink: links.linkedinLink ?? "",
      }));
      toast.success("Profile saved", {
        description: "Your public page is up to date.",
      });
    } catch (err) {
      toast.error("Could not save profile", {
        description:
          err instanceof Error ? err.message : "Please try again in a moment.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading profile...
      </div>
    );
  }

  const currentPictureUrl =
    picturePreview ??
    (profile?.profilePicture
      ? `${API_URL}/profile/picture?id=${profile.profilePicture}`
      : null);

  const initials =
    formData.firstName && formData.lastName
      ? `${formData.firstName[0]}${formData.lastName[0]}`.toUpperCase()
      : null;

  const graduationYears = getProfileGraduationYears(formData.graduationYear);

  const personalComplete = Boolean(
    formData.firstName.trim() && formData.lastName.trim() && formData.email.trim(),
  );
  const studiesComplete = Boolean(
    resolveUniversity(formData) && resolveProgramme(formData),
  );
  const personalityComplete = Boolean(formData.aboutMe.trim().length >= 40);

  const earwormKey =
    profile?.slug || profile?.id || profile?.userId || "";
  const earwormAliases = [
    profile?.slug,
    profile?.id,
    profile?.userId,
  ].filter((v): v is string => Boolean(v && v !== earwormKey));

  return (
    <div className="space-y-8">
      {!profile?.exists ? (
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm animate-fade-in">
          <p className="font-medium text-secondary-black">Welcome — claim your page</p>
          <p className="text-xs text-muted-foreground mt-1">
            Fill in the basics below and hit save. You can add personality (bio, Spotify earworm) whenever you like.
          </p>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingPicture}
            className="relative group shrink-0 h-20 w-20 rounded-full overflow-hidden border-2 border-border bg-secondary/20 flex items-center justify-center transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Upload profile picture"
          >
            {currentPictureUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- external, per-user backend image; next/image's optimizer requires an allowlisted remote host, see AvatarImage usage elsewhere
              <img
                src={currentPictureUrl}
                alt="Profile picture"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : initials ? (
              <span className="text-2xl font-semibold text-muted-foreground">
                {initials}
              </span>
            ) : (
              <User className="h-8 w-8 text-muted-foreground" />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
              {isUploadingPicture ? (
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              ) : (
                <Camera className="h-5 w-5 text-white" />
              )}
            </div>
          </button>

          <div>
            <p className="text-sm font-medium">Profile picture</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isUploadingPicture
                ? "Uploading..."
                : "Click the avatar to upload. JPG, PNG, WebP or GIF."}
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handlePictureChange}
          />
        </div>

        <FormSection
          title="Personal details"
          description="The name people see on About and your public page."
          complete={personalComplete}
        >
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setField("firstName", e.target.value)}
              autoComplete="given-name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setField("lastName", e.target.value)}
              autoComplete="family-name"
              required
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setField("email", e.target.value)}
              autoComplete="email"
              required
            />
          </div>
        </FormSection>

        <FormSection
          title="Studies"
          description="Helps members find classmates and alumni."
          complete={studiesComplete}
        >
          <div className="space-y-2">
            <Label htmlFor="university">University</Label>
            <NativeSelect
              id="university"
              value={formData.university}
              onChange={(e) => setField("university", e.target.value)}
            >
              {UNIVERSITIES.map((uni) => (
                <NativeSelectOption key={uni} value={uni}>
                  {uni}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          <div className="space-y-2">
            <Label htmlFor="graduationYear">Graduation year</Label>
            <GraduationYearSelect
              value={formData.graduationYear}
              years={graduationYears}
              onChange={(v) => setField("graduationYear", v)}
            />
          </div>

          {formData.university === OTHER_UNIVERSITY_VALUE ? (
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="universityOther">Other university</Label>
              <Input
                id="universityOther"
                value={formData.universityOther}
                onChange={(e) => setField("universityOther", e.target.value)}
                placeholder="Enter your university"
                required
              />
            </div>
          ) : null}

          <div className="sm:col-span-2">
            <ProgrammeSelect
              id="programme"
              label="Programme"
              value={formData.programme}
              onValueChange={(v) => setField("programme", v)}
              placeholder="Select your programme"
              customOptions={[OTHER_PROGRAMME_VALUE]}
            />
          </div>

          {formData.programme === OTHER_PROGRAMME_VALUE ? (
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="programmeOther">Programme or degree</Label>
              <Input
                id="programmeOther"
                value={formData.programmeOther}
                onChange={(e) => setField("programmeOther", e.target.value)}
                placeholder="Your programme or degree"
                required
              />
            </div>
          ) : null}
        </FormSection>

        <FormSection
          title="Links & bio"
          description="Handles or full URLs both work — we normalize on blur."
          complete={personalityComplete}
        >
          <div className="space-y-2">
            <Label htmlFor="githubLink">GitHub</Label>
            <Input
              id="githubLink"
              type="text"
              inputMode="url"
              value={formData.githubLink}
              onChange={(e) => setField("githubLink", e.target.value)}
              onBlur={() => handleSocialBlur("githubLink")}
              placeholder="username or https://github.com/…"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedinLink">LinkedIn</Label>
            <Input
              id="linkedinLink"
              type="text"
              inputMode="url"
              value={formData.linkedinLink}
              onChange={(e) => setField("linkedinLink", e.target.value)}
              onBlur={() => handleSocialBlur("linkedinLink")}
              placeholder="handle or https://linkedin.com/in/…"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="aboutMe">About me</Label>
            <Textarea
              id="aboutMe"
              value={formData.aboutMe}
              onChange={(e) => setField("aboutMe", e.target.value.slice(0, ABOUT_ME_MAX))}
              placeholder="What are you geeking out about lately? A course, a side project, a paper…"
              className="resize-none h-32"
              maxLength={ABOUT_ME_MAX}
            />
            <p className="text-right text-xs text-muted-foreground">
              {formData.aboutMe.length} / {ABOUT_ME_MAX}
            </p>
          </div>
        </FormSection>

        <div className="flex justify-end">
          <Button type="submit" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </form>

      {earwormKey ? (
        <SpotifyEarwormSection storageKey={earwormKey} aliases={earwormAliases} />
      ) : null}

      <TeamMembershipSection />
    </div>
  );
}
