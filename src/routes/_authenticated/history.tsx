import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, taka, bn } from "@/lib/auth";
import { StatusChip } from "./dashboard";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({
    meta: [
      { title: "হিস্টোরি | Smartjobbd26" },
      { name: "description", content: "আপনার সব কাজ, ডিপোজিট, উইথড্র ও লেনদেনের পূর্ণ ইতিহাস।" },
      { property: "og:title", content: "হিস্টোরি | Smartjobbd26" },
      { property: "og:description", content: "কাজ ও লেনদেনের পূর্ণ ইতিহাস।" },
    ],
  }),
  component: HistoryPage,
});

const TABS = [
  { k: "jobs", t: "কাজ" },
  { k: "tx", t: "লেনদেন" },
] as const;

function HistoryPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"jobs" | "tx">("jobs");

  const { data: subs } = useQuery({
    queryKey: ["hist-subs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("job_submissions")
        .select("id,status,reward,created_at,jobs(title)")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: tx } = useQuery({
    queryKey: ["hist-tx", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("transactions").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const date = (s: string) => bn(new Date(s).toLocaleDateString("en-GB"));

  return (
    <div className="space-y-4">
      <h1 className="font-display text-xl font-bold">হিস্টোরি</h1>
      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-secondary p-1">
        {TABS.map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={`rounded-xl py-2 text-sm font-bold ${
              tab === t.k ? "bg-brand text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            {t.t}
          </button>
        ))}
      </div>

      <div className="surface-card divide-y divide-border/60 p-2">
        {tab === "jobs" &&
          (subs ?? []).map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3 px-2 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {(s.jobs as { title?: string } | null)?.title ?? "কাজ"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {date(s.created_at)} · {taka(s.reward)}
                </p>
              </div>
              <StatusChip status={s.status} />
            </div>
          ))}
        {tab === "tx" &&
          (tx ?? []).map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-3 px-2 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{t.note}</p>
                <p className="text-xs text-muted-foreground">{date(t.created_at)}</p>
              </div>
              <span className={`text-sm font-bold ${Number(t.amount) < 0 ? "text-destructive" : "text-success"}`}>
                {Number(t.amount) < 0 ? "-" : "+"}
                {taka(Math.abs(Number(t.amount)))}
              </span>
            </div>
          ))}
        {((tab === "jobs" && !subs?.length) || (tab === "tx" && !tx?.length)) && (
          <p className="py-8 text-center text-sm text-muted-foreground">কোনো তথ্য নেই।</p>
        )}
      </div>
    </div>
  );
}