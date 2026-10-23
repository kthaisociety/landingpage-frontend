"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, ExternalLink, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useDeleteSponsor,
  useReorderSponsors,
  useSponsors,
  sponsorLogoUrl,
  type Sponsor,
} from "@/hooks/sponsors";
import { SponsorForm } from "@/components/admin/sponsors/sponsor-form";

function sameIds(a: string[], b: Sponsor[]) {
  if (a.length !== b.length) return false;
  const ids = new Set(b.map((s) => s.id));
  return a.every((id) => ids.has(id));
}

export function SponsorAdminPanel() {
  const { data: sponsors, isLoading, isError } = useSponsors();
  const { mutate: deleteSponsor, isPending: isDeleting } = useDeleteSponsor();
  const { mutate: saveOrder, isPending: isSavingOrder } = useReorderSponsors();
  const [isFormOpen, setIsFormOpen] = useState(false);
  // Unsaved order, as sponsor IDs. Ignored once it no longer matches the
  // loaded list (a sponsor was added or removed), so it can't be saved stale.
  const [draftIds, setDraftIds] = useState<string[] | null>(null);
  // Read out by screen readers after each move (see the aria-live region).
  const [moveAnnouncement, setMoveAnnouncement] = useState("");

  const hasDraft = !!(draftIds && sponsors && sameIds(draftIds, sponsors));
  const ordered = useMemo(() => {
    if (!sponsors) return undefined;
    if (!hasDraft || !draftIds) return sponsors;
    const byId = new Map(sponsors.map((s) => [s.id, s]));
    return draftIds.map((id) => byId.get(id)!);
  }, [sponsors, draftIds, hasDraft]);

  const move = (index: number, offset: -1 | 1) => {
    if (!ordered) return;
    const ids = ordered.map((s) => s.id);
    const target = index + offset;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    setDraftIds(ids);
    setMoveAnnouncement(
      `${ordered[index].name} moved to position ${target + 1} of ${ids.length}.`,
    );
  };

  // The draft is only cleared on success, so a failed save can be retried
  // without redoing the moves. After a 409 the hook refetches the list, the
  // IDs stop matching and hasDraft drops the stale draft on its own.
  const handleSaveOrder = () => {
    if (!ordered) return;
    saveOrder(
      ordered.map((s) => s.id),
      { onSuccess: () => setDraftIds(null) },
    );
  };

  return (
    <section className="space-y-6">
      {!isFormOpen && (
        <div className="flex justify-end">
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Sponsor
          </Button>
        </div>
      )}

      {isFormOpen && (
        <Card className="border-primary/30 shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div>
              <CardTitle>New Sponsor</CardTitle>
              <CardDescription className="mt-1">
                Sponsors appear on the public sponsors page as soon as they are added.
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => setIsFormOpen(false)}
              aria-label="Close form"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <SponsorForm onClose={() => setIsFormOpen(false)} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <CardTitle>All Sponsors</CardTitle>
            <CardDescription>
              {hasDraft
                ? "You have unsaved changes to the order."
                : "Shown on the sponsors page in this order. Use the arrows to rearrange."}
            </CardDescription>
          </div>
          {hasDraft && (
            <div className="flex shrink-0 gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDraftIds(null)}
                disabled={isSavingOrder}
              >
                Reset
              </Button>
              <Button size="sm" onClick={handleSaveOrder} disabled={isSavingOrder}>
                {isSavingOrder ? "Saving..." : "Save order"}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="sr-only" aria-live="polite">
            {moveAnnouncement}
          </p>
          {isLoading && (
            <p className="text-sm text-muted-foreground">Loading sponsors...</p>
          )}
          {isError && (
            <p className="text-sm text-destructive">Failed to load sponsors.</p>
          )}

          {ordered && (
            <div className="rounded-md border">
              {ordered.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No sponsors yet. Click New Sponsor to add one.
                </div>
              ) : (
                <div className="divide-y">
                  {ordered.map((sponsor, index) => (
                    <div
                      key={sponsor.id}
                      className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center hover:bg-secondary/10 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1 overflow-hidden">
                        <div className="flex shrink-0 flex-col gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => move(index, -1)}
                            disabled={index === 0 || isSavingOrder}
                            aria-label={`Move ${sponsor.name} up`}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => move(index, 1)}
                            disabled={index === ordered.length - 1 || isSavingOrder}
                            aria-label={`Move ${sponsor.name} down`}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </div>
                        <Image
                          src={sponsorLogoUrl(sponsor)}
                          alt={`${sponsor.name} logo`}
                          width={72}
                          height={48}
                          className="h-12 w-[72px] shrink-0 rounded-md object-contain border bg-white p-1"
                          unoptimized
                        />
                        <div className="space-y-1 overflow-hidden">
                          <p className="font-medium">{sponsor.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {sponsor.websiteUrl ? (
                              <a
                                href={sponsor.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 hover:underline"
                              >
                                {sponsor.websiteUrl}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              "No website link"
                            )}
                          </p>
                        </div>
                      </div>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={isDeleting || hasDraft || isSavingOrder}
                            title={hasDraft ? "Save or reset the order first" : undefined}
                            className="shrink-0"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove {sponsor.name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              <strong>{sponsor.name}</strong> and its logo will be
                              removed from the sponsors page right away. To show
                              them again, add them as a new sponsor.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteSponsor(sponsor.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Yes, remove sponsor
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
