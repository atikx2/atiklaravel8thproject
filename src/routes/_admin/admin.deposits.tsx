import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { taka } from "@/lib/auth";
import { AdminPage, Empty, ActionRow, useProfileMap, useSetStatus } from "@/components/admin/ui";
import { Wallet } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/deposits")({
  head: () => ({
    meta: [
      { title: "ডিপোজিট অনুমোদন | অ্যাডমিন" },
      { name: "description", content: "ইউজারদের ডিপোজিট অনুরোধ যাচাই ও অনুমোদন করুন।" },
      { property: "og:title", content: "ডিপোজিট অনুমোদন | অ্যাডমিন" },
      { property: "og:description", content: "বিকাশ ও নগদ ডিপোজিট নিয়ন্ত্রণ।" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DepositsAdmin,
});

function DepositsAdmin() {
  const setStatus = useSetStatus("deposits");
  const profiles = useProfileMap();
  const { data } = useQuery({
    queryKey: ["admin", "deposits"],
    queryFn: async () => {
      const { data } = await supabase.from("deposits").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <AdminPage title="ডিপোজিট অনুমোদন" subtitle="সব ডিপোজিট অনুরোধ" icon={Wallet}>
      <div className="space-y-2">
        {(data ?? []).map((r) => (
          <div key={r.id} className="surface-card flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">
                {profiles[r.user_id]?.username} · {taka(r.amount)}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {r.method === "bkash" ? "বিকাশ" : "নগদ"} · {r.sender_number} · {r.trx_id}
              </p>
            </div>
            <ActionRow
              status={r.status}
              onOk={() => setStatus(r.id, "approved")}
              onNo={() => setStatus(r.id, "rejected")}
            />
          </div>
        ))}
        {(data?.length ?? 0) === 0 && <Empty text="কোনো ডিপোজিট অনুরোধ নেই।" />}
      </div>
    </AdminPage>
  );
}