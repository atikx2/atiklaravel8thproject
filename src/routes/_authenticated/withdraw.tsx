import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, taka } from "@/lib/auth";
import { StatusChip } from "./dashboard";
import { Field } from "../auth";
import { Loader2 } from "lucide-react";

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

const MIN = 300;

function WithdrawPage() {
  const { user, profile, refresh } = useAuth();
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

  return (
    <div className="space-y-4">
      <h1 className="font-display text-xl font-bold">উইথড্র করুন</h1>

      <div className="surface-card p-4">
        <p className="mb-3 text-sm text-muted-foreground">
          বর্তমান ব্যালেন্স: <span className="font-bold text-primary">{taka(profile?.balance ?? 0)}</span>
        </p>
        <div className="mb-4 grid grid-cols-2 gap-2">
          {(["bkash", "nagad"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`rounded-2xl border px-3 py-3 text-sm font-bold ${
                method === m ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary/60"
              }`}
            >
              {m === "bkash" ? "বিকাশ" : "নগদ"}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="space-y-3">
          <Field label="টাকার পরিমাণ" value={amount} onChange={setAmount} placeholder={`সর্বনিম্ন ${MIN}`} />
          <Field label="একাউন্ট নাম্বার" value={acc} onChange={setAcc} placeholder="01XXXXXXXXX" />
          {err && <p className="text-sm text-destructive">{err}</p>}
          {msg && <p className="text-sm text-success">{msg}</p>}
          <button
            disabled={busy}
            className="bg-brand flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} উইথড্র অনুরোধ পাঠান
          </button>
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