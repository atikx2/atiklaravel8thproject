import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, taka, bn } from "@/lib/auth";
import { useMyPurchases, isActivePurchase, normalizeLink } from "@/lib/packages";
import { useSettings } from "@/lib/settings";
import { PlayCircle, CheckCircle2, Loader2, Eye, AlertCircle } from "lucide-react";

function dhakaToday() {
  return new Date(Date.now() + 6 * 3600 * 1000).toISOString().slice(0, 10);
}

export function PackageAds() {
  const { user } = useAuth();
  const settings = useSettings();
  const purchasesQ = useMyPurchases();
  const viewsQ = useQuery({
    queryKey: ["package-ad-views", user?.id, dhakaToday()],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("package_ad_views")
        .select("purchase_id,ad_index")
        .eq("user_id", user!.id)
        .eq("view_date", dhakaToday());
      if (error) throw error;
      return new Set((data ?? []).map((v) => `${v.purchase_id}:${v.ad_index}`));
    },
  });

  if (purchasesQ.isLoading) {
    return (
      <div className="surface-card flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> প্যাকেজের বিজ্ঞাপন লোড হচ্ছে…
      </div>
    );
  }
  if (purchasesQ.error) {
    return (
      <div className="surface-card flex items-center gap-2 p-4 text-sm text-destructive">
        <AlertCircle className="h-4 w-4" /> প্যাকেজের তথ্য লোড করা যায়নি, পেজটি রিফ্রেশ করুন।
      </div>
    );
  }

  const active = (purchasesQ.data ?? []).filter(isActivePurchase);
  if (!active.length) return null;
  const done = viewsQ.data ?? new Set<string>();

  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
        <PlayCircle className="h-4 w-4 text-primary" /> প্যাকেজের দৈনিক বিজ্ঞাপন
      </h2>
      {active.map((p) => {
        const reward = p.daily_ads > 0 ? p.daily_income / p.daily_ads : 0;
        const doneCount = Array.from({ length: p.daily_ads }, (_, i) => i + 1).filter((n) =>
          done.has(`${p.id}:${n}`),
        ).length;
        return (
          <div key={p.id} className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">
              {p.packages?.name ?? "প্যাকেজ"} · আজ {bn(doneCount)}/{bn(p.daily_ads)} সম্পন্ন
            </p>
            <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: p.daily_ads }, (_, i) => i + 1).map((n) => (
                <AdTask
                  key={n}
                  purchaseId={p.id}
                  index={n}
                  reward={reward}
                  link={normalizeLink(p.packages?.ad_link?.trim() || settings.global_ad_link)}
                  done={done.has(`${p.id}:${n}`)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}

function AdTask({
  purchaseId,
  index,
  reward,
  link,
  done,
}: {
  purchaseId: string;
  index: number;
  reward: number;
  link: string;
  done: boolean;
}) {
  const qc = useQueryClient();
  const { refresh } = useAuth();
  const [left, setLeft] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (left === null || left <= 0) return;
    const t = setTimeout(() => setLeft((v) => (v ?? 0) - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  useEffect(() => {
    if (left !== 0 || busy) return;
    setBusy(true);
    void (async () => {
      const { error } = await supabase.rpc("complete_package_ad", {
        _purchase_id: purchaseId,
        _ad_index: index,
      });
      setBusy(false);
      setLeft(null);
      if (error) setErr(error.message);
      else {
        void refresh();
        void qc.invalidateQueries();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  const start = () => {
    setErr("");
    if (link) window.open(link, "_blank", "noopener,noreferrer");
    setLeft(5);
  };

  return (
    <div className="surface-card flex items-center justify-between gap-3 p-4">
      <div className="min-w-0">
        <p className="text-sm font-bold">বিজ্ঞাপন {bn(index)}</p>
        <p className="text-xs text-muted-foreground">
          {left !== null && left > 0 ? `${bn(left)} সেকেন্ড অপেক্ষা করুন` : "৫ সেকেন্ড দেখুন"}
        </p>
        <p className="mt-1 text-sm font-extrabold text-primary">{taka(reward)}</p>
        {err && <p className="text-xs text-destructive">{err}</p>}
      </div>
      <button
        disabled={done || left !== null || busy}
        onClick={start}
        className="bg-brand flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-primary-foreground disabled:opacity-40"
      >
        {done ? (
          <>
            <CheckCircle2 className="h-4 w-4" /> সম্পন্ন
          </>
        ) : busy || left !== null ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Eye className="h-4 w-4" /> দেখুন
          </>
        )}
      </button>
    </div>
  );
}
