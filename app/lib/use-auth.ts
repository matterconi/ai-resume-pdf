import { useState, useEffect, useCallback } from "react";
import { authClient } from "~/lib/auth-client";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data } = await authClient.getSession();
      console.log("[useAuth] session data:", data);
      setUser(data?.user ?? null);
      setIsAuthenticated(!!data?.user);
    } catch (err) {
      console.error("[useAuth] getSession error:", err);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signInWithGoogle = useCallback(async (callbackURL?: string) => {
    try {
      const { data, error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: callbackURL || "/resume",
      });
      if (error) {
        console.error("[useAuth] Google sign-in error:", error);
        throw new Error(error.message || "Google sign-in failed");
      }
      console.log("[useAuth] Google sign-in data:", data);
      // Fallback: se better-auth non fa redirect automaticamente, usiamo l'URL
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error("[useAuth] signInWithGoogle exception:", err);
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    await authClient.signOut();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    signInWithGoogle,
    signOut,
    refresh,
  };
}
