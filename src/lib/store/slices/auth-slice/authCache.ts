import type { User } from "@/lib/store/slices/auth-slice/authSlice";

const CACHE_KEY = "_kthais_uc";
const CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export const saveUserToCache = (user: User) => {
  const payload = {
    user,
    expiresAt: Date.now() + CACHE_EXPIRATION_MS,
  };
  localStorage.setItem(CACHE_KEY, btoa(JSON.stringify(payload)));
};

export const checkUserCache = (): { exists: boolean; isExpired: boolean; user: User | null } => {
  const cached = localStorage.getItem(CACHE_KEY);
  
  if (!cached) return { exists: false, isExpired: false, user: null };

  try {
    const parsed = JSON.parse(atob(cached));
    if (Date.now() > parsed.expiresAt) {
      return { exists: true, isExpired: true, user: null };
    }
    return { exists: true, isExpired: false, user: parsed.user };
  } catch {
    return { exists: true, isExpired: true, user: null };
  }
};

export const clearUserCache = () => {
  localStorage.removeItem(CACHE_KEY);
};