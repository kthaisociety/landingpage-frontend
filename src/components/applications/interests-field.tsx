"use client";

import { useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { APPLICATION_INTERESTS, type ApplicationInterest } from "@/types/applications";

type InterestsFieldProps = {
  id: string;
  value: ApplicationInterest[];
  onChange: (value: ApplicationInterest[]) => void;
  onBlur?: () => void;
  isInvalid?: boolean;
  errors?: Array<{ message?: string } | undefined>;
  description?: string;
};

export function InterestsField({
  id,
  value,
  onChange,
  onBlur,
  isInvalid = false,
  errors,
  description = "Select at least one industry or area you'd like to explore.",
}: InterestsFieldProps) {
  const [open, setOpen] = useState(false);

  function toggleInterest(interest: ApplicationInterest) {
    onChange(
      value.includes(interest)
        ? value.filter((selected) => selected !== interest)
        : [...value, interest],
    );
  }

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>Areas of interest</FieldLabel>
      <FieldDescription>{description}</FieldDescription>
      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            onBlur?.();
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-invalid={isInvalid}
            className="h-auto min-h-9 w-full justify-between px-3 py-2 text-left font-normal"
          >
            <span
              className={cn(
                "min-w-0 flex-1 truncate",
                value.length === 0 && "text-muted-foreground",
              )}
            >
              {value.length > 0
                ? `${value.length} selected`
                : "Select areas of interest"}
            </span>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-(--radix-popover-trigger-width) p-0"
        >
          <Command>
            <CommandList>
              <CommandGroup>
                {APPLICATION_INTERESTS.map((interest) => {
                  const isSelected = value.includes(interest);
                  return (
                    <CommandItem
                      key={interest}
                      value={interest}
                      onSelect={() => toggleInterest(interest)}
                      className="gap-2"
                    >
                      <Checkbox
                        checked={isSelected}
                        className="pointer-events-none"
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1 whitespace-normal break-words">
                        {interest}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {errors && errors.length > 0 ? <FieldError errors={errors} /> : null}
    </Field>
  );
}
