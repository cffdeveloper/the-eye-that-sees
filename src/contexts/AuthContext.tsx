import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export type Profile = {
  id: string;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: string | null;
  organization: string | null;
  title: string | null;
  bio: string | null;
  industries_of_interest: string[];
  goals: string[];
  experience_level: string | null;
  preferred_regions: string[];
  onboarding_completed: boolean;
  /** Proactive gap agent — max USD for startup ideas (DB default 1000). */
  max_startup_capital_usd?: number | null;
  prefers_business_that_employs?: boolean | null;
  proactive_monitoring?: string | null;
  primary_market?: string | null;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (error) {
      console.error("Profile fetch error:", error.message);
      return;
    }
    if (data) {
      setProfile(data as Profile);
    } else {
      // Profile doesn't exist yet — create one
      const { data: userData } = await supabase.auth.getUser();
      const meta = userData?.user?.user_metadata;
      const { data: newProfile } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          full_name: meta?.full_name || meta?.name || "",
          avatar_url: meta?.avatar_url || "",
        })
        .select("*")
        .single();
      if (newProfile) setProfile(newProfile as Profile);
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => fetchProfile(session.user.id), 0);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
