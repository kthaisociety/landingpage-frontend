"use client";

import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
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
import { useCompanies, type CompanyInput } from "@/hooks/companies";

const emptyForm: CompanyInput = {
  name: "",
  logoUrl: "",
  websiteUrl: "",
};

export function CompanyAdminPanel() {
  const { companies, createCompany } = useCompanies();
  const [form, setForm] = useState<CompanyInput>(emptyForm);
  const [logoError, setLogoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange =
    (field: keyof CompanyInput) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const processImageFile = (file: File | null | undefined) => {
    if (!file) {
      return;
    }

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

  const handleLogoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    processImageFile(event.target.files?.[0]);
  };

  const handleDropLogo = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    processImageFile(event.dataTransfer.files?.[0]);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.logoUrl) {
      setLogoError("Upload a logo image.");
      return;
    }
    createCompany(form);
    setForm(emptyForm);
    setLogoError(null);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Companies</h2>
          <p className="text-sm text-muted-foreground">
            Add company profiles once, then reuse them for job posts.
          </p>
        </div>
        <span className="text-xs text-muted-foreground">
          {companies.length} companies saved
        </span>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>New company</CardTitle>
            <CardDescription>
              Companies appear in the Jobs tab after they are added.
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
                <Label htmlFor="company-logo">Company logo</Label>
                <div
                  className="rounded-md border border-dashed border-input p-4 text-sm text-muted-foreground cursor-pointer hover:bg-secondary/40 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={handleDropLogo}
                >
                  Drag and drop a logo here, or click to upload.
                </div>
                <Input
                  ref={fileInputRef}
                  id="company-logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                {form.logoUrl ? (
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Image
                        src={form.logoUrl}
                        alt={`${form.name || "Company"} logo preview`}
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded-md border border-input object-contain"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="absolute -right-2 -top-2 h-6 w-6 rounded-full text-xs"
                        onClick={() =>
                          setForm((prev) => ({ ...prev, logoUrl: "" }))
                        }
                        aria-label="Remove logo"
                      >
                        x
                      </Button>
                    </div>
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
                <Label htmlFor="company-website">Website URL</Label>
                <Input
                  id="company-website"
                  value={form.websiteUrl}
                  onChange={handleChange("websiteUrl")}
                  placeholder="https://company.com"
                  required
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit">Add company</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
