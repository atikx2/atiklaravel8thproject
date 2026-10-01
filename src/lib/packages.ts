import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export type Package = {
  id: string;
  name: string;
  price: number;
  daily_ads: number;
  daily_income: number;
  validity_days: number;
  sort_order: number;
  is_active: boolean;
  ad_link: string;
};

export type MyPurchase = {
  id: string;
  package_id: string;
  price: number;
  daily_ads: number;
  daily_income: number;
  expires_at: string;
  created_at: string;
  packages: { name: string; ad_link: string } | null;
};

export function usePackages(all = false) {
  const { data } = useQuery({
    queryKey: ["packages", all],
    queryFn: async () => {
      let q = supabase.from("packages").select("*").order("sort_order");
      if (!all) q = q.eq("is_active", true);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Package[];
    },
  });
  return data ?? [];
}

/** All package purchases of the signed-in user (newest first). */
export function useMyPurchases() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-packages", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("package_purchases")
        .select("id,package_id,price,daily_ads,daily_income,expires_at,created_at,packages(name,ad_link)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as MyPurchase[];
    },
  });
}

/** Pending package deposits of the signed-in user. */
export function useMyPendingPackageIds() {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["my-pending-packages", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("deposits")
        .select("package_id")
        .eq("user_id", user!.id)
        .eq("status", "pending")
        .not("package_id", "is", null);
      return (data ?? []).map((d) => d.package_id as string);
    },
  });
  return data ?? [];
}

export const isActivePurchase = (p: { expires_at: string }) => new Date(p.expires_at).getTime() > Date.now();

/** Make admin-entered links like "fiverr.com" open as real external URLs. */
export function normalizeLink(link: string) {
  const l = (link ?? "").trim();
  if (!l) return "";
  return /^https?:\/\//i.test(l) ? l : `https://${l}`;
}
