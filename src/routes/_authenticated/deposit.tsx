import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, taka } from "@/lib/auth";
import { StatusChip } from "./dashboard";
import { Field } from "../auth";
import { Loader2, Smartphone } from "lucide-react";

export const Route = createFileRoute("/_authenticated/deposit")({
  head: () => ({
    meta: [
      { title: "ডিপোজিট | Smartjobbd26" },
      { name: "description", content: "বিকাশ বা নগদের মাধ্যমে সহজে ডিপোজিট করে কাজ শুরু করুন।" },
      { property: "og:title", content: "ডিপোজিট | Smartjobbd26" },
      { property: "og:description", content: "বিকাশ ও নগদে দ্রুত ডিপোজিট।" },
    ],
  }),
  component: DepositPage,
});

const NUMBERS = { bkash: "01700000000", nagad: "01800000000" } as const;

function DepositPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [method, setMethod] = useState<"bkash" | "nagad">("bkash");
  const [amount, setAmount] = useState("");
  const [sender, setSender] = useState("");
  const [trx, setTrx] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: list } = useQuery({
    queryKey: ["deposits", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("deposits").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    if (!user) return;
    const amt = Number(amount);
    if (!amt || amt < 100) return setErr("সর্বনিম্ন ডিপোজিট ১০০ টাকা");
    if (!/^01[0-9]{9}$/.test(sender.trim())) return setErr("সঠিক সেন্ডার নাম্বার দিন");
    if (trx.trim().length < 5) return setErr("সঠিক ট্রানজেকশন আইডি দিন");
    setBusy(true);
    const { error } = await supabase.from("deposits").insert({
      user_id: user.id,
      method,
      amount: amt,
      sender_number: sender.trim(),
      trx_id: trx.trim(),
    });
    setBusy(false);
    if (error) return setErr("অনুরোধ পাঠানো যায়নি");
    setAmount("");
    setSender("");
    setTrx("");
    setMsg("অনুরোধ পাঠানো হয়েছে। অ্যাডমিন অনুমোদন দিলে ব্যালেন্স যোগ হবে।");
    void qc.invalidateQueries();
  };

  return (
    <div className="space-y-4">
      <h1 className="font-display text-xl font-bold">ডিপোজিট করুন</h1>

      <div className="surface-card p-4">
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

        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-secondary/60 p-3 text-sm">
          <Smartphone className="h-5 w-5 shrink-0 text-primary" />
          <p>
            <span className="font-bold">{method === "bkash" ? "বিকাশ" : "নগদ"} পার্সোনাল:</span>{" "}
            <span className="font-mono">{NUMBERS[method]}</span> — টাকা পাঠিয়ে নিচের ফর্মটি পূরণ করুন।
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <Field label="টাকার পরিমাণ" value={amount} onChange={setAmount} placeholder="১০০ বা তার বেশি" />
          <Field label="যে নাম্বার থেকে পাঠিয়েছেন" value={sender} onChange={setSender} placeholder="01XXXXXXXXX" />
          <Field label="ট্রানজেকশন আইডি" value={trx} onChange={setTrx} placeholder="TRX ID" />
          {err && <p className="text-sm text-destructive">{err}</p>}
          {msg && <p className="text-sm text-success">{msg}</p>}
          <button
            disabled={busy}
            className="bg-brand flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} অনুরোধ পাঠান
          </button>
        </form>
      </div>

      <div className="surface-card p-4">
        <h2 className="mb-3 font-display text-base font-bold">আপনার ডিপোজিট</h2>
        <div className="space-y-2">
          {(list ?? []).map((d) => (
            <div key={d.id} className="flex items-center justify-between gap-3 rounded-xl bg-secondary/60 px-3 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-bold">{taka(d.amount)}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {d.method === "bkash" ? "বিকাশ" : "নগদ"} · {d.trx_id}
                </p>
              </div>
              <StatusChip status={d.status} />
            </div>
          ))}
          {(list?.length ?? 0) === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">কোনো ডিপোজিট নেই।</p>
          )}
        </div>
      </div>
    </div>
  );
}