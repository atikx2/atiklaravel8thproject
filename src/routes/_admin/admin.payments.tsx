import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings, EXTRA_ROW_ID } from "@/lib/settings";
import { AdminPage, AdminField, Empty } from "@/components/admin/ui";
import { Smartphone, Plus, Trash2, Loader2, Settings2, Link2 } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/payments")({
  head: () => ({
    meta: [
      { title: "সেটিংস ও পেমেন্ট | অ্যাডমিন" },
      { name: "description", content: "বিকাশ ও নগদ ডিপোজিট নাম্বার যোগ, বন্ধ বা মুছে ফেলুন।" },
      { property: "og:title", content: "পেমেন্ট নাম্বার | অ্যাডমিন" },
      { property: "og:description", content: "পেমেন্ট নাম্বার ও লিমিট নিয়ন্ত্রণ।" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PaymentsAdmin,
});

function PaymentsAdmin() {
  const qc = useQueryClient();
  const [method, setMethod] = useState<"bkash" | "nagad">("bkash");
  const [number, setNumber] = useState("");
  const [label, setLabel] = useState("পার্সোনাল");
  const [err, setErr] = useState("");

  const { data } = useQuery({
    queryKey: ["admin", "payment_numbers"],
    queryFn: async () => {
      const { data } = await supabase.from("payment_numbers").select("*").order("created_at");
      return data ?? [];
    },
  });

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!/^01[0-9]{9}$/.test(number.trim())) return setErr("সঠিক নাম্বার দিন");
    const { error } = await supabase
      .from("payment_numbers")
      .insert({ method, number: number.trim(), label: label.trim() || "পার্সোনাল" });
    if (error) return setErr("যোগ করা যায়নি");
    setNumber("");
    void qc.invalidateQueries();
  };

  return (
    <AdminPage
      title="সেটিংস ও পেমেন্ট"
      subtitle="ডিপোজিট নাম্বার, লিমিট, বোনাস ও বিজ্ঞাপন লিংক"
      icon={Smartphone}
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="space-y-4">
          <form onSubmit={add} className="surface-card space-y-3 p-4">
            <h2 className="font-display text-base font-bold">নতুন নাম্বার যোগ করুন</h2>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["bkash", "বিকাশ"],
                  ["nagad", "নগদ"],
                ] as const
              ).map(([k, l]) => (
                <button
                  type="button"
                  key={k}
                  onClick={() => setMethod(k)}
                  className={`rounded-xl border py-2 text-xs font-bold ${
                    method === k
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-secondary/60"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            <AdminField
              label="নাম্বার"
              value={number}
              onChange={setNumber}
              placeholder="01XXXXXXXXX"
            />
            <AdminField
              label="লেবেল"
              value={label}
              onChange={setLabel}
              placeholder="পার্সোনাল / এজেন্ট"
            />
            {err && <p className="text-sm text-destructive">{err}</p>}
            <button className="bg-brand flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-primary-foreground">
              <Plus className="h-4 w-4" /> যোগ করুন
            </button>
          </form>
          <LimitsForm />
        </div>

        <div className="space-y-2">
          {(data ?? []).map((n) => (
            <div key={n.id} className="surface-card flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate font-mono text-sm font-bold">{n.number}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {n.method === "bkash" ? "বিকাশ" : "নগদ"} · {n.label}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={async () => {
                    await supabase
                      .from("payment_numbers")
                      .update({ is_active: !n.is_active })
                      .eq("id", n.id);
                    void qc.invalidateQueries();
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                    n.is_active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {n.is_active ? "সক্রিয়" : "বন্ধ"}
                </button>
                <button
                  aria-label="মুছুন"
                  onClick={async () => {
                    await supabase.from("payment_numbers").delete().eq("id", n.id);
                    void qc.invalidateQueries();
                  }}
                  className="rounded-lg bg-destructive/15 p-2 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {(data?.length ?? 0) === 0 && <Empty text="কোনো পেমেন্ট নাম্বার নেই।" />}
        </div>
      </div>
    </AdminPage>
  );
}

function LimitsForm() {
  const qc = useQueryClient();
  const settings = useSettings();
  // কলামগুলো ডাটাবেসে যোগ হয়েছে কি না — না হলে অ্যাডমিনকে জানানো হয়
  const rawQ = useQuery({
    queryKey: ["app_settings_raw"],
    queryFn: async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("*")
        .eq("id", "main")
        .maybeSingle();
      return (data ?? null) as Record<string, unknown> | null;
    },
  });
  const needsMigration = !!rawQ.data && !("signup_bonus" in rawQ.data);
  const [minW, setMinW] = useState(String(settings.min_withdraw));
  const [minD, setMinD] = useState(String(settings.min_deposit));
  const [bonus, setBonus] = useState(String(settings.signup_bonus));
  const [banner, setBanner] = useState(settings.banner_image_url ?? "");
  const [adLink, setAdLink] = useState(settings.global_ad_link ?? "");
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [applying, setApplying] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  if (!loaded && settings.id) {
    setLoaded(true);
    setMinW(String(settings.min_withdraw));
    setMinD(String(settings.min_deposit));
    setBonus(String(settings.signup_bonus));
    setBanner(settings.banner_image_url ?? "");
    setAdLink(settings.global_ad_link ?? "");
  }

  /** নতুন কলাম না থাকলেও মান যেন থাকে — app_settings-এর `extra` সারিতে JSON করে রাখা হয়। */
  const writeExtra = async (nextBonus: number, nextLink: string) => {
    await supabase.from("app_settings").upsert(
      {
        id: EXTRA_ROW_ID,
        banner_image_url: JSON.stringify({ signup_bonus: nextBonus, global_ad_link: nextLink }),
      },
      { onConflict: "id" },
    );
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    setErr("");
    const nextBonus = Number(bonus) || 0;
    const nextLink = adLink.trim();
    const base = {
      min_withdraw: Number(minW) || 500,
      min_deposit: Number(minD) || 100,
      banner_image_url: banner.trim(),
    };

    let { error } = await supabase
      .from("app_settings")
      .update({ ...base, signup_bonus: nextBonus, global_ad_link: nextLink })
      .eq("id", "main");
    if (error) {
      // কলাম দুটি এখনো ডাটাবেসে নেই — বাকিটা সেভ করে মান `extra` সারিতে রাখি
      error = (await supabase.from("app_settings").update(base).eq("id", "main")).error;
    }
    await writeExtra(nextBonus, nextLink);
    setBusy(false);
    if (error) setErr("সেভ করা যায়নি: " + error.message);
    else setMsg("সেভ হয়েছে");
    void qc.invalidateQueries();
  };

  /** এক লিংক → সব প্ল্যান ও সব টাস্কে বসিয়ে দেয়। */
  const applyEverywhere = async () => {
    setApplying(true);
    setMsg("");
    setErr("");
    const link = adLink.trim();

    // আগে ডাটাবেস ফাংশন (এক ট্রানজেকশনে সব), না থাকলে সরাসরি আপডেট
    const rpc = await supabase.rpc("admin_apply_ad_link", { _link: link });
    if (!rpc.error) {
      await writeExtra(Number(bonus) || 0, link);
      setApplying(false);
      setMsg(`লিংকটি সব প্ল্যান ও টাস্কে বসানো হয়েছে (${rpc.data ?? 0} টি আপডেট)`);
      void qc.invalidateQueries();
      return;
    }

    const pkg = await supabase.from("packages").update({ ad_link: link }).not("id", "is", null);
    const job = await supabase.from("jobs").update({ link }).not("id", "is", null);
    await supabase.from("app_settings").update({ global_ad_link: link }).eq("id", "main");
    await writeExtra(Number(bonus) || 0, link);
    setApplying(false);
    if (pkg.error || job.error)
      setErr("সব জায়গায় বসানো যায়নি: " + (pkg.error?.message ?? job.error?.message));
    else setMsg("লিংকটি সব প্ল্যান ও টাস্কে বসানো হয়েছে");
    void qc.invalidateQueries();
  };

  return (
    <form onSubmit={save} className="surface-card space-y-3 p-4">
      <h2 className="font-display flex items-center gap-2 text-base font-bold">
        <Settings2 className="h-4 w-4 text-primary" /> সাইট সেটিংস
      </h2>
      {needsMigration && (
        <p className="rounded-2xl border border-warning/40 bg-warning/10 p-3 text-[11px] leading-5 text-warning">
          <b>ডাটাবেস আপডেট বাকি:</b> বিজ্ঞাপন লিংক ও বোনাসের লেখা এখনই কাজ করছে, তবে নতুন ইউজার এখনো
          পুরোনো নিয়মে (২০০ টাকা) বোনাস পাচ্ছে। রিপোর্টের{" "}
          <code>0007_signup_bonus_and_global_ad_link.sql</code> ফাইলটি একবার ডাটাবেসে চালালেই
          বোনাসের পরিমাণ এখান থেকেই নিয়ন্ত্রণ হবে।
        </p>
      )}
      <div className="grid grid-cols-2 gap-2">
        <AdminField label="সর্বনিম্ন উইথড্র (টাকা)" value={minW} onChange={setMinW} />
        <AdminField label="সর্বনিম্ন ডিপোজিট (টাকা)" value={minD} onChange={setMinD} />
      </div>
      <AdminField
        label="নতুন রেজিস্ট্রেশন বোনাস (টাকা)"
        value={bonus}
        onChange={setBonus}
        placeholder="100"
      />
      <AdminField
        label="ড্যাশবোর্ড ব্যানার ইমেজ লিঙ্ক"
        value={banner}
        onChange={setBanner}
        placeholder="https://example.com/banner.jpg"
      />
      {banner.trim() && (
        <img
          src={banner.trim()}
          alt="ব্যানার প্রিভিউ"
          className="h-28 w-full rounded-xl object-cover"
        />
      )}

      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-3">
        <AdminField
          label="গ্লোবাল বিজ্ঞাপন লিংক (সব প্ল্যান ও টাস্কের জন্য)"
          value={adLink}
          onChange={setAdLink}
          placeholder="https://example.com/ad"
        />
        <p className="mt-2 text-[11px] text-muted-foreground">
          কোনো প্ল্যান বা টাস্কে আলাদা লিংক না থাকলে স্বয়ংক্রিয়ভাবে এই লিংকটিই খুলবে। নিচের বাটনে
          চাপলে এই লিংকটি
          <b> সব প্ল্যান ও সব টাস্কে</b> লিখে দেওয়া হবে।
        </p>
        <button
          type="button"
          disabled={applying}
          onClick={applyEverywhere}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/40 bg-primary/10 py-2.5 text-xs font-bold text-primary disabled:opacity-60"
        >
          {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
          সব প্ল্যান ও টাস্কে এই লিংক বসান
        </button>
      </div>

      {msg && <p className="text-sm text-success">{msg}</p>}
      {err && <p className="text-sm text-destructive">{err}</p>}
      <button
        disabled={busy}
        className="bg-brand flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" />} সেভ করুন
      </button>
    </form>
  );
}
