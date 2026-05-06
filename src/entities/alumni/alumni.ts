import { useQuery} from "@tanstack/react-query";
import type { Alumni } from "@/entities/alumni/alumni-types";



export function useAlumni() {
  return useQuery<Alumni[]>({
    queryKey: ["alumni"],
    queryFn: async () => {
        const response = await fetch("/alumniData.json");

        if (!response.ok) {
            throw new Error("Failed to fetch alumni data");
        }

        const data = await response.json();
        return data;
    },
  });
}


