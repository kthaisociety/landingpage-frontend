import { cn } from "@/lib/utils";

// Shared by the application and newsletter forms: a field is only shown as
// invalid once the user has left it, unless the caller forces errors to show
// (e.g. the application wizard's "review" step). Deliberately keyed off
// isBlurred rather than isTouched: TanStack Form flips isTouched to true on
// the very first keystroke, which would flag a field invalid while the user
// is still mid-typing (e.g. a half-typed email).
export function fieldIsInvalid(
  meta: { isBlurred: boolean; isValid: boolean },
  showErrors = false,
) {
  return (meta.isBlurred || showErrors) && !meta.isValid;
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
