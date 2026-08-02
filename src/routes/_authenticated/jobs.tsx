import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, taka, bn } from "@/lib/auth";
import { MonitorPlay, Youtube, ClipboardList, AlertTriangle, Loader2, ExternalLink, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/jobs")({
  head: () => ({
    meta: [
      { title: "কাজের তালিকা | Smartjobbd26" },
      { name: "description", content: "বিজ্ঞাপন দেখে, ভিডিও দেখে ও মাইক্রো টাস্ক করে ঘরে বসে ইনকাম করুন।" },
      { property: "og:title", content: "কাজের তালিকা | Smartjobbd26" },
      { property: "og:description", content: "প্রতিদিন নতুন কাজ — বিজ্ঞাপন, ভিডিও ও মাইক্রো টাস্ক।" },
    ],
  }),
  component: JobsPage,
});

type Job = {
  id: string;
  title: string;
  description: string;
  job_type: "ad" | "video" | "microtask";
  reward: number;
  link: string | null;
  duration_seconds: number;
  proof_required: boolean;
};

const TYPE_META = {
  ad: { label: "বিজ্ঞাপন দেখে আয়", Icon: MonitorPlay },
  video: { label: "ভিডিও দেখে আয়", Icon: Youtube },
  microtask: { label: "মাইক্রো টাস্ক", Icon: ClipboardList },
} as const;

function JobsPage() {
  const { profile, user } = useAuth();
  const qc = useQueryClient();
  const [active, setActive] = useState<Job | null>(null);

  const { data: jobs } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("jobs")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      return (data ?? []) as Job[];
    },
  });

  const { data: done } = useQuery({
    queryKey: ["my-subs-ids", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("job_submissions").select("job_id");
      return (data ?? []).map((d) => d.job_id);
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="font-display text-xl font-bold">আজকের কাজ</h1>

      {!profile?.has_deposited && (
        <div className="flex items-start gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <div>
            <p className="font-bold">কাজ করতে হলে প্রথমে ডিপোজিট করুন</p>
            <p className="text-muted-foreground">
              ২০০ টাকা বোনাস আপনার একাউন্টে আছে, তবে প্রথম ডিপোজিট ছাড়া কাজ জমা দেওয়া যাবে না।{" "}
              <Link to="/deposit" className="text-primary underline">
                ডিপোজিট করুন
              </Link>
            </p>
          </div>
        </div>
      )}

      {(["ad", "video", "microtask"] as const).map((t) => {
        const list = (jobs ?? []).filter((j) => j.job_type === t);
        if (!list.length) return null;
        const { label, Icon } = TYPE_META[t];
        return (
          <section key={t} className="space-y-2">
            <h2 className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
              <Icon className="h-4 w-4 text-primary" /> {label}
            </h2>
            <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 xl:grid-cols-3">
            {list.map((j) => {
              const already = done?.includes(j.id);
              return (
                <div key={j.id} className="surface-card flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{j.title}</p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">{j.description}</p>
                    <p className="mt-1 text-sm font-extrabold text-primary">{taka(j.reward)}</p>
                  </div>
                  <button
                    disabled={!profile?.has_deposited || already}
                    onClick={() => setActive(j)}
                    className="bg-brand shrink-0 rounded-xl px-4 py-2 text-xs font-bold text-primary-foreground disabled:opacity-40"
                  >
                    {already ? "জমা হয়েছে" : "শুরু করুন"}
                  </button>
                </div>
              );
            })}
          </section>
        );
      })}

      {(jobs?.length ?? 0) === 0 && (
        <p className="surface-card p-8 text-center text-sm text-muted-foreground">
          এই মুহূর্তে কোনো কাজ নেই। একটু পরে আবার দেখুন।
        </p>
      )}

      {active && (
        <JobModal
          job={active}
          onClose={() => setActive(null)}
          onDone={() => {
            setActive(null);
            void qc.invalidateQueries();
          }}
        />
      )}
    </div>
  );
}

function JobModal({ job, onClose, onDone }: { job: Job; onClose: () => void; onDone: () => void }) {
  const { user } = useAuth();
  const [left, setLeft] = useState(job.duration_seconds);
  const [proof, setProof] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  const submit = async () => {
    if (!user) return;
    setBusy(true);
    setErr("");
    const { error } = await supabase.from("job_submissions").insert({
      job_id: job.id,
      user_id: user.id,
      reward: job.reward,
      proof: proof || null,
    });
    setBusy(false);
    if (error) setErr("জমা দেওয়া যায়নি, আবার চেষ্টা করুন");
    else onDone();
  };

  const ready = left <= 0 && (!job.proof_required || proof.trim().length > 2);

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-background/80 p-0 backdrop-blur-sm sm:place-items-center sm:p-4">
      <div className="surface-card w-full max-w-md rounded-b-none p-5 sm:rounded-3xl">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-bold">{job.title}</h3>
          <button aria-label="বন্ধ" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">{job.description}</p>

        {job.link && (
          <a
            href={job.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-2 rounded-2xl border border-primary/40 bg-primary/10 py-3 text-sm font-bold text-primary"
          >
            <ExternalLink className="h-4 w-4" /> লিংক ওপেন করুন
          </a>
        )}

        <div className="my-4 text-center">
          {left > 0 ? (
            <p className="font-display text-3xl font-extrabold text-warning">{bn(left)} সেকেন্ড</p>
          ) : (
            <p className="text-sm font-bold text-success">সময় শেষ — এখন জমা দিন</p>
          )}
        </div>

        {job.proof_required && (
          <input
            value={proof}
            onChange={(e) => setProof(e.target.value)}
            placeholder="প্রমাণ লিখুন (স্ক্রিনশট লিংক / আইডি)"
            className="mb-3 w-full rounded-2xl border border-input bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary"
          />
        )}

        {err && <p className="mb-2 text-sm text-destructive">{err}</p>}

        <button
          disabled={!ready || busy}
          onClick={submit}
          className="bg-brand flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-primary-foreground disabled:opacity-40"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} কাজ জমা দিন
        </button>
      </div>
    </div>
  );
}