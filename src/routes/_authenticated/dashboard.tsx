import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, taka, bn } from "@/lib/auth";
import { useSettings } from "@/lib/settings";
import { useMyPurchases, isActivePurchase } from "@/lib/packages";
import { EarningsChart } from "@/components/EarningsChart";
import { LiveWithdraw } from "@/components/LiveWithdraw";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Wallet,
  Gift,
  BadgeCheck,
  Eye,
  EyeOff,
  ChevronRight,
  LineChart,
  Briefcase,
  Layers,
  BanknoteArrowDown,
  History,
  User,
  Info,
  Headphones,
  AlertTriangle,
  Handshake,
  Megaphone,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "ড্যাশবোর্ড | Smartjobbd26" },
      {
        name: "description",
        content: "আপনার ব্যালেন্স, মোট আয় এবং সম্পন্ন কাজের হিসাব এক নজরে দেখুন।",
      },
      { property: "og:title", content: "ড্যাশবোর্ড | Smartjobbd26" },
      { property: "og:description", content: "ব্যালেন্স, আয় ও কাজের অবস্থা এক নজরে।" },
    ],
  }),
  component: Dashboard,
});

const TILES = [
  { to: "/jobs", label: "টাস্ক", icon: Briefcase },
  { to: "/deposit", label: "ডিপোজিট", icon: Wallet },
  { to: "/withdraw", label: "উইথড্র", icon: BanknoteArrowDown },
  { to: "/packages", label: "প্ল্যান", icon: Layers },
  { to: "/profile", label: "প্রোফাইল", icon: User },
  { to: "/history", label: "ইতিহাস", icon: History },
  { to: "/about", label: "সাপোর্ট", icon: Headphones },
  { to: "/about", label: "সম্পর্কে", icon: Info },
] as const;

const partners = [
  { src: "/images/partner-ajkerdeal.jpeg", name: "AjkerDeal" },
  { src: "/images/partner-othoba.jpeg", name: "Othoba" },
  { src: "/images/partner-daraz.jpeg", name: "Daraz" },
];

type Tx = { id: string; kind: string; amount: number; note: string | null; created_at: string };

function Dashboard() {
  const { profile, user } = useAuth();
  const settings = useSettings();
  const banner = settings.banner_image_url?.trim();
  const [showBalance, setShowBalance] = useState(false);

  const { data: purchases } = useMyPurchases();
  const activePkg = (purchases ?? []).find(isActivePurchase);

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

  const { data: tx } = useQuery({
    queryKey: ["dash-tx", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("transactions")
        .select("id,kind,amount,note,created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      return (data ?? []) as Tx[];
    },
  });

  const count = (s: string) => subs?.filter((x) => x.status === s).length ?? 0;
  const withdrawn = (tx ?? [])
    .filter((t) => t.kind === "withdraw")
    .reduce((a, t) => a + Math.abs(Number(t.amount ?? 0)), 0);

  return (
    <div className="space-y-4">
      {/* ─── স্বাগতম কার্ড ─── */}
      <section
        className="glow relative overflow-hidden rounded-[28px] p-4"
        style={{ backgroundImage: "var(--gradient-brand)" }}
      >
        <span className="absolute -top-10 -right-8 h-36 w-36 rounded-full bg-primary-foreground/10" />
        <span className="absolute -bottom-12 left-10 h-28 w-28 rounded-full bg-primary-foreground/10" />
        <div className="relative flex items-center gap-3">
          <div className="relative shrink-0">
            <span className="grid h-16 w-16 place-items-center rounded-3xl bg-background/25 ring-2 ring-primary-foreground/40 backdrop-blur-sm">
              <span className="font-display text-2xl font-extrabold text-primary-foreground uppercase">
                {(profile?.username ?? "স").slice(0, 1)}
              </span>
            </span>
            <BadgeCheck className="absolute -right-1 -bottom-1 h-6 w-6 rounded-full bg-background text-success" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-primary-foreground/80">স্বাগতম</p>
            <p className="font-display truncate text-2xl leading-tight font-extrabold text-primary-foreground">
              {showBalance
                ? taka(profile?.balance ?? 0)
                : (profile?.phone ?? profile?.username ?? "")}
            </p>
            <button
              onClick={() => setShowBalance((v) => !v)}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-background/25 px-3 py-1.5 text-xs font-bold text-primary-foreground backdrop-blur-sm"
            >
              {showBalance ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {showBalance ? "ব্যালেন্স লুকান" : "ব্যালেন্স দেখুন"}
            </button>
          </div>

          <Link
            to="/deposit"
            aria-label="ডিপোজিট"
            className="animate-bob grid h-14 w-14 shrink-0 place-items-center rounded-3xl bg-background/25 ring-1 ring-primary-foreground/30 backdrop-blur-sm"
          >
            <span className="font-display text-2xl font-extrabold text-primary-foreground">৳</span>
          </Link>
        </div>
      </section>

      {/* ─── অ্যাকাউন্ট সারাংশ + নোটিশ ─── */}
      <section className="surface-card p-3">
        <Link to="/packages" className="flex items-center gap-3">
          <span className="tile grid h-11 w-11 shrink-0 place-items-center">
            <LineChart className="h-5 w-5 text-primary" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-muted-foreground">আপনার অ্যাকাউন্ট সারাংশ</p>
            <p className="truncate text-sm font-bold">
              মোট আয়: <span className="text-gradient">{taka(profile?.total_earned ?? 0)}</span>
              <span className="text-muted-foreground"> • প্ল্যান: </span>
              {activePkg?.packages?.name ?? "প্যাকেজ নেই"}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
        </Link>

        <div className="mt-3 flex items-center gap-2 overflow-hidden rounded-2xl bg-secondary/50 px-2 py-2">
          <span className="bg-brand shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold text-primary-foreground">
            NOTICE
          </span>
          <div className="animate-marquee flex min-w-0">
            <span className="flex min-w-full shrink-0 items-center gap-2 pr-6 text-xs font-semibold whitespace-nowrap">
              <Megaphone className="h-3.5 w-3.5 text-primary" /> Smart Job BD আপনাকে স্বাগতম — নতুন
              একাউন্টে ২০০ টাকা বোনাস, ২০০০+ ডিপোজিটে এক্সট্রা ৩০% বোনাস।
            </span>
            <span className="flex min-w-full shrink-0 items-center gap-2 pr-6 text-xs font-semibold whitespace-nowrap">
              <Megaphone className="h-3.5 w-3.5 text-primary" /> Smart Job BD আপনাকে স্বাগতম — নতুন
              একাউন্টে ২০০ টাকা বোনাস, ২০০০+ ডিপোজিটে এক্সট্রা ৩০% বোনাস।
            </span>
          </div>
        </div>
      </section>

      {/* ─── কুইক মেনু ─── */}
      <section className="surface-card p-3">
        <div className="grid grid-cols-4 gap-2">
          {TILES.map((t) => (
            <Link
              key={t.label}
              to={t.to}
              className="flex flex-col items-center gap-2 rounded-2xl px-1 py-3 transition active:scale-95"
            >
              <span className="tile grid h-12 w-12 place-items-center">
                <t.icon className="h-5 w-5 text-primary" />
              </span>
              <span className="w-full truncate text-center text-[11px] font-bold">{t.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {!profile?.has_deposited && (
        <div className="flex items-start gap-3 rounded-3xl border border-warning/40 bg-warning/10 p-4 text-sm">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <div>
            <p className="font-bold">কাজ শুরু করতে প্রথম ডিপোজিট দিন</p>
            <p className="text-muted-foreground">
              ২০০ টাকা বোনাস আপনার একাউন্টে আছে, তবে প্রথম ডিপোজিট ছাড়া কাজ জমা দেওয়া যাবে না।{" "}
              <Link to="/deposit" className="font-bold text-primary underline">
                এখনই ডিপোজিট করুন
              </Link>
            </p>
          </div>
        </div>
      )}

      {banner && (
        <Link to="/packages" className="surface-card block overflow-hidden p-0">
          <img
            src={banner}
            alt="Smartjobbd26 ব্যানার"
            className="h-40 w-full object-cover sm:h-56"
            loading="lazy"
          />
        </Link>
      )}

      {/* ─── পারফরম্যান্স চার্ট ─── */}
      <EarningsChart />

      {/* ─── ছোট স্ট্যাট ─── */}
      <div className="grid grid-cols-3 gap-2.5">
        <Stat
          icon={CheckCircle2}
          label="সফল কাজ"
          value={bn(count("approved"))}
          tone="text-success"
        />
        <Stat icon={Clock} label="পেন্ডিং" value={bn(count("pending"))} tone="text-warning" />
        <Stat icon={Gift} label="বোনাস" value={taka(200)} tone="text-primary" />
      </div>

      {/* ─── সাম্প্রতিক লেনদেন ─── */}
      <section className="surface-card p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            <h2 className="font-display text-base font-extrabold">সাম্প্রতিক লেনদেন</h2>
          </div>
          <p className="text-xs font-bold text-muted-foreground">
            উত্তোলন: <span className="text-foreground">{taka(withdrawn)}</span>
          </p>
        </div>

        <div className="space-y-2">
          {(tx ?? []).slice(0, 6).map((t) => {
            const negative = Number(t.amount) < 0;
            return (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-secondary/40 px-3 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                      negative ? "bg-destructive/15" : "bg-success/15"
                    }`}
                  >
                    {negative ? (
                      <ArrowUpRight className="h-4 w-4 text-destructive" />
                    ) : (
                      <ArrowDownLeft className="h-4 w-4 text-success" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{t.note ?? "লেনদেন"}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {bn(new Date(t.created_at).toLocaleDateString("en-GB"))}
                    </p>
                  </div>
                </div>
                <p
                  className={`shrink-0 text-sm font-extrabold ${negative ? "text-destructive" : "text-success"}`}
                >
                  {negative ? "-" : "+"}
                  {taka(Math.abs(Number(t.amount)))}
                </p>
              </div>
            );
          })}

          {(tx?.length ?? 0) === 0 && (
            <div className="py-8 text-center">
              <p className="text-sm font-bold text-muted-foreground">এখনো কোনো লেনদেন নেই</p>
              <p className="mt-1 text-xs text-muted-foreground/80">
                ডিপোজিট, উইথড্র বা টাস্ক করলে এখানে লেনদেন দেখাবে
              </p>
            </div>
          )}
        </div>

        {(tx?.length ?? 0) > 0 && (
          <Link to="/history" className="mt-3 block text-center text-xs font-bold text-primary">
            সব লেনদেন দেখুন →
          </Link>
        )}
      </section>

      {/* ─── লাইভ উইথড্র (সোশ্যাল প্রুফ) ─── */}
      <LiveWithdraw limit={6} />

      {/* ─── পার্টনার ─── */}
      <section className="surface-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <Handshake className="h-5 w-5 text-primary" />
          <h2 className="font-display text-base font-extrabold">আমাদের অংশীদার</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {partners.map((p) => (
            <div key={p.name} className="tile grid aspect-square place-items-center p-2">
              <img
                src={p.src}
                alt={`${p.name} লোগো`}
                loading="lazy"
                className="h-full w-full rounded-xl object-contain"
              />
            </div>
          ))}
        </div>
      </section>
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
    <div className="surface-card p-3">
      <Icon className={`mb-1.5 h-4 w-4 ${tone}`} />
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="font-display truncate text-base font-extrabold">{value}</p>
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
    <span
      className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${s.c}`}
    >
      <s.I className="h-3.5 w-3.5" /> {s.t}
    </span>
  );
}
