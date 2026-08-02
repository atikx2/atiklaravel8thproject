import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  username: string;
  phone: string;
  balance: number;
  total_earned: number;
  has_deposited: boolean;
  is_blocked: boolean;
};

type AuthCtx = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  session: null,
  user: null,
  profile: null,
  isAdmin: false,
  loading: true,
  refresh: async () => {},
  signOut: async () => {},
});

export const emailForUsername = (username: string) =>
  `${username.trim().toLowerCase().replace(/[^a-z0-9_.]/g, "")}@smartjobbd26.app`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async (uid?: string) => {
    if (!uid) {
      setProfile(null);
      setIsAdmin(false);
      return;
    }
    const [{ data: p }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
    ]);
    setProfile((p as Profile) ?? null);
    setIsAdmin(Boolean(roles?.some((r) => r.role === "admin")));
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      void load(s?.user?.id);
    });
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      await load(data.session?.user?.id);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <Ctx.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        isAdmin,
        loading,
        refresh: () => load(session?.user?.id),
        signOut: async () => {
          await supabase.auth.signOut();
          setProfile(null);
          setIsAdmin(false);
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export const bn = (n: number | string) =>
  String(n).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)] ?? d);

export const taka = (n: number) =>
  `৳${bn(Number(n ?? 0).toLocaleString("en-US", { maximumFractionDigits: 2 }))}`;