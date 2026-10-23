"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateSponsor,
  SPONSOR_LOGO_MAX_BYTES,
  SPONSOR_LOGO_TYPES,
} from "@/hooks/sponsors";

export function SponsorForm({ onClose }: { onClose?: () => void }) {
  const { mutateAsync: createSponsor, isPending } = useCreateSponsor();

  const [name, setName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [logoError, setLogoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Object URLs hold the file in memory until revoked.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const clearLogo = () => {
    setLogoFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const selectLogo = (file: File | null | undefined) => {
    if (!file) return;
    // A rejected file also drops the previous one, so the preview never
    // shows a logo other than the one the error is about.
    if (!SPONSOR_LOGO_TYPES.includes(file.type)) {
      clearLogo();
      setLogoError("Logo must be a PNG, JPEG, WebP or SVG image.");
      return;
    }
    if (file.size > SPONSOR_LOGO_MAX_BYTES) {
      clearLogo();
      setLogoError("Logo must be at most 2 MB.");
      return;
    }
    setLogoError(null);
    setLogoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    selectLogo(event.dataTransfer.files?.[0]);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!logoFile) {
      setLogoError("Upload a logo image.");
      return;
    }

    try {
      await createSponsor({
        name: name.trim(),
        websiteUrl: websiteUrl.trim(),
        logoFile,
      });
      onClose?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="sponsor-name">
          Sponsor name <span className="text-destructive ml-0.5">*</span>
        </Label>
        <Input
          id="sponsor-name"
          value={name}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          placeholder="Dokploy"
          maxLength={100}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sponsor-logo">
          Logo <span className="text-destructive ml-0.5">*</span>
        </Label>
        {/* A real button so the picker can be opened with the keyboard. */}
        <button
          type="button"
          className="w-full rounded-md border border-dashed border-input p-4 text-left text-sm text-muted-foreground cursor-pointer hover:bg-secondary/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
        >
          Drag and drop a logo here, or click to upload.
        </button>
        <Input
          ref={fileInputRef}
          id="sponsor-logo"
          type="file"
          accept={SPONSOR_LOGO_TYPES.join(",")}
          onChange={(e: ChangeEvent<HTMLInputElement>) => selectLogo(e.target.files?.[0])}
          className="hidden"
        />
        {previewUrl ? (
          <div className="flex items-center gap-3 mt-2">
            <div className="relative">
              <Image
                src={previewUrl}
                alt={`${name || "Sponsor"} logo preview`}
                width={96}
                height={64}
                className="h-16 w-24 rounded-md object-contain border bg-white p-1"
                unoptimized
              />
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute -right-2 -top-2 h-6 w-6 rounded-full text-xs shadow"
                onClick={clearLogo}
                aria-label="Remove logo"
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
            PNG, JPEG, WebP or SVG, up to 2 MB. SVG looks sharpest.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="sponsor-website">Website URL</Label>
        <Input
          id="sponsor-website"
          type="url"
          value={websiteUrl}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setWebsiteUrl(e.target.value)}
          placeholder="https://dokploy.com"
        />
        <p className="text-xs text-muted-foreground">
          Optional. The logo links here on the sponsors page.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-4 border-t">
        {onClose && (
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Adding..." : "Add sponsor"}
        </Button>
      </div>
    </form>
  );
}
