"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMemberProfile, useUpdateMemberProfile } from "@/hooks/member";

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

const studyPrograms = [
  "Machine Learning",
  "Applied Mathematics",
  "Bio Technology",
  "Engineering Physics",
  "Computer Science",
  "Electrical Engineering",
  "Industrial Management",
  "Information and Communication Technology",
  "Chemical Science and Engineering",
  "Mechanical Engineering",
  "Mathematics",
  "Material Science and Engineering",
  "Medical Engineering",
  "Environmental Engineering",
  "The Built Environment",
  "Technology and Economics",
  "Technology and Health",
  "Technology and Learning",
  "Technology and Management",
];

export function MemberProfileForm() {
  const { toast } = useToast();
  const { data: profile, isLoading } = useMemberProfile();
  const updateProfile = useUpdateMemberProfile();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateProfile.mutateAsync({
        ...formData,
        graduationYear: formData.graduationYear
          ? parseInt(formData.graduationYear, 10)
          : undefined,
      });

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading profile...</div>;
  }

  return (
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
            placeholder="e.g., KTH Royal Institute of Technology"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="programme">Programme</Label>
          <Select
            value={formData.programme}
            onValueChange={(value) =>
              setFormData({ ...formData, programme: value })
            }
          >
            <SelectTrigger id="programme">
              <SelectValue placeholder="Select your programme" />
            </SelectTrigger>
            <SelectContent>
              {studyPrograms.map((program) => (
                <SelectItem key={program} value={program}>
                  {program}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
    </form>
  );
}