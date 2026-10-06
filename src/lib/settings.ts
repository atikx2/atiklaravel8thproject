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

/**
 * মাইগ্রেশন ছাড়াই নতুন সেটিংস রাখার ঘর।
 * ডাটাবেসে নতুন কলাম যোগ করার অ্যাকসেস না থাকলে app_settings-এর `extra` সারিতে
 * JSON আকারে মান রাখা হয় (সারিটি সাইটের কোথাও দেখানো হয় না)।
 */
export const EXTRA_ROW_ID = "extra";

export type ExtraSettings = Partial<Pick<AppSettings, "signup_bonus" | "global_ad_link">>;

export function parseExtra(raw?: string | null): ExtraSettings {
  if (!raw) return {};
  try {
    const v = JSON.parse(raw) as unknown;
    return v && typeof v === "object" ? (v as ExtraSettings) : {};
  } catch {
    return {};
  }
}

export function useSettings() {
  const { data } = useQuery({
    queryKey: ["app_settings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("*")
        .in("id", ["main", EXTRA_ROW_ID]);
      const rows = (data ?? []) as Partial<AppSettings>[];
      const main = rows.find((r) => r.id === "main") ?? {};
      const extra = parseExtra(rows.find((r) => r.id === EXTRA_ROW_ID)?.banner_image_url);

      // ডিফল্টের সাথে মার্জ — কোনো কলাম এখনো যোগ না হলেও UI ভাঙবে না
      const merged = { ...DEFAULT_SETTINGS, ...main, id: "main" } as AppSettings;
      if (main.signup_bonus == null && extra.signup_bonus != null)
        merged.signup_bonus = Number(extra.signup_bonus);
      if (!merged.global_ad_link?.trim() && extra.global_ad_link)
        merged.global_ad_link = extra.global_ad_link;
      return merged;
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
