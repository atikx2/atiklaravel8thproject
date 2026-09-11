import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/lib/settings";
import { AdminPage, AdminField, Empty } from "@/components/admin/ui";
import { Smartphone, Plus, Trash2, Loader2, Settings2 } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/payments")({
  head: () => ({
    meta: [
      { title: "পেমেন্ট নাম্বার | অ্যাডমিন" },
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
    <AdminPage title="পেমেন্ট নাম্বার" subtitle="ডিপোজিট নাম্বার ও লিমিট" icon={Smartphone}>
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
                    method === k ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary/60"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            <AdminField label="নাম্বার" value={number} onChange={setNumber} placeholder="01XXXXXXXXX" />
            <AdminField label="লেবেল" value={label} onChange={setLabel} placeholder="পার্সোনাল / এজেন্ট" />
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
                    await supabase.from("payment_numbers").update({ is_active: !n.is_active }).eq("id", n.id);
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
  const [minW, setMinW] = useState(String(settings.min_withdraw));
  const [minD, setMinD] = useState(String(settings.min_deposit));
  const [banner, setBanner] = useState(settings.banner_image_url ?? "");
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  if (!loaded && settings.id) {
    setLoaded(true);
    setMinW(String(settings.min_withdraw));
    setMinD(String(settings.min_deposit));
    setBanner(settings.banner_image_url ?? "");
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const { error } = await supabase
      .from("app_settings")
      .update({
        min_withdraw: Number(minW) || 500,
        min_deposit: Number(minD) || 100,
        banner_image_url: banner.trim(),
      })
      .eq("id", "main");
    setBusy(false);
    setMsg(error ? "সেভ করা যায়নি" : "সেভ হয়েছে");
    void qc.invalidateQueries();
  };

  return (
    <form onSubmit={save} className="surface-card space-y-3 p-4">
      <h2 className="font-display flex items-center gap-2 text-base font-bold">
        <Settings2 className="h-4 w-4 text-primary" /> সাইট সেটিংস
      </h2>
      <AdminField label="সর্বনিম্ন উইথড্র (টাকা)" value={minW} onChange={setMinW} />
      <AdminField label="সর্বনিম্ন ডিপোজিট (টাকা)" value={minD} onChange={setMinD} />
      <AdminField
        label="ড্যাশবোর্ড ব্যানার ইমেজ লিঙ্ক"
        value={banner}
        onChange={setBanner}
        placeholder="https://example.com/banner.jpg"
      />
      {banner.trim() && (
        <img src={banner.trim()} alt="ব্যানার প্রিভিউ" className="h-28 w-full rounded-xl object-cover" />
      )}
      {msg && <p className="text-sm text-success">{msg}</p>}
      <button
        disabled={busy}
        className="bg-brand flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" />} সেভ করুন
      </button>
    </form>
  );
}