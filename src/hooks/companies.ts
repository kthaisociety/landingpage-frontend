import { useEffect, useState } from "react";
import { toast } from "sonner";
import { API_URL } from "@/config";

export type Company = {
  id: string;
  name: string;
  logo: string;
};


export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const res = await fetch(`${API_URL}/company/getAllCompanies`);
        if (!res.ok) {
          throw new Error("Failed to fetch companies");
        }
        const data = await res.json();
        setCompanies(data || []);
      } catch (error) {
        console.error("Error fetching companies:", error);
        toast.error("Failed to load companies.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCompanies();
  }, []);

  return {
    companies,
    isLoading,
  };
}