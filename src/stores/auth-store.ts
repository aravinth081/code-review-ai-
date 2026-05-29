"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, AuthTokens } from "@/types/user";

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isLoading: true,

      setUser: (user) => set({ user }),
      setTokens: (tokens) => set({ tokens }),
      setLoading: (isLoading) => set({ isLoading }),

      logout: () => {
        set({ user: null, tokens: null });
        // Clear any auth cookies
        document.cookie =
          "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      },

      isAuthenticated: () => {
        const { user, tokens } = get();
        if (!user || !tokens) return false;
        // Check if access token is still valid (basic exp check)
        const expiresAt = tokens.expiresIn + Date.now();
        return expiresAt > Date.now();
      },

      isAdmin: () => {
        const { user } = get();
        return user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
      },
    }),
    {
      name: "codeguard-auth",
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
      }),
    }
  )
);
