"use client";

import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { studyPrograms as fallbackStudyPrograms } from "@/lib/constants/study-programs";
import { isUsableKthProgrammeTitle } from "@/lib/kth-programmes";
import { useKthProgrammes } from "@/hooks/kth-programmes";

interface ProgrammeSelectProps {
  id: string;
  label?: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ProgrammeSelect({
  id,
  label = "Programme",
  value,
  onValueChange,
  placeholder = "Select your programme",
  disabled = false,
}: ProgrammeSelectProps) {
  const { data, isError } = useKthProgrammes();
  const baseList = useMemo(() => {
    const raw =
      !isError && data && data.length > 0 ? data : fallbackStudyPrograms;
    return raw.filter(isUsableKthProgrammeTitle);
  }, [data, isError]);

  const options = useMemo(() => {
    const trimmed = value?.trim();
    if (!trimmed || baseList.includes(trimmed)) return baseList;
    return [trimmed, ...baseList];
  }, [baseList, value]);

  return (
    <div className="space-y-2 min-w-0 w-full max-w-md">
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <Select
        value={value || undefined}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger id={id} className="w-full min-w-0 max-w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-[min(24rem,70vh)] max-w-md">
          {options.map((program) => (
            <SelectItem
              key={program}
              value={program}
              className="whitespace-normal break-words py-2 pr-8"
            >
              {program}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
