"use client";
import { useState } from "react";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { makeStore } from "@/lib/store/store";
import type { AppStore } from "@/lib/store/store";
import { AuthProvider } from "@/components/providers/auth-provider/authProvider";
import { QueryProvider } from "./query-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [store] = useState<AppStore>(function () {
    return makeStore();
  });

  return (
    <Provider store={store}>
      <QueryProvider>
        <AuthProvider>
          <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
            {children}
          </GoogleOAuthProvider>
        </AuthProvider>
      </QueryProvider>
    </Provider>
  );
}
