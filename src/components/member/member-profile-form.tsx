"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Camera, Loader2, User, Plus, Trash2 } from "lucide-react";
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
import { useMemberProfile, useUpdateMemberProfile } from "@/hooks/member";
import { useAddMyTeamEntry, useRemoveMyTeamEntry } from "@/hooks/team";
import { API_URL } from "@/config";
import { ACADEMIC_YEARS } from "@/lib/academic-years";
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
function getProfileGraduationYears(current: string): string[] {
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: 12 }, (_, i) => String(thisYear - 6 + i));
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
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        {description ? (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        ) : null}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
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

  const handleAdd = async () => {
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

export function MemberProfileForm() {
  const { data: profile, isLoading, refetch } = useMemberProfile();
  const updateProfile = useUpdateMemberProfile();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProfileFormData>(EMPTY_FORM);
  const setField = <K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  // Seed the form once. Re-seeding on every profile refetch (picture upload,
  // window refocus after staleTime) would wipe whatever the user is editing.
  const seededRef = useRef(false);
  useEffect(() => {
    if (!profile?.exists || seededRef.current) return;
    seededRef.current = true;
    const university = profile.university?.trim() || UNIVERSITIES[0];
    const isKnownUniversity = (UNIVERSITIES as readonly string[]).includes(university);
    setFormData({
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      email: profile.email || "",
      university: isKnownUniversity ? university : OTHER_UNIVERSITY_VALUE,
      universityOther: isKnownUniversity ? "" : university,
      programme: profile.programme || "",
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
        throw new Error(err.error || "Upload failed");
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

    try {
      await updateProfile.mutateAsync({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        university,
        programme,
        graduationYear: formData.graduationYear
          ? parseInt(formData.graduationYear, 10)
          : undefined,
        githubLink: formData.githubLink.trim(),
        linkedinLink: formData.linkedinLink.trim(),
        aboutMe: formData.aboutMe.trim(),
      });
      toast.success("Changes saved");
    } catch {
      toast.error("Could not save profile", {
        description: "Please try again in a moment.",
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

  return (
    <div className="space-y-8">
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

        <FormSection title="Personal details">
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

        <FormSection title="Studies">
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

        <FormSection title="Links">
          <div className="space-y-2">
            <Label htmlFor="githubLink">GitHub</Label>
            <Input
              id="githubLink"
              type="url"
              value={formData.githubLink}
              onChange={(e) => setField("githubLink", e.target.value)}
              placeholder="https://github.com/yourusername"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedinLink">LinkedIn</Label>
            <Input
              id="linkedinLink"
              type="url"
              value={formData.linkedinLink}
              onChange={(e) => setField("linkedinLink", e.target.value)}
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="aboutMe">About me</Label>
            <Textarea
              id="aboutMe"
              value={formData.aboutMe}
              onChange={(e) => setField("aboutMe", e.target.value.slice(0, ABOUT_ME_MAX))}
              placeholder="Write a short bio about yourself..."
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

      <TeamMembershipSection />
    </div>
  );
}
