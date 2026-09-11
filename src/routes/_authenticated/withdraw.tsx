import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, taka, bn } from "@/lib/auth";
import { useSettings } from "@/lib/settings";
import { PAY_METHODS } from "@/lib/pay-logos";
import { StatusChip } from "./dashboard";
import { Field } from "../auth";
import { Loader2, Send, HandCoins, Info, Wallet } from "lucide-react";

export const Route = createFileRoute("/_authenticated/withdraw")({
  head: () => ({
    meta: [
      { title: "উইথড্র | Smartjobbd26" },
      { name: "description", content: "আয় করা টাকা বিকাশ বা নগদে দ্রুত উত্তোলন করুন।" },
      { property: "og:title", content: "উইথড্র | Smartjobbd26" },
      { property: "og:description", content: "বিকাশ ও নগদে টাকা উত্তোলন।" },
    ],
  }),
  component: WithdrawPage,
});

function WithdrawPage() {
  const { user, profile, refresh } = useAuth();
  const settings = useSettings();
  const MIN = settings.min_withdraw;
  const qc = useQueryClient();
  const [method, setMethod] = useState<"bkash" | "nagad">("bkash");
  const [amount, setAmount] = useState("");
  const [acc, setAcc] = useState("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: list } = useQuery({
    queryKey: ["withdrawals", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("withdrawals").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    if (!user) return;
    const amt = Number(amount);
    if (!amt || amt < MIN) return setErr(`সর্বনিম্ন উইথড্র ${MIN} টাকা`);
    if (!profile?.has_deposited) return setErr("উইথড্র করতে হলে অন্তত একবার ডিপোজিট করতে হবে");
    if (amt > (profile?.balance ?? 0)) return setErr("পর্যাপ্ত ব্যালেন্স নেই");
    if (!/^01[0-9]{9}$/.test(acc.trim())) return setErr("সঠিক নাম্বার দিন");
    setBusy(true);
    const { error } = await supabase
      .from("withdrawals")
      .insert({ user_id: user.id, method, amount: amt, account_number: acc.trim() });
    setBusy(false);
    if (error) return setErr("অনুরোধ পাঠানো যায়নি");
    setAmount("");
    setAcc("");
    setMsg("উইথড্র অনুরোধ জমা হয়েছে। ২৪ ঘণ্টার মধ্যে পেমেন্ট দেওয়া হবে।");
    await refresh();
    void qc.invalidateQueries();
  };

  const quick = [500, 1000, 2000, 5000];

  return (
    <div className="space-y-4">
      <div className="page-header flex items-center gap-3 px-4 py-3.5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-foreground/20">
          <Send className="h-5 w-5 text-primary-foreground" />
        </span>
        <h1 className="font-display text-lg font-extrabold text-primary-foreground">উত্তোলন করুন</h1>
      </div>

      <div className="surface-card p-4">
        <div className="text-center">
          <span
            className="mx-auto grid h-20 w-20 place-items-center rounded-full"
            style={{ backgroundImage: "var(--gradient-brand)" }}
          >
            <HandCoins className="h-9 w-9 text-primary-foreground" />
          </span>
          <h2 className="font-display text-gradient mt-3 text-xl font-extrabold">উত্তোলন করুন</h2>
          <p className="mt-1 text-sm text-muted-foreground">আপনার অ্যাকাউন্ট থেকে টাকা উত্তোলন করুন</p>
        </div>

        <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-3 text-white shadow-glow">
          <Info className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="text-sm font-extrabold">উত্তোলন নোটিশ</p>
            <p className="text-xs font-medium leading-snug">
              সর্বনিম্ন উত্তোলন {bn(MIN)} টাকা। অনুরোধ ২৪ ঘণ্টার মধ্যে প্রক্রিয়া করা হয়।
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-3.5 text-white shadow-glow">
          <div>
            <p className="text-sm font-semibold">উপলব্ধ ব্যালেন্স</p>
            <p className="font-display text-2xl font-extrabold">{taka(profile?.balance ?? 0)}</p>
          </div>
          <span className="grid h-11 w-11 place-items-center rounded-full bg-white/20">
            <Wallet className="h-5 w-5" />
          </span>
        </div>

        <p className="mt-4 mb-2 font-display text-base font-extrabold text-gradient">পেমেন্ট পদ্ধতি নির্বাচন করুন</p>
        <div className="mb-4 grid grid-cols-2 gap-3">
          {PAY_METHODS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethod(m.id)}
              className={`flex flex-col items-center gap-2 rounded-2xl border-2 bg-card p-3 transition ${
                method === m.id ? "border-primary shadow-glow" : "border-border"
              }`}
            >
              <img src={m.logo} alt={`${m.name} লোগো`} className="h-10 w-10 object-contain" loading="lazy" />
              <span className={`text-xs font-bold ${method === m.id ? "text-primary" : "text-muted-foreground"}`}>
                {m.name}
              </span>
            </button>
          ))}
        </div>

        <p className="mb-2 text-sm font-bold text-muted-foreground">দ্রুত পরিমাণ নির্বাচন</p>
        <div className="mb-4 grid grid-cols-2 gap-2">
          {quick.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setAmount(String(q))}
              className={`rounded-xl border px-2 py-2.5 text-xs font-bold ${
                amount === String(q) ? "border-primary bg-primary/10 text-primary" : "border-border bg-card"
              }`}
            >
              {bn(q.toLocaleString("en-US"))} টাকা
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3">
          <Field label="ফোন নম্বর" value={acc} onChange={setAcc} placeholder="01XXXXXXXXX" />
          <Field label="উত্তোলনের পরিমাণ" value={amount} onChange={setAmount} placeholder={`সর্বনিম্ন ${MIN}`} />
          {err && <p className="text-sm text-destructive">{err}</p>}
          {msg && <p className="text-sm text-success">{msg}</p>}
          <button
            disabled={busy}
            className="bg-brand flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} উত্তোলন প্রক্রিয়া করুন
          </button>
          <p className="text-center text-xs text-muted-foreground">
            উত্তোলনের অনুরোধ ২৪ ঘণ্টার মধ্যে প্রক্রিয়া করা হয়
          </p>
        </form>
      </div>


      <div className="surface-card p-4">
        <h2 className="mb-3 font-display text-base font-bold">আপনার উইথড্র</h2>
        <div className="space-y-2">
          {(list ?? []).map((w) => (
            <div key={w.id} className="flex items-center justify-between gap-3 rounded-xl bg-secondary/60 px-3 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-bold">{taka(w.amount)}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {w.method === "bkash" ? "বিকাশ" : "নগদ"} · {w.account_number}
                </p>
              </div>
              <StatusChip status={w.status} />
            </div>
          ))}
          {(list?.length ?? 0) === 0 && <p className="py-4 text-center text-sm text-muted-foreground">কোনো উইথড্র নেই।</p>}
        </div>
      </div>
    </div>
  );
}