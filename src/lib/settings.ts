import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AppSettings = {
  id: string;
  bkash_number: string;
  nagad_number: string;
  min_withdraw: number;
  min_deposit: number;
  banner_image_url: string;
  /** নতুন রেজিস্ট্রেশন বোনাস (টাকা) — অ্যাডমিন প্যানেল থেকে বদলানো যায় */
  signup_bonus: number;
  /** একটি লিংক — প্যাকেজ/টাস্কে আলাদা লিংক না থাকলে এটাই ব্যবহার হয় */
  global_ad_link: string;
};

export const DEFAULT_SETTINGS: AppSettings = {
  id: "main",
  bkash_number: "01700000000",
  nagad_number: "01800000000",
  min_withdraw: 500,
  min_deposit: 100,
  banner_image_url: "",
  signup_bonus: 100,
  global_ad_link: "",
};

export function useSettings() {
  const { data } = useQuery({
    queryKey: ["app_settings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("*")
        .eq("id", "main")
        .maybeSingle();
      // ডিফল্টের সাথে মার্জ — কোনো কলাম এখনো মাইগ্রেট না হলেও UI ভাঙবে না
      return {
        ...DEFAULT_SETTINGS,
        ...((data as Partial<AppSettings> | null) ?? {}),
      } as AppSettings;
    },
  });
  return data ?? DEFAULT_SETTINGS;
}

export type PaymentNumber = {
  id: string;
  method: "bkash" | "nagad";
  number: string;
  label: string;
  is_active: boolean;
};

export function usePaymentNumbers() {
  const { data } = useQuery({
    queryKey: ["payment_numbers"],
    queryFn: async () => {
      const { data } = await supabase
        .from("payment_numbers")
        .select("*")
        .eq("is_active", true)
        .order("created_at");
      return (data ?? []) as PaymentNumber[];
    },
  });
  return data ?? [];
}
