"use client";
import {  use } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";
import {toast} from "sonner"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ProgrammeSelect } from "@/components/member/programme-select";
// import { useToast } from "@/hooks/use-toast";

import {
  useAdminUserProfile,
  useUpdateAdminUserProfile,
} from "@/hooks/admin";

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

export default function AdminEditUserProfilePage({
  params,
}: {
  // 2. Change the type so params is a Promise
  params: Promise<{ userId: string }>;
}) {
  const router = useRouter();
  const { userId } = use(params);

  const { data: profile, isLoading, isError } = useAdminUserProfile(userId);
  const updateProfile = useUpdateAdminUserProfile();

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

  if (isLoading)
    return <div className="text-center py-12">Loading member profile...</div>;

  if (isError)
    return (
      <div className="max-w-3xl mx-auto py-12 space-y-4 text-center">
        <p className="text-destructive font-medium">
          Failed to load profile. This user might not have set one up yet.
        </p>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
      <div className="space-y-2">
        <Button
          variant="ghost"
          className="pl-0 text-muted-foreground hover:text-foreground"
          onClick={() => router.back()}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Workspace
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          Edit Member Profile
        </h1>
        <p className="text-muted-foreground">
          Update the profile details for user ID:{" "}
          <span className="font-mono text-xs">{userId}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
            />
          </div>

          <ProgrammeSelect
            id="programme"
            label="Programme"
            value={formData.programme}
            onValueChange={(programme) =>
              setFormData({ ...formData, programme })
            }
            placeholder="Select programme"
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
              className="resize-none h-32"
              maxLength={500}
            />
            <div className="text-right text-sm text-muted-foreground mt-1">
              {formData.aboutMe.length} / 500 characters
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            className="mr-4"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? "Saving..." : "Save Admin Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
