"use client";

import {
  useRef,
  useState,
  useEffect,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {NIL_UUID} from "@/lib/constants/companies"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useCompany,
  useCreateCompany,
  useUpdateCompany,
  type CompanyInput,
} from "@/hooks/admin";
import { API_URL } from "@/config";

const emptyForm: CompanyInput = {
  name: "",
  description: "",
  websiteUrl: "",
  logoFile: null,
  removeLogo: false, 
};

export function CompanyForm({ companyId }: { companyId?: string }) {

  // Hooks
  const { data: initialData, isLoading: isFetching } = useCompany(
    companyId || "",
  );
  const { mutateAsync: createCompany, isPending: isCreating } =
    useCreateCompany();
  const { mutateAsync: updateCompany, isPending: isUpdating } =
    useUpdateCompany();

  const [form, setForm] = useState<CompanyInput>(() => {
    if (companyId && initialData) {
      return {
        name: initialData.name || "",
        description: initialData.description || "",
        websiteUrl: initialData.websiteUrl || "",
        logoFile: null,
        removeLogo: false, // <-- Added flag
      };
    }
    return emptyForm;
  });
  const [previewUrl, setPreviewUrl] = useState<string>(() => {
    if (initialData?.logo) {
      return `${API_URL}/company/logo?id=${initialData.logo}`;
    }
    return "";
  });
  const [logoError, setLogoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update form when initialData changes (for edit mode)
  // eslint-disable react-hooks/exhaustive-deps
  useEffect(() => {
    if (initialData && companyId) {
      setForm({
        name: initialData.name || "",
        description: initialData.description || "",
        websiteUrl: initialData.websiteUrl || "",
        logoFile: null,
        removeLogo: false, // <-- Added flag
      });
      if (initialData.logo && initialData.logo !== NIL_UUID) {
        setPreviewUrl(`${API_URL}/company/logo?id=${initialData.logo}`);
      }
      else{
        setPreviewUrl("");
      }
    }
  }, [initialData, companyId]);

  // Handlers
  const handleChange =
    (field: keyof CompanyInput) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const processImageFile = (file: File | null | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setLogoError("Please upload an image file.");
      return;
    }

    const nameWithoutPath = file.name.split("\\").pop() || file.name;
    const dotCount = (nameWithoutPath.match(/\./g) || []).length;
    if (dotCount !== 1) {
      setLogoError("File must have exactly one extension (e.g., logo.png).");
      return;
    }

    setForm((prev) => ({ ...prev, logoFile: file, removeLogo: false }));

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(typeof reader.result === "string" ? reader.result : "");
      setLogoError(null);
    };
    reader.onerror = () => setLogoError("Failed to read the image file.");
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    processImageFile(event.target.files?.[0]);
  };

  const handleDropLogo = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    processImageFile(event.dataTransfer.files?.[0]);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Require logo ONLY on creation. If editing, they can keep the existing one.
    if (!companyId && !form.logoFile) {
      setLogoError("Upload a logo image.");
      return;
    }

    try {
      if (companyId) {
        await updateCompany({ id: companyId, input: form });
        toast.success("Company updated successfully!");
      } else {
        await createCompany(form);
        toast.success("Company created successfully!");
        // Reset form after creation
        setForm(emptyForm);
        setPreviewUrl("");
        setLogoError(null);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";
      toast.error(message);
    }
  };

  if (companyId && isFetching) {
    return <p className="text-muted-foreground p-6">Loading company data...</p>;
  }

  const isSubmitting = isCreating || isUpdating;

  return (
    <div className="flex justify-center mt-24 px-24">
      <div className="w-full max-w-7xl">
        <section className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {companyId ? "Update details" : "Add a new company"}
              </CardTitle>
              <CardDescription>
                {companyId
                  ? "Modify the profile information below."
                  : "Companies appear in the Jobs tab after they are added."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company name</Label>
                  <Input
                    id="company-name"
                    value={form.name}
                    onChange={handleChange("name")}
                    placeholder="KTH AI Society"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-description">Description</Label>
                  <Textarea
                    id="company-description"
                    value={form.description}
                    onChange={handleChange("description")}
                    placeholder="A brief description of the company"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-logo">Company logo</Label>
                  <div
                    className="rounded-md border border-dashed border-input p-4 text-sm text-muted-foreground cursor-pointer hover:bg-secondary/40 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={handleDropLogo}
                  >
                    Drag and drop a new logo here, or click to upload.
                  </div>
                  <Input
                    ref={fileInputRef}
                    id="company-logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  {previewUrl ? (
                    <div className="flex items-center gap-3 mt-2">
                      <div className="relative">
                        <img
                          src={previewUrl}
                          alt={`${form.name || "Company"} logo preview`}
                          className="h-12 w-12 rounded-md object-contain border bg-white"
                        ></img>
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="absolute -right-2 -top-2 h-6 w-6 rounded-full text-xs shadow"
                          onClick={() => {
                            // <-- Updated to set removeLogo to true and clear input
                            setForm((prev) => ({
                              ...prev,
                              logoFile: null,
                              removeLogo: true,
                            }));
                            setPreviewUrl("");
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  ) : null}
                  {logoError ? (
                    <p className="text-xs text-destructive">{logoError}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload a PNG or JPG file.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-website">Website URL</Label>
                  <Input
                    id="company-website"
                    value={form.websiteUrl}
                    onChange={handleChange("websiteUrl")}
                    placeholder="https://company.com"
                    required
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-4">
                  <Button type="submit" disabled={isSubmitting}>
                    {companyId
                      ? isUpdating
                        ? "Saving..."
                        : "Save changes"
                      : isCreating
                        ? "Adding..."
                        : "Add company"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}