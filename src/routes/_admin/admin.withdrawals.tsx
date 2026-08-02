import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { taka } from "@/lib/auth";
import { AdminPage, Empty, ActionRow, useProfileMap, useSetStatus } from "@/components/admin/ui";
import { BanknoteArrowDown } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/withdrawals")({
  head: () => ({
    meta: [
      { title: "উইথড্র অনুমোদন | অ্যাডমিন" },
      { name: "description", content: "ইউজারদের উইথড্র অনুরোধ অনুমোদন বা বাতিল করুন।" },
      { property: "og:title", content: "উইথড্র অনুমোদন | অ্যাডমিন" },
      { property: "og:description", content: "বিকাশ ও নগদ পে-আউট নিয়ন্ত্রণ।" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WithdrawalsAdmin,
});

function WithdrawalsAdmin() {
  const setStatus = useSetStatus("withdrawals");
  const profiles = useProfileMap();
  const { data } = useQuery({
    queryKey: ["admin", "withdrawals"],
    queryFn: async () => {
      const { data } = await supabase.from("withdrawals").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <AdminPage title="উইথড্র অনুমোদন" subtitle="সব উইথড্র অনুরোধ" icon={BanknoteArrowDown}>
      <div className="space-y-2">
        {(data ?? []).map((r) => (
          <div key={r.id} className="surface-card flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">
                {profiles[r.user_id]?.username} · {taka(r.amount)}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {r.method === "bkash" ? "বিকাশ" : "নগদ"} · {r.account_number}
              </p>
            </div>
            <ActionRow
              status={r.status}
              onOk={() => setStatus(r.id, "approved")}
              onNo={() => setStatus(r.id, "rejected")}
            />
          </div>
        ))}
        {(data?.length ?? 0) === 0 && <Empty text="কোনো উইথড্র অনুরোধ নেই।" />}
      </div>
    </AdminPage>
  );
}