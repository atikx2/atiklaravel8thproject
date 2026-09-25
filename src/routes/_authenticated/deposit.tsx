import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, taka, bn } from "@/lib/auth";
import { useSettings, usePaymentNumbers } from "@/lib/settings";
import { usePackages } from "@/lib/packages";
import { StatusChip } from "./dashboard";
import { Field } from "../auth";
import {
  Loader2,
  Copy,
  Check,
  Package as PackageIcon,
  WalletCards,
  Gift,
  CreditCard,
} from "lucide-react";
import { PAY_METHODS, payLogo } from "@/lib/pay-logos";


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
  const { user, profile } = useAuth();
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

  useEffect(() => {
    if (pkg) setAmount(String(pkg.price));
  }, [pkg?.id, pkg?.price]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    const toEn = (s: string) => s.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d))).trim();
    const amt = pkg ? pkg.price : Number(toEn(amount));
    if (!amt || (!pkg && amt < settings.min_deposit))
      return setErr(`সর্বনিম্ন ডিপোজিট ${settings.min_deposit} টাকা`);
    const senderNo = toEn(sender).replace(/[\s-]/g, "").replace(/^\+?88/, "");
    if (!/^01[0-9]{9}$/.test(senderNo)) return setErr("সঠিক সেন্ডার নাম্বার দিন (01XXXXXXXXX)");
    if (trx.trim().length < 5) return setErr("সঠিক ট্রানজেকশন আইডি দিন");
    setBusy(true);
    let uid = user?.id;
    if (!uid) {
      const { data: u } = await supabase.auth.getUser();
      uid = u.user?.id;
    }
    if (!uid) {
      setBusy(false);
      return setErr("লগইন সেশন পাওয়া যায়নি, আবার লগইন করুন");
    }
    const { error } = await supabase.from("deposits").insert({
      user_id: uid,
      method,
      amount: amt,
      sender_number: sender.trim(),
      trx_id: trx.trim(),
      package_id: pkg?.id ?? null,
    });
    setBusy(false);
    if (error) return setErr("অনুরোধ পাঠানো যায়নি");
    if (!pkg) setAmount("");
    setSender("");
    setTrx("");
    setMsg(
      pkg
        ? "প্যাকেজ কেনার অনুরোধ পাঠানো হয়েছে। অ্যাডমিন অনুমোদন দিলে প্যাকেজ চালু হবে।"
        : "অনুরোধ পাঠানো হয়েছে। অ্যাডমিন অনুমোদন দিলে ব্যালেন্স যোগ হবে।",
    );
    void qc.invalidateQueries();
  };

  const quick = [500, 1000, 2000, 5000, 10000, 20000];

  return (
    <div className="space-y-4">
      <div className="page-header flex items-center gap-3 px-4 py-3.5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-foreground/20">
          <WalletCards className="h-5 w-5 text-primary-foreground" />
        </span>
        <h1 className="font-display text-lg font-extrabold text-primary-foreground">
          {pkg ? "প্যাকেজ চেকআউট" : "জমা করুন"}
        </h1>
      </div>

      {pkg && (
        <div className="surface-card flex items-center gap-3 p-4">
          <div className="bg-brand grid h-10 w-10 shrink-0 place-items-center rounded-2xl">
            <PackageIcon className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{pkg.name}</p>
            <p className="text-xs text-muted-foreground">
              {taka(pkg.price)} · দৈনিক {taka(pkg.daily_income)} · {bn(pkg.validity_days)} দিন
            </p>
          </div>
        </div>
      )}

      <div className="surface-card p-4">
        <p className="font-display text-gradient mb-3 text-base font-extrabold">পেমেন্ট পদ্ধতি</p>
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

        <div className="mb-3 flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-3.5 text-white shadow-glow">
          <span className="text-sm font-semibold">বর্তমান ব্যালেন্স:</span>
          <span className="font-display text-xl font-extrabold">{taka(profile?.balance ?? 0)}</span>
        </div>

        <div className="mb-4 flex items-start gap-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-3 text-white shadow-glow">
          <Gift className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-sm font-bold leading-snug">
            ধামাকা অফার: দুই হাজার টাকার উপরে জমা করলে এক্সট্রা ৩০% বোনাস
          </p>
        </div>

        <div className="mb-4 space-y-2">
          {shown.map((n) => (
            <div key={n.id} className="rounded-2xl border border-border bg-secondary/60 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <img src={payLogo(method)} alt="" className="h-8 w-8 shrink-0 object-contain" />
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
            label="জমার পরিমাণ"
            value={amount}
            onChange={setAmount}
            placeholder={`${settings.min_deposit} বা তার বেশি`}
          />
          {!pkg && (
            <div>
              <p className="mb-2 text-sm font-bold text-muted-foreground">দ্রুত নির্বাচন</p>
              <div className="grid grid-cols-3 gap-2">
                {quick.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setAmount(String(q))}
                    className={`rounded-xl border px-2 py-2.5 text-xs font-bold ${
                      amount === String(q) ? "border-primary bg-primary/10 text-primary" : "border-border bg-card"
                    }`}
                  >
                    {bn(q.toLocaleString("en-US"))}
                  </button>
                ))}
              </div>
            </div>
          )}
          <Field label="যে নাম্বার থেকে পাঠিয়েছেন" value={sender} onChange={setSender} placeholder="01XXXXXXXXX" />
          <Field label="ট্রানজেকশন আইডি" value={trx} onChange={setTrx} placeholder="TRX ID" />
          {err && <p className="text-sm text-destructive">{err}</p>}
          {msg && <p className="text-sm text-success">{msg}</p>}
          <button
            disabled={busy}
            className="bg-brand flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />} জমা করুন
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