"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Camera, User, Plus, Trash2 } from "lucide-react";
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
import { ProgrammeSelect } from "@/components/member/programme-select";
import { useMemberProfile, useUpdateMemberProfile } from "@/hooks/member";
import { useAddMyTeamEntry, useRemoveMyTeamEntry } from "@/hooks/team";
import { API_URL } from "@/config";
import { ACADEMIC_YEARS } from "@/lib/academic-years";

const DEPARTMENTS = ["Board", "Research", "IT", "Development", "Business", "Growth"];

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
  programme: string;
  graduationYear: string;
  githubLink: string;
  linkedinLink: string;
  aboutMe: string;
}

export function MemberProfileForm() {
  const { data: profile, isLoading, refetch } = useMemberProfile();
  const updateProfile = useUpdateMemberProfile();
  const { data: teamEntries = [], refetch: refetchTeam } = useMyTeamEntries();
  const addEntry = useAddMyTeamEntry();
  const removeEntry = useRemoveMyTeamEntry();

  const [newEntry, setNewEntry] = useState({ role: "", department: "", academicYear: "" });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    email: "",
    university: "",
    programme: "",
    graduationYear: "",
    githubLink: "",
    linkedinLink: "",
    aboutMe: "",
  });

  useEffect(() => {
    if (profile && profile.exists) {
      const frame = requestAnimationFrame(() => {
        setFormData({
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          email: profile.email || "",
          university: profile.university || "",
          programme: profile.programme || "",
          graduationYear: profile.graduationYear
            ? String(profile.graduationYear)
            : "",
          githubLink: profile.githubLink || "",
          linkedinLink: profile.linkedInLink || "",
          aboutMe: profile.aboutMe || "",
        });
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [profile]);

  const handlePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setPicturePreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Upload to backend
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
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      await refetch();
      toast.success("Profile picture updated");
    } catch (err) {
      setPicturePreview(null);
      toast.error("Upload failed", {
        description:
          err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setIsUploadingPicture(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({
        ...formData,
        graduationYear: formData.graduationYear
          ? parseInt(formData.graduationYear, 10)
          : undefined,
      });
      toast.success("Changes saved");
    } catch {
      toast.error("Could not save profile", {
        description: "Please try again in a moment.",
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading profile...</div>;
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar upload */}
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
            <Camera className="h-5 w-5 text-white" />
          </div>
        </button>

        <div>
          <p className="text-sm font-medium">Profile picture</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isUploadingPicture
              ? "Uploading..."
              : "Click the avatar to upload. JPG, PNG or WebP."}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="university">University</Label>
          <Input
            id="university"
            value={formData.university}
            onChange={(e) =>
              setFormData({ ...formData, university: e.target.value })
            }
            placeholder="e.g., KTH Royal Institute of Technology"
          />
        </div>

        <ProgrammeSelect
          id="programme"
          label="Programme"
          value={formData.programme}
          onValueChange={(programme) =>
            setFormData({ ...formData, programme })
          }
          placeholder="Select your programme"
        />

        <div className="space-y-2">
          <Label htmlFor="graduationYear">Graduation Year</Label>
          <Input
            id="graduationYear"
            type="number"
            min="1900"
            max="2100"
            value={formData.graduationYear}
            onChange={(e) =>
              setFormData({ ...formData, graduationYear: e.target.value })
            }
            placeholder="YYYY"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="githubLink">GitHub</Label>
          <Input
            id="githubLink"
            type="url"
            value={formData.githubLink}
            onChange={(e) =>
              setFormData({ ...formData, githubLink: e.target.value })
            }
            placeholder="https://github.com/yourusername"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="linkedinLink">LinkedIn</Label>
          <Input
            id="linkedinLink"
            type="url"
            value={formData.linkedinLink}
            onChange={(e) =>
              setFormData({ ...formData, linkedinLink: e.target.value })
            }
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="aboutMe">About Me</Label>
          <Textarea
            id="aboutMe"
            value={formData.aboutMe}
            onChange={(e) =>
              setFormData({
                ...formData,
                aboutMe: e.target.value.slice(0, 500),
              })
            }
            placeholder="Write a short bio about yourself..."
            className="resize-none h-32"
            maxLength={500}
          />
          <div className="text-right text-sm text-muted-foreground mt-1">
            {formData.aboutMe.length} / 500 characters
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={updateProfile.isPending}>
          {updateProfile.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Team membership section — outside the main form submit */}
      <div className="border-t pt-6 mt-2 space-y-4">
        <div>
          <h3 className="text-sm font-semibold">Team membership</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add the years and teams you have been part of. This shows on your public profile and in About Us.
          </p>
        </div>

        {/* Existing entries */}
        {teamEntries.length > 0 && (
          <div className="space-y-2">
            {teamEntries.map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 p-3 rounded-lg border bg-secondary/10">
                <Badge variant="outline" className="font-mono text-xs shrink-0">{entry.team}</Badge>
                <span className="text-sm flex-1">{entry.role || <span className="text-muted-foreground italic">No role</span>}</span>
                <span className="text-xs text-muted-foreground font-mono">{entry.academic_year}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={async () => {
                    await removeEntry.mutateAsync(entry.id);
                    refetchTeam();
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add new entry */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Academic year</Label>
            <Select
              value={newEntry.academicYear}
              onValueChange={(v) => setNewEntry({ ...newEntry, academicYear: v })}
            >
              <SelectTrigger>
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
            <Select value={newEntry.department} onValueChange={(v) => setNewEntry({ ...newEntry, department: v })}>
              <SelectTrigger>
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
            <Label className="text-xs">Role (optional)</Label>
            <Input
              placeholder="e.g. President"
              value={newEntry.role}
              onChange={(e) => setNewEntry({ ...newEntry, role: e.target.value })}
            />
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!newEntry.academicYear || !newEntry.department || addEntry.isPending}
          onClick={async () => {
            try {
              await addEntry.mutateAsync({
                role: newEntry.role,
                department: newEntry.department,
                academicYear: newEntry.academicYear,
              });
              setNewEntry({ role: "", department: "", academicYear: "" });
              refetchTeam();
              toast.success("Team entry added");
            } catch {
              toast.error("Failed to add team entry");
            }
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add entry
        </Button>
      </div>
    </form>
  );
}
