import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { taka } from "@/lib/auth";
import { AdminPage, Empty, ActionRow, useProfileMap, useSetStatus } from "@/components/admin/ui";
import { ClipboardCheck } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/tasks")({
  head: () => ({
    meta: [
      { title: "টাস্ক যাচাই | অ্যাডমিন" },
      { name: "description", content: "ইউজারদের জমা দেওয়া টাস্ক প্রমাণ যাচাই করুন।" },
      { property: "og:title", content: "টাস্ক যাচাই | অ্যাডমিন" },
      { property: "og:description", content: "টাস্ক অনুমোদন ও রিওয়ার্ড প্রদান।" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TasksAdmin,
});

function TasksAdmin() {
  const setStatus = useSetStatus("job_submissions");
  const profiles = useProfileMap();
  const { data } = useQuery({
    queryKey: ["admin", "subs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("job_submissions")
        .select("*, jobs(title)")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <AdminPage title="টাস্ক যাচাই" subtitle="জমা দেওয়া কাজের প্রমাণ" icon={ClipboardCheck}>
      <div className="space-y-2">
        {(data ?? []).map((s) => (
          <div key={s.id} className="surface-card flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">
                {profiles[s.user_id]?.username} · {taka(s.reward)}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {(s.jobs as { title?: string } | null)?.title} {s.proof ? `· ${s.proof}` : ""}
              </p>
            </div>
            <ActionRow
              status={s.status}
              onOk={() => setStatus(s.id, "approved")}
              onNo={() => setStatus(s.id, "rejected")}
            />
          </div>
        ))}
        {(data?.length ?? 0) === 0 && <Empty text="কোনো টাস্ক জমা নেই।" />}
      </div>
    </AdminPage>
  );
}