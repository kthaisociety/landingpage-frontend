"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useGoogleLoginMutation, useLazyGetMeQuery, useLogoutMutation } from "@/lib/apis/internal-apis";
import type { User } from "@/types/auth";
import { AuthContext } from "@/hooks/auth";
import { checkUserCache, saveUserToCache, clearUserCache } from "./authCache";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [triggerGetMe] = useLazyGetMeQuery();
  const [triggerLogout] = useLogoutMutation();
  const [triggerGoogleLogin] = useGoogleLoginMutation();

  const loginUser = useCallback(
    async function (code: string) {
      try {
        const result = await triggerGoogleLogin(code).unwrap();
        if (result.user) {
          setUser(result.user);
          saveUserToCache(result.user);
          router.push("/");
        }
      } catch (error) {
        console.error("Login failed", error);
      }
    },
    [triggerGoogleLogin, router],
  );

  const logoutUser = useCallback(
    async function () {
      setUser(null);
      clearUserCache();
      try {
        await triggerLogout().unwrap();
      } catch {
        /* empty */
      }
    },
    [triggerLogout],
  );

  useEffect(
    function () {
      async function initializeAuth() {
        setIsLoading(true);
        const { exists, isExpired, user: cachedUser } = checkUserCache();
        const hasCheckedCache =
          localStorage.getItem("_kthais_auth_checked") === "true";

        if (exists && !isExpired && cachedUser) {
          setUser(cachedUser);
          setIsLoading(false);
          return;
        }
        if (exists && isExpired) {
          try {
            const data = await triggerGetMe().unwrap();
            if (data?.user) {
                setUser(data.user);
                saveUserToCache(data.user);
            } else {
              logoutUser();
            }
          } catch {
            logoutUser();
          }
          localStorage.setItem("_kthais_auth_checked", "true");
          setIsLoading(false);
          return;
        }
        if (!hasCheckedCache) {
          await logoutUser();
          localStorage.setItem("_kthais_auth_checked", "true");
        }

        setIsLoading(false);
      }

      initializeAuth();
    },
    [triggerGetMe, loginUser, logoutUser],
  );

  const contextValue = useMemo(
    () => ({
      user,
      isLoggedIn: !!user,
      isLoading,
      loginUser,
      logoutUser,
    }),
    [user, isLoading, loginUser, logoutUser],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

