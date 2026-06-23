"use client";

import * as React from "react";
import type { Session } from "@supabase/supabase-js";

import type { CurrentAppUser } from "@/lib/auth/types";
import { getCurrentAppUser } from "@/lib/auth/get-current-user";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  error: string | null;
  refreshUser: () => Promise<CurrentAppUser | null>;
  signIn: (email: string, password: string) => Promise<CurrentAppUser>;
  signOut: () => Promise<void>;
  status: AuthStatus;
  user: CurrentAppUser | null;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

async function resolveUserFromSession(session: Session | null) {
  if (!session) {
    return null;
  }

  return getCurrentAppUser(session);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = React.useMemo(() => createBrowserSupabaseClient(), []);
  const [user, setUser] = React.useState<CurrentAppUser | null>(null);
  const [status, setStatus] = React.useState<AuthStatus>("loading");
  const [error, setError] = React.useState<string | null>(null);

  const loadSession = React.useCallback(
    async (session: Session | null, signOutIfUnauthorized = true) => {
      setStatus("loading");
      setError(null);

      if (!session) {
        setUser(null);
        setStatus("unauthenticated");
        return null;
      }

      const profile = await resolveUserFromSession(session);

      if (!profile) {
        setUser(null);
        setStatus("unauthenticated");
        setError("Usuario inactivo o no autorizado.");

        if (signOutIfUnauthorized) {
          await supabase.auth.signOut();
        }

        return null;
      }

      setUser(profile);
      setStatus("authenticated");
      return profile;
    },
    [supabase]
  );

  React.useEffect(() => {
    let mounted = true;

    async function initialize() {
      const { data } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      await loadSession(data.session);
    }

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) {
        return;
      }

      void loadSession(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadSession, supabase]);

  async function signIn(email: string, password: string) {
    setError(null);
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !data.session) {
      throw new Error("Credenciales inválidas.");
    }

    const profile = await resolveUserFromSession(data.session);

    if (!profile) {
      await supabase.auth.signOut();
      setUser(null);
      setStatus("unauthenticated");
      throw new Error("Usuario inactivo o no autorizado.");
    }

    setUser(profile);
    setStatus("authenticated");
    return profile;
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setStatus("unauthenticated");
  }

  async function refreshUser() {
    const { data } = await supabase.auth.getSession();
    return loadSession(data.session, false);
  }

  const value: AuthContextValue = {
    error,
    refreshUser,
    signIn,
    signOut,
    status,
    user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider.");
  }

  return context;
}
