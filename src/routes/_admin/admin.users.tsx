import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, taka, bn } from "@/lib/auth";
import { adminCreateUser, adminDeleteUser, adminResetPassword } from "@/lib/admin.functions";
import { AdminPage, AdminField, Empty } from "@/components/admin/ui";
import { Users, UserPlus, Trash2, Loader2, KeyRound, Search, Shield } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/users")({
  head: () => ({
    meta: [
      { title: "ইউজার ম্যানেজমেন্ট | অ্যাডমিন" },
      { name: "description", content: "ইউজার তৈরি, ব্লক, পাসওয়ার্ড রিসেট ও ডিলিট করুন।" },
      { property: "og:title", content: "ইউজার ম্যানেজমেন্ট | অ্যাডমিন" },
      { property: "og:description", content: "সম্পূর্ণ ইউজার নিয়ন্ত্রণ।" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: UsersAdmin,
});

function UsersAdmin() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const createUser = useServerFn(adminCreateUser);
  const deleteUser = useServerFn(adminDeleteUser);
  const resetPassword = useServerFn(adminResetPassword);

  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  const { data } = useQuery({
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

  const list = (data ?? []).filter(
    (u) => !q.trim() || u.username.includes(q.trim()) || u.phone.includes(q.trim()),
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    setBusy(true);
    try {
      await createUser({ data: { username, phone, password } });
      setMsg("নতুন ইউজার তৈরি হয়েছে");
      setUsername("");
      setPhone("");
      setPassword("");
      void qc.invalidateQueries();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "ইউজার তৈরি করা যায়নি");
    }
    setBusy(false);
  };

  const remove = async (id: string, name: string) => {
    if (!window.confirm(`${name} কে স্থায়ীভাবে মুছে ফেলবেন?`)) return;
    try {
      await deleteUser({ data: { userId: id } });
      void qc.invalidateQueries();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "মুছা যায়নি");
    }
  };

  const reset = async (id: string) => {
    const pw = window.prompt("নতুন পাসওয়ার্ড দিন (কমপক্ষে ৬ অক্ষর)");
    if (!pw) return;
    try {
      await resetPassword({ data: { userId: id, password: pw } });
      setMsg("পাসওয়ার্ড পরিবর্তন হয়েছে");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "পরিবর্তন করা যায়নি");
    }
  };

  return (
    <AdminPage title="ইউজার ম্যানেজমেন্ট" subtitle={`মোট ${bn(list.length)} জন ইউজার`} icon={Users}>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
        <form onSubmit={submit} className="surface-card h-fit space-y-3 p-4">
          <h2 className="font-display flex items-center gap-2 text-base font-bold">
            <UserPlus className="h-4 w-4 text-primary" /> নতুন ইউজার তৈরি
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
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} ইউজার তৈরি করুন
          </button>
        </form>

        <div className="space-y-2">
          <div className="surface-card flex items-center gap-2 px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ইউজারনেম বা ফোন দিয়ে খুঁজুন"
              className="w-full bg-transparent py-1.5 text-sm outline-none"
            />
          </div>
          {list.map((u) => {
            const isUserAdmin = (adminIds ?? []).includes(u.id);
            return (
              <div key={u.id} className="surface-card grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-4">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 truncate text-sm font-bold">
                    {u.username}
                    {isUserAdmin && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                        <Shield className="h-3 w-3" /> অ্যাডমিন
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {bn(u.phone)} · ব্যালেন্স {taka(u.balance)} · {u.has_deposited ? "ডিপোজিট আছে" : "ডিপোজিট নেই"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => reset(u.id)}
                    aria-label="পাসওয়ার্ড রিসেট"
                    className="rounded-lg bg-secondary p-2 text-muted-foreground"
                  >
                    <KeyRound className="h-4 w-4" />
                  </button>
                  <button
                    onClick={async () => {
                      await supabase.from("profiles").update({ is_blocked: !u.is_blocked }).eq("id", u.id);
                      void qc.invalidateQueries();
                    }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                      u.is_blocked ? "bg-destructive/15 text-destructive" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {u.is_blocked ? "ব্লকড" : "ব্লক"}
                  </button>
                  {u.id !== user?.id && (
                    <button
                      onClick={() => remove(u.id, u.username)}
                      aria-label="ডিলিট"
                      className="rounded-lg bg-destructive/15 p-2 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {list.length === 0 && <Empty text="কোনো ইউজার পাওয়া যায়নি।" />}
        </div>
      </div>
    </AdminPage>
  );
}