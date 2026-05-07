import { useQuery } from "@tanstack/react-query";

export function useKthProgrammes() {
  return useQuery<string[]>({
    queryKey: ["kth-programmes"],
    queryFn: async () => {
      const res = await fetch("/api/kth-programmes");
      if (!res.ok) throw new Error("Failed to load programmes");
      return res.json() as Promise<string[]>;
    },
    staleTime: 24 * 60 * 60 * 1000,
  });
}
