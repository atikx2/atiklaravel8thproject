import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader, BottomNav } from "@/components/AppHeader";
import { LiveNotifications } from "@/components/LiveNotifications";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: () => (
    <div className="min-h-screen pb-24 lg:pb-10">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-3 py-4 lg:px-6 lg:py-8">
        <Outlet />
      </main>
      <LiveNotifications />
      <BottomNav />
    </div>
  ),
});