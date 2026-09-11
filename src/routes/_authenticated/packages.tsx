import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, taka, bn } from "@/lib/auth";
import { usePackages } from "@/lib/packages";
import { Zap, ShieldCheck, Gift, Tv, TrendingUp, CalendarClock, Sparkles, CheckCircle2 } from "lucide-react";

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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {packages.map((p) => (
          <div key={p.id} className="surface-card flex flex-col gap-4 p-5">
            <div>
              <p className="text-xs font-bold text-muted-foreground">বিনিয়োগ প্যাকেজ</p>
              <p className="font-display text-3xl font-extrabold text-primary">{taka(p.price)}</p>
              <p className="text-xs text-muted-foreground">এককালীন বিনিয়োগ</p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <Badge icon={Zap} text="দ্রুত আয়" />
              <Badge icon={ShieldCheck} text="নিরাপদ" />
              <Badge icon={Gift} text="বোনাস" />
            </div>

            <ul className="space-y-2.5">
              <Row
                icon={Tv}
                title={`${bn(p.daily_ads)} দৈনিক বিজ্ঞাপন`}
                sub="টাকা আয় করতে বিজ্ঞাপন দেখুন"
              />
              <Row
                icon={TrendingUp}
                title={`${taka(p.daily_income)} দৈনিক আয়`}
                sub={`${bn(p.validity_days)} দিনে মোট ${taka(p.daily_income * p.validity_days)}`}
              />
              <Row
                icon={CalendarClock}
                title={`${bn(p.validity_days)} দিনের বৈধতা`}
                sub={`${bn(p.validity_days)} দিন পর প্যাকেজ মেয়াদ শেষ`}
              />
            </ul>

            <Link
              to="/deposit"
              search={{ pkg: p.id }}
              className="bg-brand mt-auto grid place-items-center rounded-2xl py-3 text-sm font-bold text-primary-foreground"
            >
              প্যাকেজ কিনুন
            </Link>
          </div>
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

function Badge({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
      <Icon className="h-3.5 w-3.5" /> {text}
    </span>
  );
}

function Row({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub: string }) {
  return (
    <li className="flex items-start gap-2.5 rounded-xl bg-secondary/60 px-3 py-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-sm font-bold">{title}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
    </li>
  );
}
