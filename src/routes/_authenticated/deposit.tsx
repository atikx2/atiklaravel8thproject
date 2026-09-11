import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, taka, bn } from "@/lib/auth";
import { useSettings, usePaymentNumbers } from "@/lib/settings";
import { usePackages } from "@/lib/packages";
import { StatusChip } from "./dashboard";
import { Field } from "../auth";
import { Loader2, Smartphone, Copy, Check, Package as PackageIcon } from "lucide-react";

export const Route = createFileRoute("/_authenticated/deposit")({
  validateSearch: (search: Record<string, unknown>): { pkg?: string } =>
    typeof search["pkg"] === "string" ? { pkg: search["pkg"] } : {},
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

function DepositPage() {
  const { user } = useAuth();
  const settings = useSettings();
  const numbers = usePaymentNumbers();
  const { pkg: pkgId } = Route.useSearch();
  const packages = usePackages();
  const pkg = packages.find((p) => p.id === pkgId);
  const qc = useQueryClient();
  const [method, setMethod] = useState<"bkash" | "nagad">("bkash");
  const [amount, setAmount] = useState("");
  const [sender, setSender] = useState("");
  const [trx, setTrx] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const active = numbers.filter((n) => n.method === method);
  const fallback = method === "bkash" ? settings.bkash_number : settings.nagad_number;
  const shown = active.length
    ? active
    : [{ id: "fallback", method, number: fallback, label: "পার্সোনাল", is_active: true }];

  const copyNumber = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      setErr("কপি করা যায়নি, নাম্বারটি হাতে লিখুন");
    }
  };

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
    if (!amt || amt < settings.min_deposit) return setErr(`সর্বনিম্ন ডিপোজিট ${settings.min_deposit} টাকা`);
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

        <div className="mb-4 space-y-2">
          {shown.map((n) => (
            <div key={n.id} className="rounded-2xl border border-border bg-secondary/60 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Smartphone className="h-5 w-5 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-muted-foreground">
                      {method === "bkash" ? "বিকাশ" : "নগদ"} {n.label} নাম্বার
                    </p>
                    <p className="truncate font-mono text-base font-bold">{n.number}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyNumber(n.number)}
                  aria-label="নাম্বার কপি করুন"
                  className="flex shrink-0 items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-2 text-xs font-bold text-primary"
                >
                  {copied === n.number ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied === n.number ? "কপি হয়েছে" : "কপি"}
                </button>
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">উপরের নাম্বারে সেন্ড মানি করে নিচের ফর্মটি পূরণ করুন।</p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <Field
            label="টাকার পরিমাণ"
            value={amount}
            onChange={setAmount}
            placeholder={`${settings.min_deposit} বা তার বেশি`}
          />
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