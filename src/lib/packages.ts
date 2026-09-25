import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

export function usePackages(all = false) {
  const { data } = useQuery({
    queryKey: ["packages", all],
    queryFn: async () => {
      let q = supabase.from("packages").select("*").order("sort_order");
      if (!all) q = q.eq("is_active", true);
      const { data } = await q;
      return (data ?? []) as Package[];
    },
  });
  return data ?? [];
}
