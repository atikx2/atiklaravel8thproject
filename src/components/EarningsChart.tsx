import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, taka, bn } from "@/lib/auth";

type Range = "daily" | "weekly" | "monthly";

const RANGES: { k: Range; t: string; points: number }[] = [
  { k: "daily", t: "দৈনিক", points: 7 },
  { k: "weekly", t: "সাপ্তাহিক", points: 8 },
  { k: "monthly", t: "মাসিক", points: 6 },
];

type Tx = { kind: string; amount: number; created_at: string };

/** Start timestamp (ms) of the bucket a transaction belongs to. */
function bucketIndex(date: Date, now: Date, range: Range, points: number) {
  if (range === "daily") {
    const days = Math.floor((startOfDay(now).getTime() - startOfDay(date).getTime()) / 86400000);
    return points - 1 - days;
  }
  if (range === "weekly") {
    const weeks = Math.floor(
      (startOfDay(now).getTime() - startOfDay(date).getTime()) / (86400000 * 7),
    );
    return points - 1 - weeks;
  }
  const months = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
  return points - 1 - months;
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const shortTaka = (n: number) => `৳${bn(Math.round(n).toLocaleString("en-US"))}`;

export function EarningsChart() {
  const { user, profile } = useAuth();
  const [range, setRange] = useState<Range>("monthly");

  const { data: tx } = useQuery({
    queryKey: ["chart-tx", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("transactions")
        .select("kind,amount,created_at")
        .order("created_at", { ascending: true });
      return (data ?? []) as Tx[];
    },
  });

  const cfg = RANGES.find((r) => r.k === range) ?? RANGES[2]!;

  const { series, max, depositTotal, earnTotal } = useMemo(() => {
    const now = new Date();
    const n = cfg.points;
    const buckets = Array.from({ length: n }, () => 0);
    let deposits = 0;
    let earned = 0;

    for (const t of tx ?? []) {
      const amount = Number(t.amount ?? 0);
      if (t.kind === "deposit") deposits += amount;
      const isEarning = t.kind === "earning" || t.kind === "bonus";
      if (!isEarning) continue;
      earned += amount;
      const i = bucketIndex(new Date(t.created_at), now, range, n);
      if (i >= 0 && i < n) buckets[i] = (buckets[i] ?? 0) + amount;
    }

    // cumulative line — always reads as "growth", like a real dashboard
    let run = 0;
    const cum = buckets.map((b) => (run += b));
    const peak = Math.max(...cum, 0);
    return {
      series: cum,
      max: peak > 0 ? peak : 100,
      depositTotal: deposits,
      earnTotal: earned,
    };
  }, [tx, range, cfg.points]);

  const n = series.length;
  const points = series.map((v, i) => ({
    x: n === 1 ? 50 : (i / (n - 1)) * 100,
    y: 100 - (v / max) * 100,
  }));

  const line = points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  const area = `0,100 ${line} 100,100`;

  const midLabel = Math.ceil(n / 2);

  return (
    <section className="surface-card p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-muted-foreground">আয় বিবরণী</p>
          <h2 className="font-display truncate text-lg font-extrabold">পারফরম্যান্স ওভারভিউ</h2>
        </div>
        <div className="flex shrink-0 gap-1 rounded-full bg-secondary/70 p-1">
          {RANGES.map((r) => (
            <button
              key={r.k}
              onClick={() => setRange(r.k)}
              className={`rounded-full px-2.5 py-1.5 text-[11px] font-bold transition ${
                range === r.k
                  ? "bg-brand text-primary-foreground shadow-glow"
                  : "text-muted-foreground"
              }`}
            >
              {r.t}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        {/* y axis */}
        <div className="pointer-events-none absolute inset-y-0 left-0 flex w-14 flex-col justify-between py-1 text-[10px] font-semibold text-muted-foreground">
          <span>{shortTaka(max)}</span>
          <span>{shortTaka(max / 2)}</span>
          <span>{shortTaka(0)}</span>
        </div>

        <div className="relative ml-14 h-44">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
            <defs>
              <linearGradient id="sjbd-line" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" style={{ stopColor: "var(--brand-1)" }} />
                <stop offset="100%" style={{ stopColor: "var(--brand-2)" }} />
              </linearGradient>
              <linearGradient id="sjbd-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" style={{ stopColor: "var(--brand-1)", stopOpacity: 0.38 }} />
                <stop offset="100%" style={{ stopColor: "var(--brand-2)", stopOpacity: 0.02 }} />
              </linearGradient>
            </defs>

            {[0, 50, 100].map((y) => (
              <line
                key={y}
                x1="0"
                x2="100"
                y1={y}
                y2={y}
                stroke="currentColor"
                className="text-border"
                strokeWidth="0.5"
                strokeDasharray="2 3"
                vectorEffect="non-scaling-stroke"
              />
            ))}

            <polygon points={area} fill="url(#sjbd-fill)" />
            <polyline
              points={line}
              fill="none"
              stroke="url(#sjbd-line)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* dots kept as HTML so they stay perfectly round */}
          {points.map((p, i) => (
            <span
              key={i}
              className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-primary"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            />
          ))}

          {/* summary bubble, like a tooltip */}
          <div className="absolute right-0 bottom-2 rounded-2xl border border-border bg-popover/90 px-3 py-2 shadow-card backdrop-blur-md">
            <p className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-success" /> মোট আয়
            </p>
            <p className="font-display text-base font-extrabold text-gradient">
              {taka(profile?.total_earned ?? earnTotal)}
            </p>
            <p className="text-[10px] font-semibold text-muted-foreground">
              ডিপোজিট: <span className="text-foreground">{taka(depositTotal)}</span>
            </p>
          </div>
        </div>

        <div className="mt-2 ml-14 flex justify-between text-[10px] font-semibold text-muted-foreground">
          <span>১ম</span>
          <span>{bn(midLabel)}ম</span>
          <span>শেষ</span>
        </div>
      </div>
    </section>
  );
}
