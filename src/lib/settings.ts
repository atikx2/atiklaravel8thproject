import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AppSettings = {
  id: string;
  bkash_number: string;
  nagad_number: string;
  min_withdraw: number;
  min_deposit: number;
};

export const DEFAULT_SETTINGS: AppSettings = {
  id: "main",
  bkash_number: "01700000000",
  nagad_number: "01800000000",
  min_withdraw: 500,
  min_deposit: 100,
};

export function useSettings() {
  const { data } = useQuery({
    queryKey: ["app_settings"],
    queryFn: async () => {
      const { data } = await supabase.from("app_settings").select("*").eq("id", "main").maybeSingle();
      return (data as AppSettings | null) ?? DEFAULT_SETTINGS;
    },
  });
  return data ?? DEFAULT_SETTINGS;
}
