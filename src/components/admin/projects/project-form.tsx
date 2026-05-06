"use client";

import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import {toast} from "sonner"
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useAdminUsers,
  useProjectPosts,
  useUpdateProject,
  type CreateProjectDTO,
} from "@/hooks/admin";
import { useProject } from "@/hooks/projects";
import { API_URL } from "@/config";

export type ExtendedProjectInput = {
  title: string;
  teamName: string;
  oneLineDescription: string;
  shortDescription: string;
  categories: string[];
  techStack: string[];
  problemImpact: string;
  keyFeatures: string[];
  status: string;
  coverImage: string;
  websiteUrl: string;
  repoUrl: string;
  screenshots: { image: string; caption: string; alt?: string }[];
  contributors: { email: string }[];
  affiliations: string;
  timeline: {
    startDate: string;
    currentPhase: string;
    upcomingMilestones: string[];
  };
  maintenancePlan: string;
  contact: string;
};

const teamPresets = [
  "Development team",
  "Research team",
  "IT team",
  "Business team",
  "Growth team",
];

const statusOptions = [
  "Idea",
  "Prototype",
  "In development",
  "Public beta",
  "Live",
];

const emptyForm: ExtendedProjectInput = {
  title: "",
  teamName: "",
  oneLineDescription: "",
  shortDescription: "",
  categories: [],
  techStack: [],
  problemImpact: "",
  keyFeatures: [],
  status: statusOptions[0],
  coverImage: "",
  websiteUrl: "",
  repoUrl: "",
  screenshots: [],
  contributors: [],
  affiliations: "",
  timeline: {
    startDate: "",
    currentPhase: "",
    upcomingMilestones: [],
  },
  maintenancePlan: "",
  contact: "",
};

// ADDED: Pass projectId as an optional prop
export function ProjectForm({ projectId, onClose }: { projectId?: string; onClose?: () => void }) {
  const { createProjectAsync, isCreating } = useProjectPosts();
  const { mutateAsync: updateProjectAsync, isPending: isUpdating } = useUpdateProject();
  const { data: adminUsers = [] } = useAdminUsers();

  // ADDED: Fetch project data if projectId is provided
  const { data: initialData, isLoading: isFetching } = useProject(
    projectId || "",
  );

  const [form, setForm] = useState<ExtendedProjectInput>(emptyForm);

  // Associated Teams
  const [teamWarning, setTeamWarning] = useState<string | null>(null);
  const [teamInput, setTeamInput] = useState("");
  const [customTeams, setCustomTeams] = useState<string[]>([]);
  const teamOptions = [...teamPresets, ...customTeams];

  // Additional states
  const [techStackInput, setTechStackInput] = useState("");
  const [featureInput, setFeatureInput] = useState("");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [screenshotImageFiles, setScreenshotImageFiles] = useState<File[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [memberWarning, setMemberWarning] = useState<string | null>(null);
  const [milestoneInput, setMilestoneInput] = useState("");

  // ADDED: Populate form when initialData loads (Edit Mode)
  useEffect(() => {
    if (!initialData) return;

    // Compute custom teams
    const newCustomTeams: string[] = [];
    if (initialData.categories && Array.isArray(initialData.categories)) {
      newCustomTeams.push(
        ...initialData.categories.filter((c) => !teamPresets.includes(c)),
      );
    }

    // Batch state updates
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCustomTeams(newCustomTeams);
    setForm({
      title: initialData.title || "",
      teamName: initialData.teamName || "",
      oneLineDescription: initialData.oneLineDescription || "",
      shortDescription: initialData.shortDescription || "",
      categories: initialData.categories || [],
      techStack: initialData.techStack || [],
      problemImpact: initialData.problemImpact || "",
      keyFeatures: initialData.keyFeatures || [],
      status: initialData.status || statusOptions[0],
      coverImage: initialData.coverImage || "",
      websiteUrl: initialData.websiteUrl || "",
      repoUrl: initialData.repoUrl || "",
      screenshots: initialData.screenshots || [],
      contributors: initialData.contributors
        ? initialData.contributors.map((c) => ({
            email: c.email,
            team: c.team || "",
          }))
        : [],
      affiliations: initialData.affiliations || "",
      timeline: initialData.timeline || emptyForm.timeline,
      maintenancePlan: initialData.maintenancePlan || "",
      contact: initialData.contact || "",
    });
  }, [initialData]);

  // --- Handlers ---
  const handleTextChange =
    (field: keyof ExtendedProjectInput) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleTimelineChange =
    (field: keyof ExtendedProjectInput["timeline"]) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({
        ...prev,
        timeline: { ...prev.timeline, [field]: event.target.value },
      }));
    };

  const toggleAssociatedTeam = (teamLabel: string) => {
    setForm((prev) => {
      const isSelected = prev.categories.includes(teamLabel);
      if (isSelected) {
        setTeamWarning(null);
        return {
          ...prev,
          categories: prev.categories.filter((c) => c !== teamLabel),
          contributors: prev.contributors,
        };
      }
      if (prev.categories.length >= 5) {
        setTeamWarning("Select up to 5 associated teams.");
        return prev;
      }
      setTeamWarning(null);
      return { ...prev, categories: [...prev.categories, teamLabel] };
    });
  };

  const handleAddAssociatedTeam = () => {
    const trimmed = teamInput.trim();
    if (!trimmed) return;
    if (
      !teamOptions.some((opt) => opt.toLowerCase() === trimmed.toLowerCase())
    ) {
      setCustomTeams((prev) => [...prev, trimmed]);
    }
    toggleAssociatedTeam(trimmed);
    setTeamInput("");
  };

  const addToList = (
    field: "techStack" | "keyFeatures",
    value: string,
    resetInput: () => void,
    limit?: number,
  ) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setForm((prev) => {
      if (prev[field].includes(trimmed)) return prev;
      if (limit && prev[field].length >= limit) return prev;
      return { ...prev, [field]: [...prev[field], trimmed] };
    });
    resetInput();
  };

  const removeFromList = (
    field: "techStack" | "keyFeatures",
    valueToRemove: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((val) => val !== valueToRemove),
    }));
  };

  const addMilestone = () => {
    const trimmed = milestoneInput.trim();
    if (!trimmed) return;
    setForm((prev) => ({
      ...prev,
      timeline: {
        ...prev.timeline,
        upcomingMilestones: [...prev.timeline.upcomingMilestones, trimmed],
      },
    }));
    setMilestoneInput("");
  };

  const removeMilestone = (milestoneToRemove: string) => {
    setForm((prev) => ({
      ...prev,
      timeline: {
        ...prev.timeline,
        upcomingMilestones: prev.timeline.upcomingMilestones.filter(
          (m) => m !== milestoneToRemove,
        ),
      },
    }));
  };

  const removeScreenshot = (indexToRemove: number) => {
    setForm((prev) => ({
      ...prev,
      screenshots: prev.screenshots.filter(
        (_, index) => index !== indexToRemove,
      ),
    }));
  };

  const addContributor = (email: string) => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    setForm((prev) => {
      if (
        prev.contributors.some(
          (c) => c.email.toLowerCase() === trimmedEmail.toLowerCase(),
        )
      ) {
        return prev;
      }
      if (prev.contributors.length >= 15) {
        setMemberWarning("Select up to 15 contributors.");
        return prev;
      }
      setMemberWarning(null);
      return {
        ...prev,
        contributors: [
          ...prev.contributors,
          { email: trimmedEmail },
        ],
      };
    });
    setUserSearch("");
  };

  const removeContributor = (indexToRemove: number) => {
    setForm((prev) => ({
      ...prev,
      contributors: prev.contributors.filter(
        (_, index) => index !== indexToRemove,
      ),
    }));
    setMemberWarning(null);
  };

  const filteredUsers = userSearch.trim()
    ? adminUsers.filter((u) =>
        u.email?.toLowerCase().includes(userSearch.toLowerCase()),
      )
    : [];

  const uploadProjectMediaFiles = async (targetProjectId: string) => {
    if (!coverImageFile && screenshotImageFiles.length === 0) {
      return;
    }

    const formData = new FormData();
    if (coverImageFile) {
      formData.append("coverImage", coverImageFile);
    }
    screenshotImageFiles.forEach((file) => formData.append("screenshots", file));

    const response = await fetch(`${API_URL}/projects/${targetProjectId}/media`, {
      method: "PUT",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => null);
      throw new Error(err?.error || "Failed to upload project media files");
    }
  };

   const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
     event.preventDefault();
     if (form.categories.length === 0) {
       setTeamWarning("Select at least one associated team.");
       return;
     }

     const finalTeamName = form.teamName.trim() || `${form.title} Team`;

     const payload: CreateProjectDTO = {
       title: form.title,
       oneLineDescription: form.oneLineDescription,
       categories: form.categories.join(", "),
       techStack: form.techStack.join(", "),
       problemImpact: form.problemImpact,
       keyFeatures: form.keyFeatures.join("<SEP>"),
       status: form.status,
       screenshots: JSON.stringify(form.screenshots),
       repoUrl: form.repoUrl,
       contributors: form.contributors.map(
        (c) => c.email,
       ),
       affiliations: form.affiliations,
       timeline: JSON.stringify(form.timeline),
       maintenancePlan: form.maintenancePlan,
       contact: form.contact,
       teamName: finalTeamName,
     };

     try {
       if (projectId) {
         await updateProjectAsync({ id: projectId, data: payload });
         await uploadProjectMediaFiles(projectId);
         toast.success("Project updated successfully!");
         onClose?.();
       } else {
         const createdProject = await createProjectAsync(payload);
         const createdProjectId = createdProject?.id as string | undefined;
         if (createdProjectId) {
           await uploadProjectMediaFiles(createdProjectId);
         }
         setForm(emptyForm);
         setCustomTeams([]);
         setCoverImageFile(null);
         setScreenshotImageFiles([]);
         toast.success("Project created successfully!");
         onClose?.();
       }

       setTeamWarning(null);
       setTeamInput("");
       setTechStackInput("");
       setUserSearch("");
       setMemberWarning(null);
     } catch (error) {
       console.error("Failed to submit project form:", error);
       toast.error(error instanceof Error ? error.message : "Failed to save project.");
     }
   }; 

  if (isFetching) {
    return <p className="text-muted-foreground p-6">Loading project data...</p>;
  }

  const isSubmitting = isCreating || isUpdating;

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-10">
                {/* ================= SECTION 1: BASIC DETAILS ================= */}
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <h3 className="text-lg font-medium tracking-tight">
                      Basic Details
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Core information about the project.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="project-title">Project title <span className="text-destructive ml-0.5">*</span></Label>
                      <Input
                        id="project-title"
                        value={form.title}
                        onChange={handleTextChange("title")}
                        placeholder="Twiga"
                        required
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="project-tagline">
                        One-line description <span className="text-destructive ml-0.5">*</span>
                      </Label>
                      <Input
                        id="project-tagline"
                        value={form.oneLineDescription}
                        onChange={handleTextChange("oneLineDescription")}
                        placeholder="Empowering Tanzanian education with AI"
                        required
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="project-short">Short description</Label>
                      <Textarea
                        id="project-short"
                        value={form.shortDescription}
                        onChange={handleTextChange("shortDescription")}
                        placeholder="AI-powered educational tool for Tanzanian teachers"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="project-problem">Problem & impact <span className="text-destructive ml-0.5">*</span></Label>
                      <Textarea
                        id="project-problem"
                        value={form.problemImpact}
                        onChange={handleTextChange("problemImpact")}
                        placeholder="What problem does it solve, and who benefits?"
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="project-features">
                        Key features (Max 5) <span className="text-destructive ml-0.5">*</span>
                      </Label>
                      <div className="flex flex-col gap-2">
                        {form.keyFeatures.map((feature) => (
                          <div
                            key={feature}
                            className="flex items-center justify-between p-2 text-sm border rounded-md bg-secondary/20"
                          >
                            <span>{feature}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                removeFromList("keyFeatures", feature)
                              }
                              className="h-6 w-6 p-0"
                            >
                              ✕
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row mt-2">
                        <Input
                          id="project-features"
                          value={featureInput}
                          onChange={(e) => setFeatureInput(e.target.value)}
                          placeholder="e.g. Adaptation to Tanzanian context"
                          disabled={form.keyFeatures.length >= 5}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addToList(
                                "keyFeatures",
                                featureInput,
                                () => setFeatureInput(""),
                                5,
                              );
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            addToList(
                              "keyFeatures",
                              featureInput,
                              () => setFeatureInput(""),
                              5,
                            )
                          }
                          disabled={form.keyFeatures.length >= 5}
                        >
                          Add feature
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="project-tech">Tech stack <span className="text-destructive ml-0.5">*</span></Label>
                      <div className="flex flex-wrap gap-2">
                        {form.techStack.map((tag) => (
                          <Button
                            key={tag}
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => removeFromList("techStack", tag)}
                          >
                            {tag} ✕
                          </Button>
                        ))}
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row mt-2">
                        <Input
                          id="project-tech"
                          value={techStackInput}
                          onChange={(e) => setTechStackInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === ",") {
                              e.preventDefault();
                              addToList("techStack", techStackInput, () =>
                                setTechStackInput(""),
                              );
                            }
                          }}
                          placeholder="e.g. Python, FastAPI"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            addToList("techStack", techStackInput, () =>
                              setTechStackInput(""),
                            )
                          }
                        >
                          Add tech
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ================= SECTION 2: MEDIA & LINKS ================= */}
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <h3 className="text-lg font-medium tracking-tight">
                      Media & Links
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Visuals and external references.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="project-cover-file">Cover image</Label>
                      <Input
                        id="project-cover-file"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setCoverImageFile(e.target.files?.[0] ?? null)}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Screenshots / Demo</Label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {form.screenshots.map((shot, idx) => (
                          <div
                            key={shot.image}
                            className="p-3 space-y-2 border rounded-md relative"
                          >
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-1 top-1 h-6 w-6 p-0 text-destructive"
                              onClick={() => removeScreenshot(idx)}
                            >
                              ✕
                            </Button>
                            <p className="text-sm font-medium truncate pr-6">
                              {shot.image}
                            </p>
                            {shot.caption && (
                              <p className="text-xs text-muted-foreground">
                                {shot.caption}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="space-y-1 pt-2">
                        <Label htmlFor="project-screenshot-files">Upload screenshot files</Label>
                        <Input
                          id="project-screenshot-files"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => setScreenshotImageFiles(Array.from(e.target.files ?? []))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="project-website">Website URL</Label>
                      <Input
                        id="project-website"
                        value={form.websiteUrl}
                        onChange={handleTextChange("websiteUrl")}
                        placeholder="https://twiga.ai.or.tz/"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="project-repo">Repo URL</Label>
                      <Input
                        id="project-repo"
                        value={form.repoUrl}
                        onChange={handleTextChange("repoUrl")}
                        placeholder="https://github.com/..."
                      />
                    </div>
                  </div>
                </div>

                {/* ================= SECTION 3: TEAM & CONTRIBUTORS ================= */}
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <h3 className="text-lg font-medium tracking-tight">
                      Team & Contributors
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Manage the teams and people working on this project.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="project-team-name">
                        Overall Team Name
                      </Label>
                      <Input
                        id="project-team-name"
                        value={form.teamName}
                        onChange={handleTextChange("teamName")}
                        placeholder={
                          form.title ? `${form.title} Team` : "e.g. Twiga Team"
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Defaults to -- Project Title Team -- if left empty.
                      </p>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="project-associated-teams">
                        Associated Teams <span className="text-destructive ml-0.5">*</span>
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {teamOptions.map((team) => {
                          const isSelected = form.categories.includes(team);
                          return (
                            <Button
                              key={team}
                              type="button"
                              size="sm"
                              variant={isSelected ? "secondary" : "outline"}
                              onClick={() => toggleAssociatedTeam(team)}
                            >
                              {team}
                            </Button>
                          );
                        })}
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row mt-2">
                        <Input
                          id="project-associated-teams"
                          value={teamInput}
                          onChange={(event) => setTeamInput(event.target.value)}
                          placeholder="Add a custom team label"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddAssociatedTeam();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddAssociatedTeam}
                        >
                          Add team
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {teamWarning || `Selected ${form.categories.length}/5`}
                      </p>
                    </div>

                    <div className="space-y-3 md:col-span-2">
                      <Label>Contributors</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                            disabled={form.categories.length === 0}
                          >
                            {form.contributors.length > 0
                              ? `${form.contributors.length} member(s) selected`
                              : "Select project members"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[420px] p-3" align="start">
                          <div className="space-y-2">
                            <Input
                              value={userSearch}
                              onChange={(e) => setUserSearch(e.target.value)}
                              placeholder="Search members by email..."
                              autoComplete="off"
                            />
                            <div className="max-h-60 overflow-y-auto space-y-1">
                              {(userSearch.trim() ? filteredUsers : adminUsers).map((user) => {
                                const isSelected = form.contributors.some(
                                  (c) => c.email.toLowerCase() === user.email.toLowerCase(),
                                );
                                return (
                                  <label
                                    key={user.user_id}
                                    className="flex items-center gap-3 rounded-md border p-2 cursor-pointer"
                                  >
                                    <Checkbox
                                      checked={isSelected}
                                      onCheckedChange={() => {
                                        if (isSelected) {
                                          const indexToRemove = form.contributors.findIndex(
                                            (c) =>
                                              c.email.toLowerCase() ===
                                              user.email.toLowerCase(),
                                          );
                                          if (indexToRemove >= 0) {
                                            removeContributor(indexToRemove);
                                          }
                                        } else {
                                          addContributor(user.email);
                                        }
                                      }}
                                    />
                                    <span className="text-sm">{user.email}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      {form.categories.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          Please select an Associated Team first.
                        </p>
                      )}

                      {form.contributors.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {form.contributors.map((contributor, idx) => (
                            <Button
                              key={contributor.email}
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => removeContributor(idx)}
                            >
                              {contributor.email} ✕
                            </Button>
                          ))}
                        </div>
                      )}
                      {memberWarning && (
                        <p className="text-xs text-destructive">
                          {memberWarning}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="project-affiliations">
                        Other Affiliations
                      </Label>
                      <Input
                        id="project-affiliations"
                        value={form.affiliations}
                        onChange={handleTextChange("affiliations")}
                        placeholder="Tanzania AI Lab & Community"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="project-contact">
                        Primary Contact Email
                      </Label>
                      <Input
                        id="project-contact"
                        value={form.contact}
                        onChange={handleTextChange("contact")}
                        placeholder="communications@ai.or.tz"
                      />
                    </div>
                  </div>
                </div>

                {/* ================= SECTION 4: TIMELINE & STATUS ================= */}
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <h3 className="text-lg font-medium tracking-tight">
                      Timeline & Status
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Project lifecycle and operations.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2 sm:col-span-1">
                      <Label htmlFor="project-status">Current Status</Label>
                      <Select
                        value={form.status}
                        onValueChange={(val) =>
                          setForm((prev) => ({ ...prev, status: val }))
                        }
                      >
                        <SelectTrigger id="project-status">
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 flex flex-col justify-end md:col-span-2 sm:col-span-1">
                      <Label htmlFor="timeline-start">Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="timeline-start"
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !form.timeline.startDate &&
                                "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {form.timeline.startDate ? (
                              format(new Date(form.timeline.startDate), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              form.timeline.startDate
                                ? new Date(form.timeline.startDate)
                                : undefined
                            }
                            onSelect={(date) =>
                              setForm((prev) => ({
                                ...prev,
                                timeline: {
                                  ...prev.timeline,
                                  startDate: date ? date.toISOString() : "",
                                },
                              }))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="timeline-phase">
                        Current Phase Notes
                      </Label>
                      <Textarea
                        id="timeline-phase"
                        value={form.timeline.currentPhase}
                        onChange={handleTimelineChange("currentPhase")}
                        placeholder="What is currently happening?"
                        className="min-h-[80px]"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Upcoming Milestones</Label>
                      <div className="flex flex-col gap-2">
                        {form.timeline.upcomingMilestones.map((milestone) => (
                          <div
                            key={milestone}
                            className="flex items-center justify-between p-2 text-sm border rounded-md bg-secondary/20"
                          >
                            <span>{milestone}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMilestone(milestone)}
                              className="h-6 w-6 p-0"
                            >
                              ✕
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row mt-2">
                        <Input
                          placeholder="e.g. Onboard +100 teachers"
                          value={milestoneInput}
                          onChange={(e) => setMilestoneInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addMilestone();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addMilestone}
                        >
                          Add milestone
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="project-maintenance">
                        Maintenance plan
                      </Label>
                      <Textarea
                        id="project-maintenance"
                        value={form.maintenancePlan}
                        onChange={handleTextChange("maintenancePlan")}
                        placeholder="Owner, update cadence, handover plan."
                      />
                    </div>
                  </div>
                </div>

                {/* ================= SUBMIT ================= */}
                <div className="flex flex-wrap items-center gap-3 pt-6 border-t">
                  {onClose && (
                    <Button type="button" variant="ghost" onClick={onClose}>
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    {projectId
                      ? isUpdating
                        ? "Updating..."
                        : "Update project"
                      : isCreating
                        ? "Publishing..."
                        : "Publish project"}
                  </Button>
                </div>
              </form>
    </div>
  );
}
