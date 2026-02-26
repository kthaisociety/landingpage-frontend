"use client";

import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useProjectPosts, type ProjectInput } from "@/hooks/projects";

const categoryPresets = [
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

const emptyForm: ProjectInput = {
  title: "",
  oneLineDescription: "",
  categories: [],
  techStack: "",
  problemImpact: "",
  keyFeatures: "",
  status: statusOptions[0],
  screenshots: "",
  repoUrl: "",
  contributors: [],
  affiliations: "",
  timeline: "",
  maintenancePlan: "",
  contact: "",
  logoUrl: "",
};

export function ProjectAdminPanel() {
  const { createProject } = useProjectPosts();
  const [form, setForm] = useState<ProjectInput>(emptyForm);
  const [categoryWarning, setCategoryWarning] = useState<string | null>(null);
  const [categoryInput, setCategoryInput] = useState("");
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [techStackInput, setTechStackInput] = useState("");
  const [techStackTags, setTechStackTags] = useState<string[]>([]);
  const [memberInput, setMemberInput] = useState("");
  const [memberWarning, setMemberWarning] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const categoryOptions = [...categoryPresets, ...customCategories];

  const handleChange =
    (field: keyof ProjectInput) =>
    (
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const toggleCategory = (category: string) => {
    setForm((prev) => {
      const isSelected = prev.categories.includes(category);
      if (isSelected) {
        setCategoryWarning(null);
        return {
          ...prev,
          categories: prev.categories.filter((item) => item !== category),
        };
      }
      if (prev.categories.length >= 3) {
        setCategoryWarning("Select up to three categories.");
        return prev;
      }
      setCategoryWarning(null);
      return {
        ...prev,
        categories: [...prev.categories, category],
      };
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.categories.length === 0) {
      setCategoryWarning("Select at least one category.");
      return;
    }
    if (form.contributors.length === 0) {
      setMemberWarning("Select at least one contributor.");
      return;
    }
    createProject({
      ...form,
      techStack: techStackTags.join(", "),
    });
    setForm(emptyForm);
    setCategoryWarning(null);
    setCategoryInput("");
    setCustomCategories([]);
    setTechStackInput("");
    setTechStackTags([]);
    setMemberInput("");
    setMemberWarning(null);
    setLogoError(null);
  };

  const handleAddCategory = () => {
    const trimmed = categoryInput.trim();
    if (!trimmed) {
      return;
    }
    const normalized = trimmed.toLowerCase();
    const existsInOptions = categoryOptions.some(
      (option) => option.toLowerCase() === normalized,
    );
    if (!existsInOptions) {
      setCustomCategories((prev) => [...prev, trimmed]);
    }
    toggleCategory(trimmed);
    setCategoryInput("");
  };

  const addContributor = () => {
    const trimmed = memberInput.trim();
    if (!trimmed) {
      return;
    }
    setForm((prev) => {
      const exists = prev.contributors.some(
        (name) => name.toLowerCase() === trimmed.toLowerCase(),
      );
      if (exists) {
        return prev;
      }
      if (prev.contributors.length >= 15) {
        setMemberWarning("Select up to 15 contributors.");
        return prev;
      }
      setMemberWarning(null);
      return {
        ...prev,
        contributors: [...prev.contributors, trimmed],
      };
    });
    setMemberInput("");
  };

  const removeContributor = (name: string) => {
    setForm((prev) => ({
      ...prev,
      contributors: prev.contributors.filter((item) => item !== name),
    }));
    setMemberWarning(null);
  };

  const addTechTag = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setTechStackTags((prev) => {
      const exists = prev.some((tag) => tag.toLowerCase() === trimmed.toLowerCase());
      if (exists) return prev;
      return [...prev, trimmed];
    });
    setTechStackInput("");
  };

  const removeTechTag = (tagToRemove: string) => {
    setTechStackTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const handleTechStackKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" && event.key !== ",") return;
    event.preventDefault();
    addTechTag(techStackInput);
  };

  const processProjectLogo = (file: File | null | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setLogoError("Please upload an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        logoUrl: typeof reader.result === "string" ? reader.result : "",
      }));
      setLogoError(null);
    };
    reader.onerror = () => {
      setLogoError("Failed to read the image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleProjectLogoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    processProjectLogo(event.target.files?.[0]);
  };

  const handleProjectLogoDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    processProjectLogo(event.dataTransfer.files?.[0]);
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Project entries</h2>
        <p className="text-sm text-muted-foreground">
          Capture project details for the public showcase.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New project</CardTitle>
          <CardDescription>
            Store project details locally while auth is in dev mode.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="project-title">Project title</Label>
                <Input
                  id="project-title"
                  value={form.title}
                  onChange={handleChange("title")}
                  placeholder="KTH AI Scholar"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="project-tagline">One-line description</Label>
                <Input
                  id="project-tagline"
                  value={form.oneLineDescription}
                  onChange={handleChange("oneLineDescription")}
                  placeholder="Smart tutoring for AI students"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Aim for 4–8 words that explain the project.
                </p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="project-logo">Project logo</Label>
                <div
                  className="rounded-md border border-dashed border-input p-4 text-sm text-muted-foreground cursor-pointer hover:bg-secondary/40 transition-colors"
                  onClick={() => logoInputRef.current?.click()}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={handleProjectLogoDrop}
                >
                  Drag and drop a project logo here, or click to upload.
                </div>
                <Input
                  ref={logoInputRef}
                  id="project-logo"
                  type="file"
                  accept="image/*"
                  onChange={handleProjectLogoUpload}
                  className="hidden"
                />
                {form.logoUrl ? (
                  <div className="relative w-fit">
                    <Image
                      src={form.logoUrl}
                      alt={`${form.title || "Project"} logo preview`}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-md border border-input object-contain"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="absolute -right-2 -top-2 h-6 w-6 rounded-full text-xs"
                      onClick={() => setForm((prev) => ({ ...prev, logoUrl: "" }))}
                      aria-label="Remove project logo"
                    >
                      x
                    </Button>
                  </div>
                ) : null}
                {logoError ? (
                  <p className="text-xs text-destructive">{logoError}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Upload a PNG or JPG file.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-status">Status</Label>
                <Select
                  id="project-status"
                  value={form.status}
                  onChange={handleChange("status")}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-tech">Tech stack</Label>
                <div className="flex flex-wrap gap-2">
                  {techStackTags.map((tag) => (
                    <Button
                      key={tag}
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => removeTechTag(tag)}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    id="project-tech"
                    value={techStackInput}
                    onChange={(event) => setTechStackInput(event.target.value)}
                    onKeyDown={handleTechStackKeyDown}
                    placeholder="Type a tech and press Enter"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addTechTag(techStackInput)}
                  >
                    Add tech
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Save tech stack as tags. Click a tag to remove it.
                </p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="project-categories">Categories</Label>
                <div className="flex flex-wrap gap-2">
                  {categoryOptions.map((category) => {
                    const isSelected = form.categories.includes(category);
                    return (
                      <Button
                        key={category}
                        type="button"
                        size="sm"
                        variant={isSelected ? "secondary" : "outline"}
                        onClick={() => toggleCategory(category)}
                      >
                        {category}
                      </Button>
                    );
                  })}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    id="project-categories"
                    value={categoryInput}
                    onChange={(event) => setCategoryInput(event.target.value)}
                    placeholder="Add a custom team label"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddCategory}
                  >
                    Add label
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {categoryWarning ||
                    `Selected ${form.categories.length}/3`}
                </p>
                {form.categories.length > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    {form.categories.join(", ")}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="project-problem">Problem & impact</Label>
                <Textarea
                  id="project-problem"
                  value={form.problemImpact}
                  onChange={handleChange("problemImpact")}
                  placeholder="What problem does it solve, and who benefits?"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="project-features">Key features</Label>
                <Textarea
                  id="project-features"
                  value={form.keyFeatures}
                  onChange={handleChange("keyFeatures")}
                  placeholder="List the top 3–5 features users care about."
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="project-screenshots">Screenshots / demo</Label>
                <Textarea
                  id="project-screenshots"
                  value={form.screenshots}
                  onChange={handleChange("screenshots")}
                  placeholder="Links to images or demo videos."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-repo">Repo / website</Label>
                <Input
                  id="project-repo"
                  value={form.repoUrl}
                  onChange={handleChange("repoUrl")}
                  placeholder="https://github.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-contact">Contact</Label>
                <Input
                  id="project-contact"
                  value={form.contact}
                  onChange={handleChange("contact")}
                  placeholder="contact@kthais.com"
                />
              </div>

              <div className="space-y-3 md:col-span-2">
                <Label htmlFor="project-contributors">Contributors (max 15)</Label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    id="project-contributors"
                    value={memberInput}
                    onChange={(event) => setMemberInput(event.target.value)}
                    placeholder="Add a contributor name + role"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addContributor}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.contributors.map((contributor) => (
                    <Button
                      key={contributor}
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => removeContributor(contributor)}
                    >
                      {contributor}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {memberWarning ||
                    `Selected ${form.contributors.length}/15`}
                </p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="project-affiliations">Affiliations</Label>
                <Input
                  id="project-affiliations"
                  value={form.affiliations}
                  onChange={handleChange("affiliations")}
                  placeholder="KTHAIS, ABC Labs"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="project-timeline">Timeline</Label>
                <Textarea
                  id="project-timeline"
                  value={form.timeline}
                  onChange={handleChange("timeline")}
                  placeholder="Start date, milestones, current phase."
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="project-maintenance">Maintenance plan</Label>
                <Textarea
                  id="project-maintenance"
                  value={form.maintenancePlan}
                  onChange={handleChange("maintenancePlan")}
                  placeholder="Owner, update cadence, handover plan."
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit">Publish project</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
