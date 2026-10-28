import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { SpotifyEarworm } from "@/lib/spotify-earworm";

async function fetchEarworm(key: string): Promise<SpotifyEarworm | null> {
  const res = await fetch(
    `/api/member/profile/touches?key=${encodeURIComponent(key)}`,
  );
  if (!res.ok) {
    throw new Error(`Failed to load earworm: ${res.status}`);
  }
  const data = (await res.json()) as { earworm: SpotifyEarworm | null };
  return data.earworm;
}

async function saveEarworm(input: {
  key: string;
  aliases?: string[];
  url: string;
  label?: string;
  clear?: boolean;
}): Promise<SpotifyEarworm | null> {
  const res = await fetch("/api/member/profile/touches", {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: string }).error || `Save failed (${res.status})`,
    );
  }
  const data = (await res.json()) as { earworm: SpotifyEarworm | null };
  return data.earworm;
}

export function useProfileEarworm(key: string | undefined) {
  return useQuery({
    queryKey: ["profile-earworm", key],
    queryFn: () => fetchEarworm(key!),
    enabled: Boolean(key),
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
}

export function useSaveProfileEarworm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveEarworm,
    onSuccess: (_data, variables) => {
      const keys = [variables.key, ...(variables.aliases ?? [])];
      for (const key of keys) {
        queryClient.invalidateQueries({ queryKey: ["profile-earworm", key] });
      }
    },
  });
}
