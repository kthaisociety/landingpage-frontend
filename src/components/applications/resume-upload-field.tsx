"use client";

import { useRef, useState } from "react";
import { FileText, Upload, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const RESUME_ACCEPT =
  ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

type ResumeUploadFieldProps = {
  id: string;
  value: File | null;
  onChange: (file: File | null) => void;
  onBlur?: () => void;
  invalid?: boolean;
  inputKey?: number;
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileExtension(name: string) {
  return name.split(".").pop()?.toUpperCase() ?? "FILE";
}

export function ResumeUploadField({
  id,
  value,
  onChange,
  onBlur,
  invalid,
  inputKey,
}: ResumeUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function openFilePicker() {
    inputRef.current?.click();
  }

  function handleFile(file: File | null) {
    onChange(file);
    onBlur?.();
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    handleFile(event.target.files?.[0] ?? null);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  }

  function handleRemove() {
    handleFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <input
        key={inputKey}
        ref={inputRef}
        id={id}
        name={id}
        type="file"
        accept={RESUME_ACCEPT}
        className="sr-only"
        aria-invalid={invalid}
        onBlur={onBlur}
        onChange={handleInputChange}
      />

      {value ? (
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg border bg-white p-4 shadow-sm",
            invalid && "border-destructive",
          )}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{value.name}</p>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>{formatFileSize(value.size)}</span>
              <span className="text-gray-300">·</span>
              <span className="rounded-md bg-muted px-1.5 py-0.5 font-medium text-secondary-black">
                {getFileExtension(value.name)}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={openFilePicker}
            >
              Replace
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Remove resume"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload resume"
          onClick={openFilePicker}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openFilePicker();
            }
          }}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            if (!event.currentTarget.contains(event.relatedTarget as Node)) {
              setIsDragging(false);
            }
          }}
          onDrop={handleDrop}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-5 text-center transition-colors",
            "hover:border-primary/40 hover:bg-primary/5",
            isDragging && "border-primary bg-primary/5",
            invalid
              ? "border-destructive/60 bg-destructive/5"
              : "border-input bg-white/60",
          )}
        >
          <div
            className={cn(
              "mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-colors",
              isDragging && "bg-primary/10 text-primary",
            )}
          >
            <Upload className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </div>
          <p className="text-sm font-medium text-secondary-black">
            {isDragging ? "Drop your resume here" : "Upload your resume"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Drag and drop or{" "}
            <span className="font-medium text-primary underline-offset-4 hover:underline">
              browse files
            </span>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            PDF, DOC, or DOCX · Max 10 MiB
          </p>
        </div>
      )}
    </div>
  );
}
