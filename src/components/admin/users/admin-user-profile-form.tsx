"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
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
import {
  useAdminUserProfile,
  useUpdateAdminUserProfile,
  useAdminUserTeamEntries,
  useAdminAddTeamEntry,
  useAdminRemoveTeamEntry,
} from "@/hooks/admin";
import { ACADEMIC_YEARS } from "@/lib/academic-years";

const TEAM_DEPARTMENTS = [
  "Board",
  "Research",
  "IT",
  "Development",
  "Business",
  "Growth",
];

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

export function AdminUserProfileForm({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const { data: profile, isLoading, isError } = useAdminUserProfile(userId);
  const updateProfile = useUpdateAdminUserProfile();
  const profileOk = Boolean(profile && !isError);
  const { data: teamRows = [], refetch: refetchTeam } = useAdminUserTeamEntries(
    userId,
    profileOk,
  );
  const addTeamEntry = useAdminAddTeamEntry();
  const removeTeamEntry = useAdminRemoveTeamEntry();

  const [newEntry, setNewEntry] = useState({
    role: "",
    department: "",
    academicYear: "",
  });

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
    if (profile) {
      const frame = requestAnimationFrame(() => {
        setFormData({
          firstName: profile.first_name || "",
          lastName: profile.last_name || "",
          email: profile.email || "",
          university: profile.university || "",
          programme: profile.programme || "",
          graduationYear: profile.graduation_year
            ? String(profile.graduation_year)
            : "",
          githubLink: profile.github_link || "",
          linkedinLink: profile.linkedin_link || "",
          aboutMe: profile.about_me || "",
        });
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({
        userId,
        data: {
          ...formData,
          graduationYear: formData.graduationYear
            ? parseInt(formData.graduationYear, 10)
            : 0,
        },
      });
      toast.success("The member's profile has been successfully updated.");
    } catch {
      toast.error("Failed to update profile. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        Loading member profile…
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="space-y-4 py-4">
        <p className="text-sm text-destructive font-medium">
          Failed to load profile. This user might not have set one up yet.
        </p>
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
    );
  }

  const profileId = profile.id;
  if (!profileId) {
    return (
      <div className="space-y-4 py-4">
        <p className="text-sm text-destructive font-medium">
          Profile record is missing an id; team entries cannot be edited.
        </p>
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`admin-firstName-${userId}`}>First Name</Label>
            <Input
              id={`admin-firstName-${userId}`}
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`admin-lastName-${userId}`}>Last Name</Label>
            <Input
              id={`admin-lastName-${userId}`}
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor={`admin-email-${userId}`}>Email</Label>
            <Input
              id={`admin-email-${userId}`}
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`admin-university-${userId}`}>University</Label>
            <Input
              id={`admin-university-${userId}`}
              value={formData.university}
              onChange={(e) =>
                setFormData({ ...formData, university: e.target.value })
              }
            />
          </div>

          <ProgrammeSelect
            id={`admin-programme-${userId}`}
            label="Programme"
            value={formData.programme}
            onValueChange={(programme) =>
              setFormData({ ...formData, programme })
            }
            placeholder="Select programme"
          />

          <div className="space-y-2">
            <Label htmlFor={`admin-graduationYear-${userId}`}>
              Graduation Year
            </Label>
            <Input
              id={`admin-graduationYear-${userId}`}
              type="number"
              min={1900}
              max={2100}
              value={formData.graduationYear}
              onChange={(e) =>
                setFormData({ ...formData, graduationYear: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`admin-githubLink-${userId}`}>GitHub</Label>
            <Input
              id={`admin-githubLink-${userId}`}
              type="url"
              value={formData.githubLink}
              onChange={(e) =>
                setFormData({ ...formData, githubLink: e.target.value })
              }
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor={`admin-linkedinLink-${userId}`}>LinkedIn</Label>
            <Input
              id={`admin-linkedinLink-${userId}`}
              type="url"
              value={formData.linkedinLink}
              onChange={(e) =>
                setFormData({ ...formData, linkedinLink: e.target.value })
              }
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor={`admin-aboutMe-${userId}`}>About Me</Label>
            <Textarea
              id={`admin-aboutMe-${userId}`}
              value={formData.aboutMe}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  aboutMe: e.target.value.slice(0, 500),
                })
              }
              className="h-32 resize-none"
              maxLength={500}
            />
            <div className="mt-1 text-right text-sm text-muted-foreground">
              {formData.aboutMe.length} / 500 characters
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? "Saving…" : "Save profile"}
          </Button>
        </div>
      </form>

      <div className="space-y-4 border-t pt-6">
        <div>
          <h3 className="text-sm font-semibold">Team roles (About Us)</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Same entries members manage on their profile: department, optional
            role title, and academic year.
          </p>
        </div>

        {teamRows.length > 0 ? (
          <div className="space-y-2">
            {teamRows.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 rounded-lg border bg-secondary/10 p-3"
              >
                <Badge
                  variant="outline"
                  className="shrink-0 font-mono text-xs"
                >
                  {entry.team}
                </Badge>
                <span className="flex-1 text-sm">
                  {entry.role || (
                    <span className="italic text-muted-foreground">No role</span>
                  )}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {entry.academic_year}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  disabled={removeTeamEntry.isPending}
                  onClick={async () => {
                    try {
                      await removeTeamEntry.mutateAsync(entry.id);
                      await refetchTeam();
                      toast.success("Team entry removed.");
                    } catch {
                      toast.error("Could not remove team entry.");
                    }
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No team entries yet.</p>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <Label className="text-xs">Academic year</Label>
            <Select
              value={newEntry.academicYear}
              onValueChange={(v) =>
                setNewEntry({ ...newEntry, academicYear: v })
              }
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
            <Select
              value={newEntry.department}
              onValueChange={(v) =>
                setNewEntry({ ...newEntry, department: v })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                {TEAM_DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Role (optional)</Label>
            <Input
              placeholder="e.g. President"
              value={newEntry.role}
              onChange={(e) =>
                setNewEntry({ ...newEntry, role: e.target.value })
              }
            />
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={
            !newEntry.academicYear ||
            !newEntry.department ||
            addTeamEntry.isPending
          }
          onClick={async () => {
            try {
              await addTeamEntry.mutateAsync({
                profileId: profileId,
                role: newEntry.role,
                department: newEntry.department,
                academicYear: newEntry.academicYear,
              });
              setNewEntry({ role: "", department: "", academicYear: "" });
              await refetchTeam();
              toast.success("Team entry added.");
            } catch {
              toast.error("Could not add team entry.");
            }
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add team entry
        </Button>
      </div>
    </div>
  );
}
