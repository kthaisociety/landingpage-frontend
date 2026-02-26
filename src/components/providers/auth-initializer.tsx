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
        } catch (error) {
          clearUserCache();
          dispatch(clearUser());
        }
        return;
      }

      dispatch(clearUser());
      try {
        await triggerLogout().unwrap();
      } catch (error) {
      }
    };

    initializeAuth();
  }, [dispatch, triggerGetMe, triggerLogout]);

  return <>{children}</>;
}
