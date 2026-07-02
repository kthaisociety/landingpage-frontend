"use client";

import { useMemo, useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { studyPrograms as fallbackStudyPrograms } from "@/lib/constants/study-programs";
import { isUsableKthProgrammeTitle } from "@/lib/kth-programmes";
import { cn } from "@/lib/utils";
import { useKthProgrammes } from "@/hooks/kth-programmes";

interface ProgrammeSelectProps {
  id: string;
  label?: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  customOptions?: string[];
}

export function ProgrammeSelect({
  id,
  label = "Programme",
  value,
  onValueChange,
  placeholder = "Select your programme",
  disabled = false,
  customOptions = [],
}: ProgrammeSelectProps) {
  const [open, setOpen] = useState(false);
  const { data, isError } = useKthProgrammes();
  const baseList = useMemo(() => {
    const raw =
      !isError && data && data.length > 0 ? data : fallbackStudyPrograms;
    return raw.filter(isUsableKthProgrammeTitle);
  }, [data, isError]);

  const options = useMemo(() => {
    const trimmed = value?.trim();
    const list = [...baseList, ...customOptions];
    const optionsWithValue = !trimmed || list.includes(trimmed)
      ? list
      : [trimmed, ...list];
    return Array.from(new Set(optionsWithValue));
  }, [baseList, customOptions, value]);

  return (
    <div className="space-y-2 min-w-0 w-full max-w-md">
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label={label ?? "Programme"}
            disabled={disabled}
            className="h-auto min-h-9 w-full justify-between whitespace-normal px-3 py-2 text-left font-normal"
          >
            <span
              className={cn(
                "min-w-0 flex-1 truncate",
                !value && "text-muted-foreground",
              )}
            >
              {value || placeholder}
            </span>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-(--radix-popover-trigger-width) p-0">
          <Command>
            <CommandInput placeholder="Search programmes..." />
            <CommandList>
              <CommandEmpty>No programmes found.</CommandEmpty>
              <CommandGroup>
                {options.map((program) => (
                  <CommandItem
                    key={program}
                    value={program}
                    data-checked={value === program}
                    onSelect={(selectedProgramme) => {
                      onValueChange(selectedProgramme);
                      setOpen(false);
                    }}
                    className="whitespace-normal break-words"
                  >
                    <span className="min-w-0 flex-1">{program}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
