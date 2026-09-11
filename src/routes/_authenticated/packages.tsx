import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, taka, bn } from "@/lib/auth";
import { usePackages } from "@/lib/packages";
import { Crown, Tag, Rocket, ShieldCheck, Gift, Play, Coins, CalendarDays, ShoppingCart, Sparkles, CheckCircle2 } from "lucide-react";

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

function PackagesPage() {
  const packages = usePackages();
  const { user } = useAuth();

  const { data: mine } = useQuery({
    queryKey: ["my-packages", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("package_purchases")
        .select("id,price,daily_income,expires_at,created_at")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

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
          <PackageCard key={p.id} p={p} index={i} />
        ))}
        {packages.length === 0 && (
          <p className="surface-card p-8 text-center text-sm text-muted-foreground">এখন কোনো প্যাকেজ নেই।</p>
        )}
      </div>

      {(mine?.length ?? 0) > 0 && (
        <div className="surface-card p-4">
          <h2 className="mb-3 font-display text-base font-bold">আপনার প্যাকেজ</h2>
          <div className="space-y-2">
            {(mine ?? []).map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-3 rounded-xl bg-secondary/60 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-bold">{taka(m.price)}</p>
                  <p className="text-xs text-muted-foreground">
                    দৈনিক {taka(m.daily_income)} · মেয়াদ {bn(new Date(m.expires_at).toLocaleDateString("en-GB"))}
                  </p>
                </div>
                <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PackageCard({ p, index }: { p: import("@/lib/packages").Package; index: number }) {
  const popular = index === 1;
  return (
    <div className="overflow-hidden rounded-[28px] bg-card shadow-[0_20px_50px_-20px_oklch(0.55_0.2_285/0.5)] ring-1 ring-border">
      {/* Header */}
      <div className="relative px-5 pt-6 pb-7" style={{ backgroundImage: "var(--gradient-brand)" }}>
        <Crown className="absolute top-3 right-4 h-7 w-7 fill-warning text-warning" />
        <p className="font-display text-center text-2xl font-extrabold text-primary-foreground">
          package_{index + 1}
        </p>
        <p className="mt-1 text-center text-sm font-semibold text-primary-foreground/85">বিনিয়োগ প্যাকেজ</p>
        {popular && (
          <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-warning px-3 py-0.5 text-[11px] font-extrabold text-warning-foreground shadow">
            জনপ্রিয়
          </span>
        )}
      </div>

      <div className="space-y-5 px-5 py-6">
        {/* Price */}
        <div className="text-center">
          <p className="font-display text-4xl font-extrabold text-foreground drop-shadow-sm">{taka(p.price)}</p>
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-warning px-4 py-1.5 text-xs font-extrabold text-warning-foreground shadow-md shadow-warning/40">
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
        <Link
          to="/deposit"
          search={{ pkg: p.id }}
          className="flex items-center justify-center gap-2 rounded-2xl py-4 text-base font-extrabold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-[1.02]"
          style={{ backgroundImage: "var(--gradient-brand)" }}
        >
          <ShoppingCart className="h-5 w-5" /> প্যাকেজ কিনুন
        </Link>
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
