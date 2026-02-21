"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMemberProfile, useUpdateMemberProfile } from "@/hooks/member";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  linkedin: string;
  studyProgram: string;
  description: string;
}

export function MemberProfileForm() {
  const { toast } = useToast();
  const { data: profile, isLoading } = useMemberProfile();
  const updateProfile = useUpdateMemberProfile();

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    email: "",
    linkedin: "",
    studyProgram: "",
    description: "",
  });

  useEffect(() => {
    if (profile) {
      const frame = requestAnimationFrame(() => {
        setFormData({
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          email: profile.email || "",
          linkedin: profile.linkedin || "",
          studyProgram: profile.studyProgram || "",
          description: profile.description || "",
        });
      });

      return () => cancelAnimationFrame(frame);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProfile.mutateAsync(formData);
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

        <div className="space-y-2">
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
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input
            id="linkedin"
            type="url"
            value={formData.linkedin}
            onChange={(e) =>
              setFormData({ ...formData, linkedin: e.target.value })
            }
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="studyProgram">Study Program</Label>
          <Input
            id="studyProgram"
            value={formData.studyProgram}
            onChange={(e) =>
              setFormData({ ...formData, studyProgram: e.target.value })
            }
            placeholder="e.g., Computer Science, Data Science"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Short Description</Label>
          <Textarea
            id="description"
            rows={4}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Tell us a bit about yourself..."
          />
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
