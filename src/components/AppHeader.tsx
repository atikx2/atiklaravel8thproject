import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  LogOut,
  LayoutDashboard,
  Briefcase,
  Wallet,
  BanknoteArrowDown,
  History,
  Layers,
  User,
  X,
  Gift,
  Clock3,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "./Logo";
import { useAuth, taka } from "@/lib/auth";
import { useSettings } from "@/lib/settings";

/** Desktop top-bar links (mobile uses the bottom tab bar + dashboard grid). */
const DESKTOP_LINKS = [
  { to: "/dashboard", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
  { to: "/jobs", label: "টাস্ক", icon: Briefcase },
  { to: "/packages", label: "প্ল্যান", icon: Layers },
  { to: "/deposit", label: "ডিপোজিট", icon: Wallet },
  { to: "/withdraw", label: "উইথড্র", icon: BanknoteArrowDown },
  { to: "/history", label: "ইতিহাস", icon: History },
] as const;

/** Mobile bottom tabs — kept to 4 so each tab stays thumb friendly. */
const TABS = [
  { to: "/dashboard", label: "হোম", icon: LayoutDashboard },
  { to: "/jobs", label: "টাস্ক", icon: Briefcase },
  { to: "/packages", label: "প্যাকেজ", icon: Layers },
  { to: "/profile", label: "প্রোফাইল", icon: User },
] as const;

export function AppHeader() {
  const { profile, signOut } = useAuth();
  const settings = useSettings();
  const [bell, setBell] = useState(false);
  const navigate = useNavigate();

  const notices = [
    {
      icon: Gift,
      t: "নতুন রেজিস্ট্রেশনে ২০০ টাকা বোনাস",
      d: "বন্ধুদের জানিয়ে দিন — একাউন্ট খুললেই বোনাস।",
    },
    {
      icon: Clock3,
      t: "উইথড্র ২৪ ঘণ্টার মধ্যে",
      d: `সর্বনিম্ন উত্তোলন ${taka(settings.min_withdraw)} — বিকাশ ও নগদে।`,
    },
    {
      icon: ShieldCheck,
      t: "একাউন্ট সুরক্ষিত রাখুন",
      d: "পাসওয়ার্ড কারও সাথে শেয়ার করবেন না।",
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-3 lg:px-6">
          <Logo to="/dashboard" />

          <nav className="hidden items-center gap-1 lg:flex">
            {DESKTOP_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-brand-soft text-primary" }}
              >
                <l.icon className="h-4 w-4" /> {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <button
              aria-label="নোটিফিকেশন"
              onClick={() => setBell((v) => !v)}
              className="relative grid h-10 w-10 place-items-center rounded-2xl border border-border bg-secondary/60 text-foreground"
            >
              <Bell className="h-[18px] w-[18px]" />
              <span className="bg-brand absolute top-2 right-2 h-2 w-2 rounded-full" />
            </button>
            <Link
              to="/profile"
              aria-label="প্রোফাইল"
              className="hidden h-10 items-center gap-2 rounded-2xl border border-border bg-secondary/60 px-3 text-sm font-bold sm:flex"
            >
              <User className="h-4 w-4 text-primary" />
              <span className="max-w-[9ch] truncate">{profile?.username ?? "ইউজার"}</span>
            </Link>
            <button
              aria-label="লগ আউট"
              onClick={async () => {
                await signOut();
                navigate({ to: "/", replace: true });
              }}
              className="grid h-10 w-10 place-items-center rounded-2xl border border-border bg-secondary/60 text-destructive"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </header>

      {bell && (
        <div
          className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm"
          onClick={() => setBell(false)}
        >
          <div
            className="surface-card absolute top-16 right-3 left-3 p-4 sm:left-auto sm:w-96"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-base font-extrabold">নোটিফিকেশন</p>
              <button aria-label="বন্ধ" onClick={() => setBell(false)}>
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-2">
              {notices.map((n) => (
                <div key={n.t} className="flex items-start gap-3 rounded-2xl bg-secondary/50 p-3">
                  <span className="bg-brand grid h-9 w-9 shrink-0 place-items-center rounded-xl">
                    <n.icon className="h-4 w-4 text-primary-foreground" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold">{n.t}</p>
                    <p className="text-xs text-muted-foreground">{n.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              আপনার ব্যালেন্স:{" "}
              <span className="font-bold text-primary">{taka(profile?.balance ?? 0)}</span>
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] lg:hidden">
      <div className="surface-card mx-auto flex max-w-md items-center justify-between gap-1 rounded-[26px] p-1.5">
        {TABS.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            aria-label={t.label}
            className="flex flex-1 flex-col items-center justify-center gap-1 rounded-[20px] px-1 py-2 text-muted-foreground transition-all"
            activeProps={{
              className: "bg-brand text-primary-foreground shadow-glow",
            }}
          >
            <t.icon className="h-[18px] w-[18px]" />
            <span className="text-[10px] leading-none font-bold">{t.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
