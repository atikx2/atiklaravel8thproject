import { createFileRoute, Link } from "@tanstack/react-router";
import { taka, bn } from "@/lib/auth";
import { usePackages, useMyPurchases, useMyPendingPackageIds, isActivePurchase } from "@/lib/packages";
import { Crown, Tag, Rocket, ShieldCheck, Gift, Play, Coins, CalendarDays, ShoppingCart, Sparkles, CheckCircle2, Clock, History } from "lucide-react";

export const Route = createFileRoute("/_authenticated/packages")({
  head: () => ({
    meta: [
      { title: "বিনিয়োগ প্যাকেজ | Smartjobbd26" },
      { name: "description", content: "৳৫০০ থেকে শুরু বিনিয়োগ প্যাকেজ কিনে প্রতিদিন বিজ্ঞাপন দেখে আয় করুন।" },
      { property: "og:title", content: "বিনিয়োগ প্যাকেজ | Smartjobbd26" },
      { property: "og:description", content: "৬০ দিনের বৈধতা, দৈনিক নির্দিষ্ট আয়।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PackagesPage,
});

const fmtDate = (d: string) => bn(new Date(d).toLocaleDateString("en-GB"));

function PackagesPage() {
  const packages = usePackages();
  const { data: mine, isLoading } = useMyPurchases();
  const pending = useMyPendingPackageIds();
  const activeIds = new Set((mine ?? []).filter(isActivePurchase).map((m) => m.package_id));

  return (
    <div className="space-y-5">
      <header className="surface-card glow p-5" style={{ backgroundImage: "var(--gradient-brand)" }}>
        <p className="flex items-center gap-2 text-sm font-semibold text-primary-foreground/85">
          <Sparkles className="h-4 w-4" /> বিনিয়োগ প্যাকেজ
        </p>
        <h1 className="font-display text-2xl font-extrabold text-primary-foreground">
          প্যাকেজ কিনে প্রতিদিন আয় করুন
        </h1>
        <p className="mt-1 text-xs text-primary-foreground/80">
          এককালীন বিনিয়োগ, প্রতিদিন বিজ্ঞাপন দেখুন আর নির্দিষ্ট আয় বুঝে নিন।
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {packages.map((p, i) => (
          <PackageCard
            key={p.id}
            p={p}
            index={i}
            state={activeIds.has(p.id) ? "active" : pending.includes(p.id) ? "pending" : "buy"}
          />
        ))}
        {packages.length === 0 && (
          <p className="surface-card p-8 text-center text-sm text-muted-foreground">এখন কোনো প্যাকেজ নেই।</p>
        )}
      </div>

      <div className="surface-card p-4">
        <h2 className="mb-3 flex items-center gap-2 font-display text-base font-bold">
          <History className="h-4 w-4 text-primary" /> আপনার প্যাকেজ ইতিহাস
        </h2>
        <div className="space-y-2">
          {(mine ?? []).map((m) => {
            const active = isActivePurchase(m);
            return (
              <div key={m.id} className="flex items-center justify-between gap-3 rounded-xl bg-secondary/60 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-bold">
                    {m.packages?.name ?? "প্যাকেজ"} · {taka(m.price)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    দৈনিক {bn(m.daily_ads)} বিজ্ঞাপন · {taka(m.daily_income)} · কেনা {fmtDate(m.created_at)} · মেয়াদ {fmtDate(m.expires_at)}
                  </p>
                </div>
                <span
                  className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                    active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> {active ? "সক্রিয়" : "মেয়াদ শেষ"}
                </span>
              </div>
            );
          })}
          {!isLoading && (mine?.length ?? 0) === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">এখনো কোনো প্যাকেজ কেনা হয়নি।</p>
          )}
        </div>
      </div>
    </div>
  );
}

function PackageCard({
  p,
  index,
  state,
}: {
  p: import("@/lib/packages").Package;
  index: number;
  state: "active" | "pending" | "buy";
}) {
  const popular = index === 1;
  return (
    <div className="overflow-hidden rounded-[28px] bg-card shadow-[0_22px_55px_-24px_oklch(0.6672_0.2289_8.84/0.45)] ring-1 ring-border">
      {/* Header */}
      <div className="relative px-5 pt-6 pb-7" style={{ backgroundImage: "var(--gradient-brand)" }}>
        <Crown className="absolute top-3 right-4 h-7 w-7 fill-warning text-warning" />
        <p className="font-display text-center text-2xl font-extrabold text-primary-foreground">
          package_{index + 1}
        </p>
        <p className="mt-1 text-center text-sm font-semibold text-primary-foreground/85">বিনিয়োগ প্যাকেজ</p>
        {popular && (
          <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-warning px-3 py-0.5 text-[11px] font-extrabold text-primary-foreground shadow">
            জনপ্রিয়
          </span>
        )}
      </div>

      <div className="space-y-5 px-5 py-6">
        {/* Price */}
        <div className="text-center">
          <p className="font-display text-4xl font-extrabold text-foreground drop-shadow-sm">{taka(p.price)}</p>
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-warning px-4 py-1.5 text-xs font-extrabold text-primary-foreground shadow-md shadow-warning/40">
            <Tag className="h-3.5 w-3.5" /> এককালীন বিনিয়োগ
          </span>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2">
          <Pill className="bg-success text-primary-foreground shadow-success/40" icon={Rocket} text="দ্রুত আয়" />
          <Pill className="bg-info text-primary-foreground shadow-info/40" icon={ShieldCheck} text="নিরাপদ" />
          <Pill className="bg-destructive text-primary-foreground shadow-destructive/40" icon={Gift} text="বোনাস" />
        </div>

        {/* Detail rows */}
        <ul className="space-y-4">
          <DetailRow
            color="bg-success"
            icon={Play}
            title={`${bn(p.daily_ads)} দৈনিক বিজ্ঞাপন`}
            sub="টাকা আয় করতে বিজ্ঞাপন দেখুন"
          />
          <DetailRow
            color="bg-warning"
            icon={Coins}
            title={`${taka(p.daily_income)} দৈনিক আয়`}
            sub={`${bn(p.validity_days)} দিনে মোট ${taka(p.daily_income * p.validity_days)}`}
          />
          <DetailRow
            color="bg-destructive"
            icon={CalendarDays}
            title={`${bn(p.validity_days)} দিনের বৈধতা`}
            sub={`${bn(p.validity_days)} দিন পর প্যাকেজ মেয়াদ শেষ`}
          />
        </ul>

        {/* CTA */}
        {state === "buy" ? (
          <Link
            to="/deposit"
            search={{ pkg: p.id }}
            className="flex items-center justify-center gap-2 rounded-2xl py-4 text-base font-extrabold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-[1.02]"
            style={{ backgroundImage: "var(--gradient-brand)" }}
          >
            <ShoppingCart className="h-5 w-5" /> প্যাকেজ কিনুন
          </Link>
        ) : (
          <div
            className={`flex items-center justify-center gap-2 rounded-2xl py-4 text-base font-extrabold ${
              state === "active" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
            }`}
          >
            {state === "active" ? (
              <><CheckCircle2 className="h-5 w-5" /> সক্রিয় · মেয়াদ শেষে আবার কিনুন</>
            ) : (
              <><Clock className="h-5 w-5" /> অনুমোদনের অপেক্ষায়</>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Pill({ icon: Icon, text, className }: { icon: React.ElementType; text: string; className: string }) {
  return (
    <span className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-extrabold shadow-md ${className}`}>
      <Icon className="h-3.5 w-3.5" /> {text}
    </span>
  );
}

function DetailRow({ color, icon: Icon, title, sub }: { color: string; icon: React.ElementType; title: string; sub: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-primary-foreground shadow-md ${color}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-extrabold text-primary">{title}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
    </li>
  );
}
