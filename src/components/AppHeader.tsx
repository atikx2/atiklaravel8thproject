import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Eye,
  EyeOff,
  Plus,
  Menu,
  LayoutDashboard,
  Briefcase,
  Wallet,
  BanknoteArrowDown,
  History,
  LogOut,
  Shield,
  X,
  Package,
} from "lucide-react";
import { Logo } from "./Logo";
import { useAuth, taka } from "@/lib/auth";

const links = [
  { to: "/dashboard", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
  { to: "/jobs", label: "কাজ", icon: Briefcase },
  { to: "/packages", label: "প্যাকেজ", icon: Package },
  { to: "/deposit", label: "ডিপোজিট", icon: Wallet },
  { to: "/withdraw", label: "উইথড্র", icon: BanknoteArrowDown },
  { to: "/history", label: "হিস্টোরি", icon: History },
] as const;

export function AppHeader() {
  const { profile, isAdmin, signOut } = useAuth();
  const [show, setShow] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto grid max-w-6xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-3 py-2.5 lg:px-6 lg:py-3">
          <div className="flex min-w-0 items-center gap-6">
            <Logo to="/dashboard" />
            <nav className="hidden items-center gap-1 lg:flex">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary"
                  activeProps={{ className: "bg-primary/10 text-primary" }}
                >
                  <l.icon className="h-4 w-4" /> {l.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center justify-center gap-1.5 lg:justify-end">
            <button
              onClick={() => setShow((s) => !s)}
              className="flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-sm font-semibold"
            >
              {show ? <Eye className="h-4 w-4 text-primary" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
              <span className={show ? "text-primary" : "text-muted-foreground"}>
                {show ? taka(profile?.balance ?? 0) : "ব্যালেন্স"}
              </span>
            </button>
            <Link
              to="/deposit"
              aria-label="ডিপোজিট"
              className="bg-brand grid h-8 w-8 shrink-0 place-items-center rounded-full"
            >
              <Plus className="h-4 w-4 text-primary-foreground" />
            </Link>
          </div>
          <button
            aria-label="মেনু"
            onClick={() => setOpen(true)}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border bg-secondary lg:h-10 lg:w-10"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            className="surface-card absolute top-0 right-0 h-full w-72 rounded-none rounded-l-3xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{profile?.username ?? "ইউজার"}</p>
                <p className="text-xs text-muted-foreground">{profile?.phone}</p>
              </div>
              <button aria-label="বন্ধ" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-secondary"
                  activeProps={{ className: "bg-secondary text-primary" }}
                >
                  <l.icon className="h-4 w-4" /> {l.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-secondary"
                >
                  <Shield className="h-4 w-4" /> অ্যাডমিন প্যানেল
                </Link>
              )}
              <button
                onClick={async () => {
                  await signOut();
                  navigate({ to: "/", replace: true });
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-secondary"
              >
                <LogOut className="h-4 w-4" /> লগ আউট
              </button>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid max-w-5xl grid-cols-6 items-stretch gap-0.5 px-1 py-1.5">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            aria-label={l.label}
            className="flex flex-col items-center justify-center gap-1 rounded-xl px-0.5 py-1.5 text-muted-foreground"
            activeProps={{ className: "bg-secondary text-primary" }}
          >
            <l.icon className="h-5 w-5" />
            <span className="w-full truncate text-center text-[10px] leading-none font-semibold">{l.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}