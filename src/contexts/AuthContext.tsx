import { createContext, useContext, type ReactNode } from "react";
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
  max_startup_capital_usd?: number | null;
  prefers_business_that_employs?: boolean | null;
  proactive_monitoring?: string | null;
  primary_market?: string | null;
  credit_balance_usd?: number | null;
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
  loading: false,
  signOut: async () => {},
  refreshProfile: async () => {},
});

/** No Supabase Auth in the client — backend uses shared `APP_SHARED_USER_ID` only. */
export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider
      value={{
        user: null,
        session: null,
        profile: null,
        loading: false,
        signOut: async () => {},
        refreshProfile: async () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
