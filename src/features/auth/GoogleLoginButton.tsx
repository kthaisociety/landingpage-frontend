"use client";

import { API_URL } from "@/shared/lib/config";

export function GoogleLoginButton() {
  const login = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/google`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Failed to fetch login URL:", error);
    }
  };

  return (
    <button
      type="button"
      onClick={login}
      className="
        inline-flex items-center justify-center
        rounded-xl px-6 py-3
        text-base font-semibold
        bg-primary text-white
        transition-all duration-300 ease-out
        hover:bg-primary/90
        hover:shadow-lg hover:-translate-y-0.5
      "
    >
      Member Login
    </button>
  );
}
