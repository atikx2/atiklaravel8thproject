import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { adminCreateUser } from "@/lib/admin.functions";
import { AdminPage, AdminField, Empty } from "@/components/admin/ui";
import { ShieldCheck, UserPlus, Loader2, ShieldOff, Shield } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/admins")({
  head: () => ({
    meta: [
      { title: "অ্যাডমিন ম্যানেজমেন্ট | অ্যাডমিন" },
      { name: "description", content: "নতুন অ্যাডমিন যোগ করুন বা অ্যাডমিন অধিকার সরিয়ে নিন।" },
      { property: "og:title", content: "অ্যাডমিন ম্যানেজমেন্ট | অ্যাডমিন" },
      { property: "og:description", content: "অ্যাডমিন অ্যাক্সেস নিয়ন্ত্রণ।" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminsAdmin,
});

function AdminsAdmin() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const createUser = useServerFn(adminCreateUser);
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const { data: profiles } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const { data: adminIds } = useQuery({
    queryKey: ["admin", "admin-ids"],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
      return (data ?? []).map((r) => r.user_id);
    },
  });

  const ids = adminIds ?? [];
  const admins = (profiles ?? []).filter((p) => ids.includes(p.id));
  const others = (profiles ?? []).filter((p) => !ids.includes(p.id));

  const toggle = async (uid: string, isAdminNow: boolean) => {
    if (isAdminNow) await supabase.from("user_roles").delete().eq("user_id", uid).eq("role", "admin");
    else await supabase.from("user_roles").insert({ user_id: uid, role: "admin" });
    void qc.invalidateQueries();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    setBusy(true);
    try {
      await createUser({ data: { username, phone, password, makeAdmin: true } });
      setMsg("নতুন অ্যাডমিন তৈরি হয়েছে");
      setUsername("");
      setPhone("");
      setPassword("");
      void qc.invalidateQueries();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "তৈরি করা যায়নি");
    }
    setBusy(false);
  };

  return (
    <AdminPage title="অ্যাডমিন ম্যানেজমেন্ট" subtitle="অ্যাডমিন যোগ ও অপসারণ" icon={ShieldCheck}>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
        <form onSubmit={submit} className="surface-card h-fit space-y-3 p-4">
          <h2 className="font-display flex items-center gap-2 text-base font-bold">
            <UserPlus className="h-4 w-4 text-primary" /> নতুন অ্যাডমিন তৈরি
          </h2>
          <AdminField label="ইউজারনেম" value={username} onChange={setUsername} />
          <AdminField label="ফোন নাম্বার" value={phone} onChange={setPhone} placeholder="01XXXXXXXXX" />
          <AdminField label="পাসওয়ার্ড" value={password} onChange={setPassword} type="password" />
          {err && <p className="text-sm text-destructive">{err}</p>}
          {msg && <p className="text-sm text-success">{msg}</p>}
          <button
            disabled={busy}
            className="bg-brand flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} অ্যাডমিন তৈরি করুন
          </button>
        </form>

        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="font-display text-base font-bold">বর্তমান অ্যাডমিন</h2>
            {admins.map((a) => (
              <div key={a.id} className="surface-card flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{a.username}</p>
                  <p className="truncate text-xs text-muted-foreground">{a.phone}</p>
                </div>
                {a.id !== user?.id && (
                  <button
                    onClick={() => toggle(a.id, true)}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg bg-destructive/15 px-3 py-1.5 text-xs font-bold text-destructive"
                  >
                    <ShieldOff className="h-4 w-4" /> সরান
                  </button>
                )}
              </div>
            ))}
            {admins.length === 0 && <Empty text="কোনো অ্যাডমিন নেই।" />}
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-base font-bold">ইউজারকে অ্যাডমিন বানান</h2>
            {others.slice(0, 25).map((u) => (
              <div key={u.id} className="surface-card flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{u.username}</p>
                  <p className="truncate text-xs text-muted-foreground">{u.phone}</p>
                </div>
                <button
                  onClick={() => toggle(u.id, false)}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary"
                >
                  <Shield className="h-4 w-4" /> অ্যাডমিন করুন
                </button>
              </div>
            ))}
            {others.length === 0 && <Empty text="কোনো ইউজার নেই।" />}
          </div>
        </div>
      </div>
    </AdminPage>
  );
}