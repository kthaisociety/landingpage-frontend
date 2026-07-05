import { cn } from "@/lib/utils";

// Shared by the application and newsletter forms: a field is only shown as
// invalid once the user has interacted with it, unless the caller forces
// errors to show (e.g. the application wizard's "review" step).
export function fieldIsInvalid(
  meta: { isTouched: boolean; isValid: boolean },
  showErrors = false,
) {
  return (meta.isTouched || showErrors) && !meta.isValid;
}

export function selectableOptionBoxClassName(
  isSelected: boolean,
  isInvalid = false,
) {
  return cn(
    "flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-secondary/20",
    isSelected && "border-primary/40 bg-primary/5",
    isInvalid && !isSelected && "border-destructive/50",
  );
}
