"use client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "@/lib/providers/auth-provider/authProvider";
import { QueryProvider } from "./query-provider";

export function Providers({ children }: { children: React.ReactNode }) {

  return (
      <QueryProvider>
        <AuthProvider>
          <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
            {children}
          </GoogleOAuthProvider>
        </AuthProvider>
      </QueryProvider>
  );
}
