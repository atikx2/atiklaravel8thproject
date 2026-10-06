import { useEffect, useState } from "react";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
import { bn, taka } from "@/lib/auth";

/**
 * "লাইভ উইথড্র" feed.
 *
 * NOTE: this is a *marketing / social-proof* widget — the rows are generated
 * demo data, not real withdrawal records (real payouts live in the
 * `withdrawals` table and are only visible to their owner + admin via RLS).
 * Keep it that way: never wire real user names or amounts in here.
 */

const NAMES = [
  "শাকিল",
  "নাসির",
  "হাসান",
  "রাকিব",
  "ইমরান",
  "সুমন",
  "তানভীর",
  "জুয়েল",
  "আরিফ",
  "রুবেল",
  "সোহাগ",
  "মাহিন",
  "পারভেজ",
  "নয়ন",
  "সজীব",
  "ফারুক",
  "মিঠুন",
  "রাসেল",
  "শিমুল",
  "সাব্বির",
  "রিয়াদ",
  "মুন্না",
  "তুহিন",
  "রাজু",
  "সুমাইয়া",
  "নুসরাত",
  "তানিয়া",
  "মিতু",
  "সাদিয়া",
  "জান্নাত",
] as const;

const METHODS = ["bKash", "Nagad", "Rocket"] as const;

type Row = {
  id: number;
  name: string;
  method: string;
  amount: number;
  minutes: number;
};

/** Deterministic PRNG so the first render matches between server and browser. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const mask = (name: string) => `${name.slice(0, 3)}***`;

function makeRow(rand: () => number, id: number, minutes: number): Row {
  const name = NAMES[Math.floor(rand() * NAMES.length)] ?? "রাকিব";
  const method = METHODS[Math.floor(rand() * METHODS.length)] ?? "bKash";
  // ৫০০ – ৫,৫০০ টাকার মধ্যে, ১ টাকার ঘরে র‍্যান্ডম
  const amount = Math.round(500 + rand() * 5000);
  return { id, name: mask(name), method, amount, minutes };
}

const BASE_TOTAL = 596973;
const SEED = 7731;

function initialRows(count: number) {
  const rand = mulberry32(SEED);
  return Array.from({ length: count }, (_, i) => makeRow(rand, i, 3 + Math.floor(rand() * 26)));
}

export function LiveWithdraw({
  limit = 6,
  className = "",
  title = "লাইভ উইথড্র",
}: {
  limit?: number;
  className?: string;
  title?: string;
}) {
  const [rows, setRows] = useState<Row[]>(() => initialRows(limit));
  const [total, setTotal] = useState(BASE_TOTAL);

  useEffect(() => {
    let id = limit + 1;
    let timer: ReturnType<typeof setTimeout>;

    const loop = () => {
      timer = setTimeout(
        () => {
          const rand = Math.random;
          const row = makeRow(rand, id++, 0);
          setRows((prev) =>
            [row, ...prev.map((r) => ({ ...r, minutes: r.minutes + 1 }))].slice(0, limit),
          );
          setTotal((t) => t + row.amount);
          loop();
        },
        5000 + Math.random() * 5000,
      );
    };

    loop();
    return () => clearTimeout(timer);
  }, [limit]);

  return (
    <section className={`surface-card p-4 ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="animate-live-dot h-2.5 w-2.5 rounded-full bg-success" />
          <h2 className="font-display text-base font-extrabold">{title}</h2>
        </div>
        <p className="text-xs font-bold text-muted-foreground">
          মোট: <span className="text-gradient">{taka(total)}</span>
        </p>
      </div>

      <div className="space-y-2">
        {rows.map((r) => (
          <div
            key={r.id}
            className="animate-row-in flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-secondary/40 px-3 py-2.5"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-success/15">
                <ArrowUpRight className="h-4 w-4 text-success" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{r.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {r.method} • {r.minutes === 0 ? "এইমাত্র" : `${bn(r.minutes)} মিনিট আগে`}
                </p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-extrabold text-success">+{taka(r.amount)}</p>
              <p className="flex items-center justify-end gap-1 text-[10px] font-semibold text-muted-foreground">
                <BadgeCheck className="h-3 w-3 text-success" /> সফল
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
