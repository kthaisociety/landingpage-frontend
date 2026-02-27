"use client";

import { createContext, useContext } from "react";
import type { AuthContextType } from "@/types/auth";

export const AuthContext = createContext<AuthContextType | null>(null);
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
