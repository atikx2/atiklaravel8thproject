import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth, taka, bn } from "@/lib/auth";
import { useMyPurchases, isActivePurchase } from "@/lib/packages";
import {
  BadgeCheck,
  Wallet,
  TrendingUp,
  Layers,
  BanknoteArrowDown,
  History,
  Briefcase,
  Headphones,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Phone,
  CalendarDays,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "প্রোফাইল | Smartjobbd26" },
      { name: "description", content: "আপনার একাউন্টের তথ্য, ব্যালেন্স ও সব অপশন এক জায়গায়।" },
      { property: "og:title", content: "প্রোফাইল | Smartjobbd26" },
      { property: "og:description", content: "একাউন্ট তথ্য ও সেটিংস।" },
    ],
  }),
  component: ProfilePage,
});

const MENU = [
  { to: "/jobs", label: "টাস্ক করুন", icon: Briefcase },
  { to: "/deposit", label: "ডিপোজিট", icon: Wallet },
  { to: "/withdraw", label: "উইথড্র", icon: BanknoteArrowDown },
  { to: "/packages", label: "প্ল্যান / প্যাকেজ", icon: Layers },
  { to: "/history", label: "ইতিহাস", icon: History },
  { to: "/about", label: "সাপোর্ট ও সম্পর্কে", icon: Headphones },
] as const;

function ProfilePage() {
  const { profile, isAdmin, signOut } = useAuth();
  const { data: purchases } = useMyPurchases();
  const navigate = useNavigate();
  const activePkg = (purchases ?? []).find(isActivePurchase);

  return (
    <div className="space-y-4">
      <section
        className="glow relative overflow-hidden rounded-[28px] p-5"
        style={{ backgroundImage: "var(--gradient-brand)" }}
      >
        <span className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-primary-foreground/10" />
        <div className="relative flex items-center gap-3">
          <div className="relative shrink-0">
            <span className="grid h-16 w-16 place-items-center rounded-3xl bg-background/25 ring-2 ring-primary-foreground/40 backdrop-blur-sm">
              <span className="font-display text-2xl font-extrabold text-primary-foreground uppercase">
                {(profile?.username ?? "স").slice(0, 1)}
              </span>
            </span>
            <BadgeCheck className="absolute -right-1 -bottom-1 h-6 w-6 rounded-full bg-background text-success" />
          </div>
          <div className="min-w-0">
            <p className="font-display truncate text-xl font-extrabold text-primary-foreground">
              {profile?.username ?? "ইউজার"}
            </p>
            <p className="flex items-center gap-1.5 text-xs font-semibold text-primary-foreground/85">
              <Phone className="h-3.5 w-3.5" /> {profile?.phone || "নাম্বার যোগ করা হয়নি"}
            </p>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-background/25 px-2.5 py-1 text-[11px] font-bold text-primary-foreground backdrop-blur-sm">
              <ShieldCheck className="h-3.5 w-3.5" />
              {profile?.has_deposited ? "ভেরিফাইড একাউন্ট" : "ডিপোজিট বাকি"}
            </span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="surface-card p-4">
          <Wallet className="mb-1.5 h-4 w-4 text-primary" />
          <p className="text-[11px] text-muted-foreground">ব্যালেন্স</p>
          <p className="font-display truncate text-lg font-extrabold">
            {taka(profile?.balance ?? 0)}
          </p>
        </div>
        <div className="surface-card p-4">
          <TrendingUp className="mb-1.5 h-4 w-4 text-success" />
          <p className="text-[11px] text-muted-foreground">মোট আয়</p>
          <p className="font-display truncate text-lg font-extrabold">
            {taka(profile?.total_earned ?? 0)}
          </p>
        </div>
      </div>

      <section className="surface-card flex items-center gap-3 p-4">
        <span className="tile grid h-11 w-11 shrink-0 place-items-center">
          <CalendarDays className="h-5 w-5 text-primary" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-muted-foreground">চলমান প্ল্যান</p>
          <p className="truncate text-sm font-bold">
            {activePkg
              ? `${activePkg.packages?.name ?? "প্যাকেজ"} · দৈনিক ${taka(activePkg.daily_income)} · ${bn(
                  activePkg.daily_ads,
                )} বিজ্ঞাপন`
              : "কোনো প্যাকেজ নেই"}
          </p>
        </div>
        <Link
          to="/packages"
          className="bg-brand shrink-0 rounded-xl px-3 py-2 text-xs font-bold text-primary-foreground"
        >
          {activePkg ? "দেখুন" : "কিনুন"}
        </Link>
      </section>

      <section className="surface-card divide-y divide-border/60 p-2">
        {MENU.map((m) => (
          <Link key={m.label} to={m.to} className="flex items-center gap-3 px-2 py-3.5">
            <span className="tile grid h-10 w-10 shrink-0 place-items-center">
              <m.icon className="h-[18px] w-[18px] text-primary" />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-bold">{m.label}</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        ))}

        {isAdmin && (
          <Link to="/admin" className="flex items-center gap-3 px-2 py-3.5">
            <span className="tile grid h-10 w-10 shrink-0 place-items-center">
              <ShieldCheck className="h-[18px] w-[18px] text-warning" />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-bold">অ্যাডমিন প্যানেল</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        )}

        <button
          onClick={async () => {
            await signOut();
            navigate({ to: "/", replace: true });
          }}
          className="flex w-full items-center gap-3 px-2 py-3.5 text-left"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-destructive/30 bg-destructive/10">
            <LogOut className="h-[18px] w-[18px] text-destructive" />
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-bold text-destructive">লগ আউট</span>
        </button>
      </section>

      <p className="pb-2 text-center text-[11px] text-muted-foreground">
        Smart Job BD · সংস্করণ {bn(2.0)}
      </p>
    </div>
  );
}
