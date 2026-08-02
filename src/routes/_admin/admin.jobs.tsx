import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { taka, bn } from "@/lib/auth";
import { AdminPage, AdminField, Empty } from "@/components/admin/ui";
import { Briefcase, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/jobs")({
  head: () => ({
    meta: [
      { title: "জব ম্যানেজমেন্ট | অ্যাডমিন" },
      { name: "description", content: "নতুন কাজ পোস্ট, সক্রিয়/বন্ধ ও মুছে ফেলার নিয়ন্ত্রণ।" },
      { property: "og:title", content: "জব ম্যানেজমেন্ট | অ্যাডমিন" },
      { property: "og:description", content: "বিজ্ঞাপন, ভিডিও ও মাইক্রো টাস্ক তৈরি করুন।" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: JobsAdmin,
});

function JobsAdmin() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [reward, setReward] = useState("");
  const [link, setLink] = useState("");
  const [dur, setDur] = useState("15");
  const [slots, setSlots] = useState("1000");
  const [type, setType] = useState<"ad" | "video" | "microtask">("ad");
  const [proof, setProof] = useState(false);

  const { data } = useQuery({
    queryKey: ["admin", "jobs"],
    queryFn: async () => {
      const { data } = await supabase.from("jobs").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !Number(reward)) return;
    await supabase.from("jobs").insert({
      title: title.trim(),
      description: desc.trim(),
      job_type: type,
      reward: Number(reward),
      link: link.trim() || null,
      duration_seconds: Number(dur) || 15,
      slots: Number(slots) || 1000,
      proof_required: proof,
    });
    setTitle("");
    setDesc("");
    setReward("");
    setLink("");
    void qc.invalidateQueries();
  };

  return (
    <AdminPage title="জব ম্যানেজমেন্ট" subtitle="কাজ তৈরি ও নিয়ন্ত্রণ" icon={Briefcase}>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
        <form onSubmit={create} className="surface-card h-fit space-y-3 p-4">
          <h2 className="font-display text-base font-bold">নতুন কাজ পোস্ট করুন</h2>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                ["ad", "বিজ্ঞাপন"],
                ["video", "ভিডিও"],
                ["microtask", "মাইক্রো"],
              ] as const
            ).map(([k, l]) => (
              <button
                type="button"
                key={k}
                onClick={() => setType(k)}
                className={`rounded-xl border py-2 text-xs font-bold ${
                  type === k ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary/60"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <AdminField label="টাইটেল" value={title} onChange={setTitle} />
          <AdminField label="বিবরণ" value={desc} onChange={setDesc} />
          <div className="grid grid-cols-2 gap-2">
            <AdminField label="রিওয়ার্ড (টাকা)" value={reward} onChange={setReward} />
            <AdminField label="সময় (সেকেন্ড)" value={dur} onChange={setDur} />
          </div>
          <AdminField label="লিংক (ঐচ্ছিক)" value={link} onChange={setLink} />
          <AdminField label="স্লট সংখ্যা" value={slots} onChange={setSlots} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={proof} onChange={(e) => setProof(e.target.checked)} /> প্রমাণ লাগবে
          </label>
          <button className="bg-brand flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-primary-foreground">
            <Plus className="h-4 w-4" /> কাজ পোস্ট করুন
          </button>
        </form>

        <div className="space-y-2">
          {(data ?? []).map((j) => (
            <div key={j.id} className="surface-card flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{j.title}</p>
                <p className="text-xs text-muted-foreground">
                  {taka(j.reward)} · {bn(j.duration_seconds)} সেকেন্ড
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={async () => {
                    await supabase.from("jobs").update({ is_active: !j.is_active }).eq("id", j.id);
                    void qc.invalidateQueries();
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                    j.is_active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {j.is_active ? "সক্রিয়" : "বন্ধ"}
                </button>
                <button
                  aria-label="মুছুন"
                  onClick={async () => {
                    await supabase.from("jobs").delete().eq("id", j.id);
                    void qc.invalidateQueries();
                  }}
                  className="rounded-lg bg-destructive/15 p-2 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {(data?.length ?? 0) === 0 && <Empty text="কোনো কাজ নেই।" />}
        </div>
      </div>
    </AdminPage>
  );
}