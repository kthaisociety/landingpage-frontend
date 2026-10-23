import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { API_URL } from "@/config";

export type Sponsor = {
  id: string;
  name: string;
  websiteUrl: string;
  logo: string;
  sortOrder: number;
};

// New sponsors are added at the end of the list; admins reorder them with
// useReorderSponsors.
export type SponsorInput = {
  name: string;
  websiteUrl: string;
  logoFile: File;
};

// Mirrors the backend's checks in sponsor_handler.go, so mistakes show up
// before the upload instead of as a failed request.
export const SPONSOR_LOGO_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
];
export const SPONSOR_LOGO_MAX_BYTES = 2 * 1024 * 1024;

export function sponsorLogoUrl(sponsor: Pick<Sponsor, "id">) {
  return `${API_URL}/sponsors/${sponsor.id}/logo`;
}

async function errorMessage(res: Response, fallback: string) {
  const data = (await res.json().catch(() => null)) as { error?: string } | null;
  return data?.error || fallback;
}

export function useSponsors() {
  return useQuery<Sponsor[]>({
    queryKey: ["sponsors"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/sponsors`);
      if (!res.ok) throw new Error("Failed to fetch sponsors");
      return res.json();
    },
  });
}

export function useCreateSponsor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SponsorInput) => {
      const formData = new FormData();
      formData.append("name", input.name);
      formData.append("websiteUrl", input.websiteUrl);
      formData.append("logo", input.logoFile);

      const res = await fetch(`${API_URL}/admin/sponsors`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) throw new Error(await errorMessage(res, "Failed to add sponsor"));
      return res.json();
    },
    onSuccess: () => {
      toast.success("Sponsor added");
      queryClient.invalidateQueries({ queryKey: ["sponsors"] });
    },
  });
}

// Saves a new order for every sponsor at once. The backend answers 409 if
// the list no longer matches (someone added or removed a sponsor meanwhile).
export function useReorderSponsors() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await fetch(`${API_URL}/admin/sponsors/order`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error(await errorMessage(res, "Failed to save sponsor order"));
      return res.json();
    },
    // Wait for the refetch so the list doesn't flash back to the old order.
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sponsors"] });
      toast.success("Sponsor order saved");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save sponsor order");
      queryClient.invalidateQueries({ queryKey: ["sponsors"] });
    },
  });
}

export function useDeleteSponsor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/admin/sponsors/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(await errorMessage(res, "Failed to remove sponsor"));
      return res.json();
    },
    onSuccess: () => {
      toast.success("Sponsor removed");
      queryClient.invalidateQueries({ queryKey: ["sponsors"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove sponsor");
    },
  });
}
