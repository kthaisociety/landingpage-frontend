"use client";

import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { NIL_UUID } from "@/lib/constants/companies";
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

type CompanyFormFieldsProps = {
  companyId?: string;
  initialData: ReturnType<typeof useCompany>["data"];
  onClose?: () => void;
  createCompany: ReturnType<typeof useCreateCompany>["mutateAsync"];
  updateCompany: ReturnType<typeof useUpdateCompany>["mutateAsync"];
  isCreating: boolean;
  isUpdating: boolean;
};

function CompanyFormFields({
  companyId,
  initialData,
  onClose,
  createCompany,
  updateCompany,
  isCreating,
  isUpdating,
}: CompanyFormFieldsProps) {
  const [form, setForm] = useState<CompanyInput>(() => {
    if (companyId && initialData) {
      return {
        name: initialData.name || "",
        description: initialData.description || "",
        websiteUrl: initialData.websiteUrl || "",
        logoFile: null,
        removeLogo: false,
      };
    }
    return emptyForm;
  });
  const [previewUrl, setPreviewUrl] = useState<string>(() => {
    if (initialData?.logo && initialData.logo !== NIL_UUID) {
      return `${API_URL}/company/logo?id=${initialData.logo}`;
    }
    return "";
  });
  const [logoError, setLogoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        onClose?.();
      } else {
        await createCompany(form);
        setForm(emptyForm);
        setPreviewUrl("");
        setLogoError(null);
        onClose?.();
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";
      toast.error(message);
    }
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="company-name">
            Company name <span className="text-destructive ml-0.5">*</span>
          </Label>
          <Input
            id="company-name"
            value={form.name}
            onChange={handleChange("name")}
            placeholder="KTH AI Society"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company-description">
            Description <span className="text-destructive ml-0.5">*</span>
          </Label>
          <Textarea
            id="company-description"
            value={form.description}
            onChange={handleChange("description")}
            placeholder="A brief description of the company"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company-logo">
            Company logo <span className="text-destructive ml-0.5">*</span>
          </Label>
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
                <Image
                  src={previewUrl}
                  alt={`${form.name || "Company"} logo preview`}
                  width={48}
                  height={48}
                  className="rounded-md object-contain border bg-white"
                  unoptimized
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute -right-2 -top-2 h-6 w-6 rounded-full text-xs shadow"
                  onClick={() => {
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
          <Label htmlFor="company-website">
            Website URL <span className="text-destructive ml-0.5">*</span>
          </Label>
          <Input
            id="company-website"
            value={form.websiteUrl}
            onChange={handleChange("websiteUrl")}
            placeholder="https://company.com"
            required
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-4 border-t">
          {onClose && (
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          )}
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
    </div>
  );
}

export function CompanyForm({
  companyId,
  onClose,
}: {
  companyId?: string;
  onClose?: () => void;
}) {
  const { data: initialData, isLoading: isFetching } = useCompany(
    companyId || "",
  );
  const { mutateAsync: createCompany, isPending: isCreating } =
    useCreateCompany();
  const { mutateAsync: updateCompany, isPending: isUpdating } =
    useUpdateCompany();

  if (companyId && isFetching) {
    return <p className="text-muted-foreground p-6">Loading company data...</p>;
  }

  return (
    <CompanyFormFields
      key={companyId ?? "new"}
      companyId={companyId}
      initialData={initialData}
      onClose={onClose}
      createCompany={createCompany}
      updateCompany={updateCompany}
      isCreating={isCreating}
      isUpdating={isUpdating}
    />
  );
}
