"use client";

import { useState, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

/**
 * Side panel that admin create/edit forms open in, so the list behind it
 * stays in place. Closing it by accident (Esc, clicking outside, the X)
 * asks before throwing away anything typed in; the form's own Save and
 * Cancel buttons call `onClose` directly and close it without asking.
 */
export function AdminFormSheet({
  open,
  title,
  description,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description: ReactNode;
  onClose: () => void;
  children: ReactNode;
}) {
  // Set by any input event bubbling up from the form, so the form
  // components themselves don't need to report whether they were edited.
  const [isDirty, setIsDirty] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  // Start every opening clean, however the previous one was closed.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setIsDirty(false);
      setConfirmDiscard(false);
    }
  }

  const markDirty = () => setIsDirty(true);
  const discard = () => {
    setConfirmDiscard(false);
    onClose();
  };

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(next) => {
          if (next) return;
          if (isDirty) setConfirmDiscard(true);
          else onClose();
        }}
      >
        <SheetContent
          side="right"
          className="data-[side=right]:w-full data-[side=right]:sm:max-w-lg"
        >
          <SheetHeader className="border-b pr-12">
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </SheetHeader>
          <div
            className="flex-1 overflow-y-auto px-4 pb-4"
            onInput={markDirty}
            onChange={markDirty}
            onDrop={markDirty}
          >
            {children}
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmDiscard} onOpenChange={setConfirmDiscard}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. If you close now, they will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={discard}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
