import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { emailForUsername } from "@/lib/auth";
import { Field } from "./auth";
import { Loader2, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin-login")({
  head: () => ({
    meta: [
      { title: "অ্যাডমিন লগইন | Smartjobbd26" },
      { name: "description", content: "Smartjobbd26 অ্যাডমিন কন্ট্রোল প্যানেলে প্রবেশ করুন।" },
      { property: "og:title", content: "অ্যাডমিন লগইন | Smartjobbd26" },
      { property: "og:description", content: "শুধুমাত্র অনুমোদিত অ্যাডমিনদের জন্য।" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailForUsername(username),
      password,
    });
    if (error || !data.user) {
      setBusy(false);
      return setErr("ইউজারনেম বা পাসওয়ার্ড ভুল হয়েছে");
    }
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin");
    setBusy(false);
    if (!roles?.length) {
      await supabase.auth.signOut();
      return setErr("এই একাউন্টটি অ্যাডমিন নয়");
    }
    navigate({ to: "/admin", replace: true });
  };

  return (
    <div className="grid min-h-screen place-items-center px-4" style={{ backgroundImage: "var(--gradient-hero)" }}>
      <div className="surface-card w-full max-w-sm p-6">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <h1 className="font-display text-lg font-bold">অ্যাডমিন লগইন</h1>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <Field label="অ্যাডমিন ইউজারনেম" value={username} onChange={setUsername} />
          <Field label="পাসওয়ার্ড" value={password} onChange={setPassword} type="password" />
          {err && <p className="text-sm text-destructive">{err}</p>}
          <button
            disabled={busy}
            className="bg-brand flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} প্রবেশ করুন
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link to="/" className="underline">
            হোম পেজ
          </Link>
        </p>
      </div>
    </div>
  );
}