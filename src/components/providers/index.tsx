"use client";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { makeStore, useAppDispatch } from "@/lib/model/store";
import type { AppStore } from "@/lib/model/store";
import { AuthInitializer } from "./auth-initializer";
import { QueryProvider } from "./query-provider";
import { Cookies } from "js-cookie";
import { decodeJWT } from "@/lib/model/slices/auth-slice/authSlice";

export function Providers({ children }: { children: React.ReactNode }) {
  const [store] = useState<AppStore>(() => makeStore());
  const dispatch = useAppDispatch();
  useEffect(() => {
    // Read the cookie
    const token = Cookies.get("session_token");
    dispatch(decodeJWT(token));
  }, []);

  return (
    <Provider store={store}>
      <QueryProvider>
        <AuthInitializer>{children}</AuthInitializer>
      </QueryProvider>
    </Provider>
  );
}
