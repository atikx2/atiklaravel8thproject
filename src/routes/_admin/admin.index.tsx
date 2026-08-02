import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { taka, bn } from "@/lib/auth";
import { AdminPage } from "@/components/admin/ui";
import { StatusChip } from "../_authenticated/dashboard";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Wallet,
  BanknoteArrowDown,
  ClipboardCheck,
  TrendingUp,
  Clock,
} from "lucide-react";

export const Route = createFileRoute("/_admin/admin/")({
  head: () => ({
    meta: [
      { title: "অ্যাডমিন ড্যাশবোর্ড | Smartjobbd26" },
      { name: "description", content: "সাইটের সম্পূর্ণ পরিসংখ্যান ও নিয়ন্ত্রণ এক জায়গায়।" },
      { property: "og:title", content: "অ্যাডমিন ড্যাশবোর্ড | Smartjobbd26" },
      { property: "og:description", content: "ইউজার, জব, ডিপোজিট ও উইথড্র পরিসংখ্যান।" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data } = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: async () => {
      const [users, jobs, subs, deps, wds] = await Promise.all([
        supabase.from("profiles").select("id,balance,total_earned,created_at,username"),
        supabase.from("jobs").select("id,is_active"),
        supabase.from("job_submissions").select("id,status,reward,created_at,user_id"),
        supabase.from("deposits").select("id,status,amount,created_at,user_id"),
        supabase.from("withdrawals").select("id,status,amount,created_at,user_id"),
      ]);
      return {
        users: users.data ?? [],
        jobs: jobs.data ?? [],
        subs: subs.data ?? [],
        deps: deps.data ?? [],
        wds: wds.data ?? [],
      };
    },
  });

  const users = data?.users ?? [];
  const jobs = data?.jobs ?? [];
  const subs = data?.subs ?? [];
  const deps = data?.deps ?? [];
  const wds = data?.wds ?? [];
  const sum = (rows: { amount: number; status: string }[]) =>
    rows.filter((r) => r.status === "approved").reduce((a, r) => a + Number(r.amount), 0);

  const stats = [
    { label: "মোট ইউজার", value: bn(users.length), icon: Users, tone: "text-primary bg-primary/10" },
    { label: "মোট জব", value: bn(jobs.length), icon: Briefcase, tone: "text-success bg-success/10" },
    { label: "মোট ডিপোজিট", value: taka(sum(deps)), icon: Wallet, tone: "text-warning bg-warning/10" },
    { label: "মোট উইথড্র", value: taka(sum(wds)), icon: BanknoteArrowDown, tone: "text-destructive bg-destructive/10" },
    {
      label: "সফল টাস্ক",
      value: bn(subs.filter((s) => s.status === "approved").length),
      icon: ClipboardCheck,
      tone: "text-primary bg-primary/10",
    },
    {
      label: "মোট পে-আউট আয়",
      value: taka(users.reduce((a, u) => a + Number(u.total_earned ?? 0), 0)),
      icon: TrendingUp,
      tone: "text-success bg-success/10",
    },
  ];

  const pending = [
    { label: "পেন্ডিং ডিপোজিট", n: deps.filter((d) => d.status === "pending").length, to: "/admin/deposits" },
    { label: "পেন্ডিং উইথড্র", n: wds.filter((w) => w.status === "pending").length, to: "/admin/withdrawals" },
    { label: "পেন্ডিং টাস্ক", n: subs.filter((s) => s.status === "pending").length, to: "/admin/tasks" },
  ] as const;

  const recentUsers = [...users]
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
    .slice(0, 6);
  const recentDeps = [...deps]
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
    .slice(0, 6);

  return (
    <AdminPage title="অ্যাডমিন ড্যাশবোর্ড" subtitle="সাইটের সম্পূর্ণ পরিসংখ্যান" icon={LayoutDashboard}>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="surface-card p-4">
            <div className={`mb-2 grid h-9 w-9 place-items-center rounded-xl ${s.tone}`}>
              <s.icon className="h-4.5 w-4.5" />
            </div>
            <p className="font-display truncate text-lg font-bold">{s.value}</p>
            <p className="truncate text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {pending.map((p) => (
          <Link key={p.label} to={p.to} className="surface-card flex items-center justify-between gap-3 p-4">
            <span className="flex items-center gap-2 text-sm font-bold">
              <Clock className="h-4 w-4 text-warning" /> {p.label}
            </span>
            <span className="rounded-full bg-warning/15 px-2.5 py-1 text-xs font-bold text-warning">{bn(p.n)}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="surface-card p-4">
          <h2 className="font-display mb-3 text-base font-bold">নতুন ইউজার</h2>
          <div className="space-y-2">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-3 rounded-xl bg-secondary/60 px-3 py-2.5">
                <p className="truncate text-sm font-bold">{u.username}</p>
                <p className="shrink-0 text-xs text-muted-foreground">{taka(u.balance)}</p>
              </div>
            ))}
            {recentUsers.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">কেউ নেই।</p>}
          </div>
        </div>
        <div className="surface-card p-4">
          <h2 className="font-display mb-3 text-base font-bold">সাম্প্রতিক ডিপোজিট</h2>
          <div className="space-y-2">
            {recentDeps.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-3 rounded-xl bg-secondary/60 px-3 py-2.5">
                <p className="truncate text-sm font-bold">{taka(d.amount)}</p>
                <StatusChip status={d.status} />
              </div>
            ))}
            {recentDeps.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">কিছু নেই।</p>}
          </div>
        </div>
      </div>
    </AdminPage>
  );
}