"use client";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/store";
import { setUser, clearUser, setLoading } from "@/lib/store/slices/auth-slice/authSlice";
import { checkUserCache, saveUserToCache, clearUserCache } from "@/lib/store/slices/auth-slice/authCache";
import { useLazyGetMeQuery, useLogoutMutation } from "@/lib/apis/internal-apis";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const [triggerGetMe] = useLazyGetMeQuery();
  const [triggerLogout] = useLogoutMutation();


  useEffect(() => {
    if (isLoggedIn) return;
    const initializeAuth = async () => {
      dispatch(setLoading(true));

      const { exists, isExpired, user } = checkUserCache();
      const hasCheckedCache = localStorage.getItem("_kthais_auth_checked") === "true";

      if (exists && !isExpired && user) {
        dispatch(setUser(user));
        return;
      }

      if (exists && isExpired) {
        try {
          const  data  = await triggerGetMe().unwrap();
          
          if (data?.user) {
            dispatch(setUser(data.user));
            saveUserToCache(data.user);
          } else {
            clearUserCache();
            dispatch(clearUser());
          }
        } catch {
          // Failed to fetch updated user data
          clearUserCache();
          dispatch(clearUser());
        }
        localStorage.setItem("_kthais_auth_checked", "true");
        return;
      }

      if (!hasCheckedCache) {
        try {
          await triggerLogout().unwrap();
        } catch {
          // Logout failed silently
        }
        localStorage.setItem("_kthais_auth_checked", "true");
      }

      dispatch(clearUser());
    };

    initializeAuth();
  }, [dispatch, triggerGetMe, triggerLogout, isLoggedIn]);

  return children;
}
