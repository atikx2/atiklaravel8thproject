import { useState } from "react";
import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Wallet,
  BanknoteArrowDown,
  ClipboardCheck,
  Smartphone,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";

export const Route = createFileRoute("/_admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/admin-login" });
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin");
    if (!roles?.length) throw redirect({ to: "/admin-login" });
    return { user: data.user };
  },
  component: AdminLayout,
});

export const ADMIN_LINKS = [
  { to: "/admin", label: "ড্যাশবোর্ড", icon: LayoutDashboard, exact: true },
  { to: "/admin/users", label: "ইউজার ম্যানেজমেন্ট", icon: Users },
  { to: "/admin/jobs", label: "জব ম্যানেজমেন্ট", icon: Briefcase },
  { to: "/admin/packages", label: "প্যাকেজ", icon: PackageIcon },
  { to: "/admin/tasks", label: "টাস্ক যাচাই", icon: ClipboardCheck },
  { to: "/admin/deposits", label: "ডিপোজিট", icon: Wallet },
  { to: "/admin/withdrawals", label: "উইথড্র", icon: BanknoteArrowDown },
  { to: "/admin/payments", label: "পেমেন্ট নাম্বার", icon: Smartphone },
  { to: "/admin/admins", label: "অ্যাডমিন", icon: ShieldCheck },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="space-y-1">
      {ADMIN_LINKS.map((l) => (
        <Link
          key={l.to}
          to={l.to}
          onClick={onNavigate}
          activeOptions={{ exact: "exact" in l ? l.exact : false }}
          activeProps={{ className: "bg-primary/10 text-primary" }}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary"
        >
          <l.icon className="h-4 w-4 shrink-0" />
          <span className="truncate">{l.label}</span>
        </Link>
      ))}
    </nav>
  );
}

function AdminLayout() {
  const { profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const logout = async () => {
    await signOut();
    navigate({ to: "/admin-login", replace: true });
  };

  return (
    <div className="min-h-screen bg-secondary/40">
      <div className="mx-auto flex w-full max-w-[1500px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-background p-4 lg:flex">
          <Logo to="/admin" />
          <p className="mt-1 mb-5 text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
            অ্যাডমিন কন্ট্রোল প্যানেল
          </p>
          <NavList />
          <div className="mt-auto space-y-1 border-t border-border pt-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-secondary"
            >
              <ExternalLink className="h-4 w-4" /> ইউজার সাইট
            </Link>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-destructive hover:bg-secondary"
            >
              <LogOut className="h-4 w-4" /> লগ আউট
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-3 sm:px-5">
              <button
                aria-label="মেনু"
                onClick={() => setOpen(true)}
                className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-secondary lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="hidden lg:block" />
              <p className="truncate text-sm font-bold lg:text-left">
                <span className="lg:hidden">অ্যাডমিন প্যানেল</span>
              </p>
              <div className="flex shrink-0 items-center gap-2">
                <span className="hidden rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary sm:inline-flex">
                  {profile?.username ?? "অ্যাডমিন"}
                </span>
                <button
                  onClick={logout}
                  aria-label="লগ আউট"
                  className="grid h-9 w-9 place-items-center rounded-xl bg-destructive/10 text-destructive lg:hidden"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </header>

          <main className="px-3 py-5 sm:px-5 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)}>
          <div
            className="absolute inset-y-0 left-0 flex w-72 flex-col bg-background p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <Logo to="/admin" />
              <button aria-label="বন্ধ" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavList onNavigate={() => setOpen(false)} />
            <div className="mt-auto border-t border-border pt-3">
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground"
              >
                <ExternalLink className="h-4 w-4" /> ইউজার সাইট
              </Link>
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-destructive"
              >
                <LogOut className="h-4 w-4" /> লগ আউট
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}