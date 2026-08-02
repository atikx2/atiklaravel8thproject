import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader, BottomNav } from "@/components/AppHeader";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: () => (
    <div className="min-h-screen pb-24">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-3 py-4">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  ),
});