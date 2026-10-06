import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { taka } from "@/lib/auth";
import { useSettings } from "@/lib/settings";
import { payLogo } from "@/lib/pay-logos";
import {
  MonitorPlay,
  Layers,
  ClipboardCheck,
  ShieldCheck,
  Clock3,
  Headphones,
  Sparkles,
  ArrowLeft,
  MessageCircle,
  Wallet,
} from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "সম্পর্কে ও সাপোর্ট | Smart Job BD 26" },
      {
        name: "description",
        content:
          "Smart Job BD 26 কীভাবে কাজ করে, পেমেন্ট নিয়ম ও সাপোর্টে যোগাযোগের সব তথ্য এক পেজে।",
      },
      { property: "og:title", content: "সম্পর্কে ও সাপোর্ট | Smart Job BD 26" },
      { property: "og:description", content: "প্ল্যাটফর্ম পরিচিতি, পেমেন্ট নিয়ম ও সাপোর্ট।" },
    ],
  }),
  component: AboutPage,
});

const HOW = [
  {
    icon: MonitorPlay,
    t: "বিজ্ঞাপন দেখে আয়",
    d: "প্রতিটি বিজ্ঞাপন নির্দিষ্ট সময় দেখলেই ব্যালেন্সে টাকা যোগ হয়।",
  },
  {
    icon: ClipboardCheck,
    t: "মাইক্রো টাস্ক",
    d: "ছোট কাজ করে প্রমাণ জমা দিন, অ্যাডমিন যাচাই করে পেমেন্ট দেয়।",
  },
  {
    icon: Layers,
    t: "প্ল্যান / প্যাকেজ",
    d: "প্যাকেজ কিনে প্রতিদিন নির্দিষ্টসংখ্যক বিজ্ঞাপন দেখে দৈনিক আয় করুন।",
  },
];

const RULES = [
  {
    icon: ShieldCheck,
    t: "একাউন্ট ভেরিফিকেশন",
    d: "প্রথম ডিপোজিট দিলেই একাউন্ট ভেরিফাই হয় ও কাজ আনলক হয়।",
  },
  { icon: Clock3, t: "পেমেন্টের সময়", d: "উইথড্র রিকোয়েস্ট ২৪ ঘণ্টার মধ্যে প্রসেস করা হয়।" },
  { icon: Sparkles, t: "কোনো হিডেন চার্জ নেই", d: "উইথড্রতে অতিরিক্ত কোনো ফি কাটা হয় না।" },
];

const faqList = (bonus: string) => [
  {
    q: "রেজিস্ট্রেশন করতে কি টাকা লাগে?",
    a: `না। একাউন্ট খোলা সম্পূর্ণ ফ্রি এবং সাথে সাথে ${bonus} বোনাস পাবেন।`,
  },
  {
    q: "বোনাস দিয়ে কি কাজ করা যায়?",
    a: "বোনাস ব্যালেন্সে যোগ হয়, তবে কাজ শুরু করতে অন্তত একবার ডিপোজিট করে একাউন্ট ভেরিফাই করতে হয়।",
  },
  { q: "টাকা কোথায় পাবো?", a: "বিকাশ ও নগদ — যে নাম্বার দেবেন সেখানেই পেমেন্ট পাঠানো হয়।" },
  {
    q: "ডিপোজিট অনুমোদন হতে কত সময় লাগে?",
    a: "সাধারণত কয়েক মিনিট থেকে সর্বোচ্চ কয়েক ঘণ্টার মধ্যে অনুমোদন হয়।",
  },
];

function AboutPage() {
  const settings = useSettings();
  const FAQ = faqList(taka(settings.signup_bonus));

  return (
    <div className="min-h-screen pb-16">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <Logo />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary/60 px-3 py-2 text-xs font-bold"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> হোম
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-4 px-4 py-5">
        <section
          className="glow relative overflow-hidden rounded-[28px] p-6"
          style={{ backgroundImage: "var(--gradient-brand)" }}
        >
          <span className="absolute -top-12 -right-10 h-40 w-40 rounded-full bg-primary-foreground/10" />
          <h1 className="font-display relative text-2xl font-extrabold text-primary-foreground">
            Smart Job BD 26 সম্পর্কে
          </h1>
          <p className="relative mt-2 text-sm text-primary-foreground/85">
            Smart Job BD 26 একটি বাংলাদেশি মাইক্রো-জব প্ল্যাটফর্ম। মোবাইল দিয়েই বিজ্ঞাপন দেখে,
            ভিডিও দেখে ও ছোট টাস্ক করে ঘরে বসে ইনকাম করা যায়। পেমেন্ট হয় বিকাশ ও নগদে।
          </p>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          {HOW.map((h) => (
            <div key={h.t} className="surface-card p-4">
              <span className="tile mb-3 grid h-11 w-11 place-items-center">
                <h.icon className="h-5 w-5 text-primary" />
              </span>
              <p className="font-display text-base font-extrabold">{h.t}</p>
              <p className="mt-1 text-xs text-muted-foreground">{h.d}</p>
            </div>
          ))}
        </section>

        <section className="surface-card p-4">
          <h2 className="font-display mb-3 text-lg font-extrabold">নিয়মকানুন</h2>
          <div className="space-y-2">
            {RULES.map((r) => (
              <div key={r.t} className="flex items-start gap-3 rounded-2xl bg-secondary/40 p-3">
                <span className="tile grid h-10 w-10 shrink-0 place-items-center">
                  <r.icon className="h-[18px] w-[18px] text-primary" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold">{r.t}</p>
                  <p className="text-xs text-muted-foreground">{r.d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="surface-card p-4">
          <h2 className="font-display mb-3 flex items-center gap-2 text-lg font-extrabold">
            <Wallet className="h-5 w-5 text-primary" /> পেমেন্ট মেথড
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {(["bkash", "nagad"] as const).map((m) => (
              <div key={m} className="tile flex items-center gap-3 p-3">
                <img
                  src={payLogo(m)}
                  alt={m}
                  className="h-9 w-9 shrink-0 rounded-lg object-contain"
                  loading="lazy"
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold">{m === "bkash" ? "বিকাশ" : "নগদ"}</p>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {m === "bkash" ? settings.bkash_number : settings.nagad_number}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            সর্বনিম্ন ডিপোজিট {taka(settings.min_deposit)} · সর্বনিম্ন উইথড্র{" "}
            {taka(settings.min_withdraw)}
          </p>
        </section>

        <section id="contact" className="surface-card p-4">
          <h2 className="font-display mb-3 flex items-center gap-2 text-lg font-extrabold">
            <Headphones className="h-5 w-5 text-primary" /> সাপোর্ট / যোগাযোগ
          </h2>
          <div className="space-y-2 text-sm">
            <p className="flex items-start gap-2 rounded-2xl bg-secondary/40 p-3">
              <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                যেকোনো সমস্যায় ডিপোজিট পেজে দেওয়া অফিশিয়াল নাম্বারে হোয়াটসঅ্যাপ/মেসেজ দিন —
                সাপোর্ট টিম ২৪ ঘণ্টার মধ্যে উত্তর দেয়।
              </span>
            </p>
            <p className="flex items-start gap-2 rounded-2xl bg-secondary/40 p-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              <span>
                পাসওয়ার্ড বা OTP কখনো কারও সাথে শেয়ার করবেন না — সাপোর্ট টিম কখনো পাসওয়ার্ড চায়
                না।
              </span>
            </p>
          </div>
        </section>

        <section className="surface-card p-4">
          <h2 className="font-display mb-3 text-lg font-extrabold">সাধারণ প্রশ্ন</h2>
          <div className="space-y-2">
            {FAQ.map((f) => (
              <details key={f.q} className="rounded-2xl bg-secondary/40 p-3">
                <summary className="cursor-pointer list-none text-sm font-bold">{f.q}</summary>
                <p className="mt-2 text-xs text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <Link
          to="/auth"
          className="bg-brand glow flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-extrabold text-primary-foreground"
        >
          <Sparkles className="h-4 w-4" /> ফ্রি একাউন্ট খুলুন
        </Link>
      </main>
    </div>
  );
}
