import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, taka, bn } from "@/lib/auth";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Wallet,
  TrendingUp,
  Gift,
  AlertTriangle,
  Sparkles,
  Rocket,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "ড্যাশবোর্ড | Smartjobbd26" },
      { name: "description", content: "আপনার ব্যালেন্স, মোট আয় এবং সম্পন্ন কাজের হিসাব এক নজরে দেখুন।" },
      { property: "og:title", content: "ড্যাশবোর্ড | Smartjobbd26" },
      { property: "og:description", content: "ব্যালেন্স, আয় ও কাজের অবস্থা এক নজরে।" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { profile, user } = useAuth();
  const { data: subs } = useQuery({
    queryKey: ["my-subs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("job_submissions")
        .select("id,status,reward,created_at,jobs(title)")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const count = (s: string) => subs?.filter((x) => x.status === s).length ?? 0;

  return (
    <div className="space-y-4">
      <Link
        to="/packages"
        className="surface-card glow relative block overflow-hidden p-5"
        style={{ backgroundImage: "var(--gradient-brand)" }}
      >
        <Sparkles className="absolute -top-4 -right-4 h-24 w-24 text-primary-foreground/15" />
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/20 px-2.5 py-1 text-[11px] font-bold text-primary-foreground">
          <Rocket className="h-3.5 w-3.5" /> বিনিয়োগ প্যাকেজ
        </span>
        <h2 className="font-display mt-2 text-xl font-extrabold text-primary-foreground">
          ৳৫০০ থেকে শুরু করে দৈনিক আয় করুন
        </h2>
        <p className="mt-1 text-xs text-primary-foreground/85">
          প্যাকেজ কিনে প্রতিদিন বিজ্ঞাপন দেখুন — ৬০ দিনের বৈধতা। এখনই দেখুন →
        </p>
      </Link>

      <div className="surface-card glow p-5" style={{ backgroundImage: "var(--gradient-brand)" }}>
        <p className="text-sm font-medium text-primary-foreground/80">মোট ব্যালেন্স</p>
        <p className="font-display text-4xl font-extrabold text-primary-foreground">{taka(profile?.balance ?? 0)}</p>
        <p className="mt-1 text-xs text-primary-foreground/80">স্বাগতম, {profile?.username}</p>
      </div>

      {!profile?.has_deposited && (
        <div className="flex items-start gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <div>
            <p className="font-bold">প্রথম ডিপোজিট বাকি আছে</p>
            <p className="text-muted-foreground">
              বোনাস পেলেও কাজ শুরু করতে হলে অন্তত একবার ডিপোজিট করতে হবে।{" "}
              <Link to="/deposit" className="text-primary underline">
                এখনই ডিপোজিট করুন
              </Link>
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={TrendingUp} label="মোট আয়" value={taka(profile?.total_earned ?? 0)} />
        <Stat icon={Gift} label="সাইনআপ বোনাস" value={taka(200)} />
        <Stat icon={CheckCircle2} label="সফল কাজ" value={bn(count("approved"))} tone="text-success" />
        <Stat icon={Clock} label="পেন্ডিং কাজ" value={bn(count("pending"))} tone="text-warning" />
      </div>

      <div className="surface-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-base font-bold">সাম্প্রতিক কাজ</h2>
          <Link to="/jobs" className="text-xs font-semibold text-primary">
            নতুন কাজ দেখুন
          </Link>
        </div>
        <div className="space-y-2">
          {(subs ?? []).slice(0, 8).map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3 rounded-xl bg-secondary/60 px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {(s.jobs as { title?: string } | null)?.title ?? "কাজ"}
                </p>
                <p className="text-xs text-muted-foreground">{taka(s.reward)}</p>
              </div>
              <StatusChip status={s.status} />
            </div>
          ))}
          {(subs?.length ?? 0) === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">এখনো কোনো কাজ জমা দেননি।</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Link to="/deposit" className="surface-card flex items-center gap-2 p-4 text-sm font-bold">
          <Wallet className="h-5 w-5 text-primary" /> ডিপোজিট
        </Link>
        <Link to="/withdraw" className="surface-card flex items-center gap-2 p-4 text-sm font-bold">
          <TrendingUp className="h-5 w-5 text-accent" /> উইথড্র
        </Link>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone = "text-primary",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="surface-card p-4">
      <Icon className={`mb-2 h-5 w-5 ${tone}`} />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-display text-lg font-bold">{value}</p>
    </div>
  );
}

export function StatusChip({ status }: { status: string }) {
  const map: Record<string, { t: string; c: string; I: React.ElementType }> = {
    approved: { t: "সফল", c: "bg-success/15 text-success", I: CheckCircle2 },
    pending: { t: "পেন্ডিং", c: "bg-warning/15 text-warning", I: Clock },
    rejected: { t: "বাতিল", c: "bg-destructive/15 text-destructive", I: XCircle },
  };
  const s = map[status] ?? map["pending"]!;
  return (
    <span className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${s.c}`}>
      <s.I className="h-3.5 w-3.5" /> {s.t}
    </span>
  );
}