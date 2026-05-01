"use client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import {Toaster} from "@/components/ui/sonner"
import { AuthProvider } from "@/lib/providers/auth-provider/authProvider";
import { QueryProvider } from "./query-provider";

export function Providers({ children }: { children: React.ReactNode }) {

  return (
    <QueryProvider>
      <AuthProvider>
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
        >
          {children}
          <Toaster />
        </GoogleOAuthProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
