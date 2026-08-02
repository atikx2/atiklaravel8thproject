import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { emailForUsername } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { Gift, Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "লগইন ও রেজিস্ট্রেশন | Smartjobbd26" },
      { name: "description", content: "Smartjobbd26 এ ফ্রি একাউন্ট খুলুন, ২০০ টাকা বোনাস নিন এবং মাইক্রো জব করে আয় শুরু করুন।" },
      { property: "og:title", content: "লগইন ও রেজিস্ট্রেশন | Smartjobbd26" },
      { property: "og:description", content: "ইউজারনেম, ফোন ও পাসওয়ার্ড দিয়ে একাউন্ট খুলুন — সাথে ২০০ টাকা সাইনআপ বোনাস।" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const email = emailForUsername(username);
      if (tab === "register") {
        if (username.trim().length < 3) throw new Error("ইউজারনেম কমপক্ষে ৩ অক্ষরের হতে হবে");
        if (!/^01[0-9]{9}$/.test(phone.trim())) throw new Error("সঠিক ১১ ডিজিটের মোবাইল নাম্বার দিন");
        if (password.length < 6) throw new Error("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username: username.trim().toLowerCase(), phone: phone.trim() } },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error("ইউজারনেম বা পাসওয়ার্ড ভুল হয়েছে");
      }
      navigate({ to: "/dashboard", replace: true });
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "কিছু একটা সমস্যা হয়েছে");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8" style={{ backgroundImage: "var(--gradient-hero)" }}>
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <div className="surface-card p-5">
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-2xl bg-secondary p-1">
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setErr("");
                }}
                className={`rounded-xl py-2 text-sm font-bold transition ${
                  tab === t ? "bg-brand text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                {t === "login" ? "লগইন" : "রেজিস্ট্রেশন"}
              </button>
            ))}
          </div>

          {tab === "register" && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 p-3 text-sm">
              <Gift className="h-5 w-5 shrink-0 text-primary" />
              <span>রেজিস্ট্রেশন করলেই সাথে সাথে ২০০ টাকা বোনাস!</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-3">
            <Field label="ইউজারনেম" value={username} onChange={setUsername} placeholder="আপনার ইউজারনেম" />
            {tab === "register" && (
              <Field label="মোবাইল নাম্বার" value={phone} onChange={setPhone} placeholder="01XXXXXXXXX" />
            )}
            <Field label="পাসওয়ার্ড" value={password} onChange={setPassword} type="password" placeholder="••••••" />
            {err && <p className="text-sm font-medium text-destructive">{err}</p>}
            <button
              type="submit"
              disabled={busy}
              className="bg-brand glow flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {tab === "login" ? "লগইন করুন" : "একাউন্ট খুলুন"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            <Link to="/" className="underline">
              হোম পেজে ফিরে যান
            </Link>
            {" · "}
            <Link to="/admin-login" className="underline">
              অ্যাডমিন লগইন
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-input bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}