import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, taka, bn } from "@/lib/auth";
import { useSettings } from "@/lib/settings";
import { StatusChip } from "./dashboard";
import { Field } from "../auth";
import { ShieldAlert, Trash2, Plus, Shield, ShieldOff, Loader2, Settings2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "অ্যাডমিন প্যানেল | Smartjobbd26" },
      { name: "description", content: "ইউজার, কাজ, ডিপোজিট ও উইথড্র — সবকিছু নিয়ন্ত্রণ করুন।" },
      { property: "og:title", content: "অ্যাডমিন প্যানেল | Smartjobbd26" },
      { property: "og:description", content: "সম্পূর্ণ সাইট নিয়ন্ত্রণ।" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPanel,
});

const TABS = [
  { k: "deposits", t: "ডিপোজিট" },
  { k: "withdrawals", t: "উইথড্র" },
  { k: "subs", t: "কাজ যাচাই" },
  { k: "jobs", t: "জব পোস্ট" },
  { k: "users", t: "ইউজার" },
  { k: "settings", t: "সেটিংস" },
] as const;
type TabKey = (typeof TABS)[number]["k"];

function AdminPanel() {
  const { isAdmin, loading } = useAuth();
  const [tab, setTab] = useState<TabKey>("deposits");

  if (loading) return <p className="py-10 text-center text-sm text-muted-foreground">লোড হচ্ছে...</p>;
  if (!isAdmin)
    return (
      <div className="surface-card flex flex-col items-center gap-2 p-8 text-center">
        <ShieldAlert className="h-8 w-8 text-destructive" />
        <p className="font-bold">প্রবেশাধিকার নেই</p>
        <p className="text-sm text-muted-foreground">এই পেজটি শুধুমাত্র অ্যাডমিনদের জন্য।</p>
      </div>
    );

  return (
    <div className="space-y-4">
      <h1 className="font-display text-xl font-bold">অ্যাডমিন কন্ট্রোল</h1>
      <div className="flex gap-1 overflow-x-auto rounded-2xl bg-secondary p-1">
        {TABS.map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold ${
              tab === t.k ? "bg-brand text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            {t.t}
          </button>
        ))}
      </div>
      {tab === "deposits" && <Requests table="deposits" />}
      {tab === "withdrawals" && <Requests table="withdrawals" />}
      {tab === "subs" && <Submissions />}
      {tab === "jobs" && <JobsAdmin />}
      {tab === "users" && <Users />}
      {tab === "settings" && <SettingsAdmin />}
    </div>
  );
}

function useSetStatus(table: "deposits" | "withdrawals" | "job_submissions") {
  const qc = useQueryClient();
  return async (id: string, status: "approved" | "rejected") => {
    await supabase.from(table).update({ status }).eq("id", id);
    void qc.invalidateQueries();
  };
}

function ActionRow({ onOk, onNo, status }: { onOk: () => void; onNo: () => void; status: string }) {
  if (status !== "pending") return <StatusChip status={status} />;
  return (
    <div className="flex shrink-0 gap-1.5">
      <button onClick={onOk} className="rounded-lg bg-success/15 px-3 py-1.5 text-xs font-bold text-success">
        অনুমোদন
      </button>
      <button onClick={onNo} className="rounded-lg bg-destructive/15 px-3 py-1.5 text-xs font-bold text-destructive">
        বাতিল
      </button>
    </div>
  );
}

function useProfileMap() {
  const { data } = useQuery({
    queryKey: ["admin", "profile-map"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("id,username,phone");
      const map: Record<string, { username: string; phone: string }> = {};
      for (const p of data ?? []) map[p.id] = { username: p.username, phone: p.phone };
      return map;
    },
  });
  return data ?? {};
}

function Requests({ table }: { table: "deposits" | "withdrawals" }) {
  const setStatus = useSetStatus(table);
  const profiles = useProfileMap();
  const { data } = useQuery({
    queryKey: ["admin", table],
    queryFn: async () => {
      const { data } = await supabase
        .from(table)
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div className="space-y-2">
      {(data ?? []).map((r) => {
        const p = profiles[r.user_id];
        return (
          <div key={r.id} className="surface-card flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">
                {p?.username} · {taka(r.amount)}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {r.method === "bkash" ? "বিকাশ" : "নগদ"} ·{" "}
                {"trx_id" in r ? `${r.sender_number} · ${r.trx_id}` : r.account_number}
              </p>
            </div>
            <ActionRow
              status={r.status}
              onOk={() => setStatus(r.id, "approved")}
              onNo={() => setStatus(r.id, "rejected")}
            />
          </div>
        );
      })}
      {(data?.length ?? 0) === 0 && <p className="surface-card p-6 text-center text-sm text-muted-foreground">কিছু নেই।</p>}
    </div>
  );
}

function Submissions() {
  const setStatus = useSetStatus("job_submissions");
  const profiles = useProfileMap();
  const { data } = useQuery({
    queryKey: ["admin", "subs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("job_submissions")
        .select("*, jobs(title)")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div className="space-y-2">
      {(data ?? []).map((s) => (
        <div key={s.id} className="surface-card flex items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">
              {profiles[s.user_id]?.username} · {taka(s.reward)}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {(s.jobs as { title?: string } | null)?.title} {s.proof ? `· ${s.proof}` : ""}
            </p>
          </div>
          <ActionRow status={s.status} onOk={() => setStatus(s.id, "approved")} onNo={() => setStatus(s.id, "rejected")} />
        </div>
      ))}
      {(data?.length ?? 0) === 0 && <p className="surface-card p-6 text-center text-sm text-muted-foreground">কিছু নেই।</p>}
    </div>
  );
}

function JobsAdmin() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [reward, setReward] = useState("");
  const [link, setLink] = useState("");
  const [dur, setDur] = useState("15");
  const [type, setType] = useState<"ad" | "video" | "microtask">("ad");
  const [proof, setProof] = useState(false);

  const { data } = useQuery({
    queryKey: ["admin", "jobs"],
    queryFn: async () => {
      const { data } = await supabase.from("jobs").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !Number(reward)) return;
    await supabase.from("jobs").insert({
      title: title.trim(),
      description: desc.trim(),
      job_type: type,
      reward: Number(reward),
      link: link.trim() || null,
      duration_seconds: Number(dur) || 15,
      proof_required: proof,
    });
    setTitle("");
    setDesc("");
    setReward("");
    setLink("");
    void qc.invalidateQueries();
  };

  return (
    <div className="space-y-4">
      <form onSubmit={create} className="surface-card space-y-3 p-4">
        <h2 className="font-display text-base font-bold">নতুন কাজ পোস্ট করুন</h2>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ["ad", "বিজ্ঞাপন"],
              ["video", "ভিডিও"],
              ["microtask", "মাইক্রো"],
            ] as const
          ).map(([k, l]) => (
            <button
              type="button"
              key={k}
              onClick={() => setType(k)}
              className={`rounded-xl border py-2 text-xs font-bold ${
                type === k ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary/60"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        <Field label="টাইটেল" value={title} onChange={setTitle} />
        <Field label="বিবরণ" value={desc} onChange={setDesc} />
        <Field label="রিওয়ার্ড (টাকা)" value={reward} onChange={setReward} />
        <Field label="লিংক (ঐচ্ছিক)" value={link} onChange={setLink} />
        <Field label="সময় (সেকেন্ড)" value={dur} onChange={setDur} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={proof} onChange={(e) => setProof(e.target.checked)} /> প্রমাণ লাগবে
        </label>
        <button className="bg-brand flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-primary-foreground">
          <Plus className="h-4 w-4" /> কাজ পোস্ট করুন
        </button>
      </form>

      <div className="space-y-2">
        {(data ?? []).map((j) => (
          <div key={j.id} className="surface-card flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{j.title}</p>
              <p className="text-xs text-muted-foreground">{taka(j.reward)}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={async () => {
                  await supabase.from("jobs").update({ is_active: !j.is_active }).eq("id", j.id);
                  void qc.invalidateQueries();
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                  j.is_active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                }`}
              >
                {j.is_active ? "সক্রিয়" : "বন্ধ"}
              </button>
              <button
                aria-label="মুছুন"
                onClick={async () => {
                  await supabase.from("jobs").delete().eq("id", j.id);
                  void qc.invalidateQueries();
                }}
                className="rounded-lg bg-destructive/15 p-2 text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Users() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div className="space-y-2">
      {(data ?? []).map((u) => (
        <div key={u.id} className="surface-card flex items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{u.username}</p>
            <p className="truncate text-xs text-muted-foreground">
              {bn(u.phone)} · ব্যালেন্স {taka(u.balance)} · {u.has_deposited ? "ডিপোজিট আছে" : "ডিপোজিট নেই"}
            </p>
          </div>
          <button
            onClick={async () => {
              await supabase.from("profiles").update({ is_blocked: !u.is_blocked }).eq("id", u.id);
              void qc.invalidateQueries();
            }}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold ${
              u.is_blocked ? "bg-destructive/15 text-destructive" : "bg-secondary text-muted-foreground"
            }`}
          >
            {u.is_blocked ? "ব্লকড" : "ব্লক করুন"}
          </button>
        </div>
      ))}
    </div>
  );
}