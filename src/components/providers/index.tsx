"use client";
import { useState } from "react";
import { Provider } from "react-redux";
import { makeStore } from "@/lib/store/store";
import type { AppStore } from "@/lib/store/store";
import { AuthInitializer } from "./auth-initializer";
import { QueryProvider } from "./query-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [store] = useState<AppStore>(() => makeStore());

  return (
    <Provider store={store}>
      <QueryProvider>
        <AuthInitializer>{children}</AuthInitializer>
      </QueryProvider>
    </Provider>
  );
}
