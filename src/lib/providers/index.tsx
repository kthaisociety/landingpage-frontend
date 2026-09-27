"use client";
import {Toaster} from "@/components/ui/sonner"
import { AuthProvider } from "@/lib/providers/auth-provider/authProvider";
import { QueryProvider } from "./query-provider";

export function Providers({ children }: { children: React.ReactNode }) {

  return (
    <QueryProvider>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </QueryProvider>
  );
}
