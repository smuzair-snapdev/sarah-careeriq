"use client";

import { useMemo } from "react";
import { useAuth as useClerkAuth, useUser } from "@clerk/nextjs";

export function useAuth() {
  const { isLoaded, userId, sessionId, getToken, signOut } = useClerkAuth();
  const { user } = useUser();

  const userObj = useMemo(() => {
    return user ? {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress || "",
      name: user.fullName || "",
    } : null;
  }, [user?.id, user?.primaryEmailAddress?.emailAddress, user?.fullName]);

  return {
    isLoaded,
    userId,
    sessionId,
    getToken,
    isAuthenticated: !!userId,
    user: userObj,
    // Legacy support / compatibility
    loading: !isLoaded,
    login: async () => {}, // No-op, handled by Clerk components
    register: async () => {}, // No-op
    logout: async () => { await signOut(); },
  };
}

// Deprecated AuthProvider - ClerkProvider handles this now
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
