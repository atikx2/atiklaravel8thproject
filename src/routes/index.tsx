import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { taka, bn } from "@/lib/auth";
import {
  MonitorPlay,
  Youtube,
  ClipboardCheck,
  Wallet,
  ShieldCheck,
  Zap,
  Quote,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smartjobbd26 — মোবাইলে কাজ করে ইনকাম" },
      {
        name: "description",
        content:
          "বিজ্ঞাপন দেখে, ভিডিও দেখে ও মাইক্রো টাস্ক করে প্রতিদিন ইনকাম করুন। রেজিস্ট্রেশনে ২০০ টাকা বোনাস, বিকাশ ও নগদে উইথড্র।",
      },
      { property: "og:title", content: "Smartjobbd26 — মোবাইলে কাজ করে ইনকাম" },
      {
        property: "og:description",
        content: "বিজ্ঞাপন ও ভিডিও দেখে ইনকাম করুন। ২০০ টাকা সাইনআপ বোনাস, বিকাশ/নগদে উইথড্র।",
      },
    ],
  }),
  component: Landing,
});

const WORKS = [
  { icon: MonitorPlay, t: "বিজ্ঞাপন দেখে ইনকাম", d: "প্রতিটি বিজ্ঞাপন ১৫–৩০ সেকেন্ড দেখলেই সাথে সাথে ব্যালেন্স যোগ হবে।" },
  { icon: Youtube, t: "ভিডিও দেখে ইনকাম", d: "ছোট ছোট ভিডিও দেখুন, প্রতিটি ভিডিওতে নির্দিষ্ট টাকা পাবেন।" },
  { icon: ClipboardCheck, t: "মাইক্রো টাস্ক", d: "সহজ কাজ করে প্রমাণ জমা দিন, অ্যাডমিন যাচাই করে টাকা দিয়ে দেবে।" },
];

const STEPS = [
  "ইউজারনেম, ফোন নাম্বার ও পাসওয়ার্ড দিয়ে ফ্রি একাউন্ট খুলুন",
  "রেজিস্ট্রেশনেই পেয়ে যান ২০০ টাকা সাইনআপ বোনাস",
  "একাউন্ট চালু করতে প্রথম ডিপোজিট করুন (বিকাশ/নগদ)",
  "প্রতিদিন কাজ করে ইনকাম করুন ও যেকোনো সময় উইথড্র নিন",
];

const REVIEWS = [
  { n: "রাকিব হাসান", c: "ঢাকা", r: "প্রথমে বিশ্বাস হয়নি, কিন্তু ৩ দিনেই ১২০০ টাকা বিকাশে পেয়েছি। কাজগুলো খুব সহজ।" },
  { n: "সুমাইয়া আক্তার", c: "সিলেট", r: "মোবাইল দিয়েই ভিডিও দেখে প্রতিদিন ২০০–৩০০ টাকা ইনকাম হচ্ছে। স্টুডেন্টদের জন্য দারুণ।" },
  { n: "মেহেদী হাসান", c: "চট্টগ্রাম", r: "উইথড্র দিলে ২৪ ঘণ্টার ভিতরে নগদে টাকা চলে আসে। সাপোর্টও ভালো।" },
];

const STATS = [
  { v: "২৫,০০০+", l: "একটিভ ইউজার" },
  { v: "৪২ লাখ+", l: "পেমেন্ট দেওয়া হয়েছে" },
  { v: "২৪ ঘণ্টা", l: "উইথড্র সময়" },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Logo />
          <Link
            to="/auth"
            className="bg-brand rounded-xl px-4 py-2 text-sm font-bold text-primary-foreground shadow-glow"
          >
            লগইন
          </Link>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-4 py-14" style={{ backgroundImage: "var(--gradient-hero)" }}>
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <Zap className="h-3.5 w-3.5" /> নতুন রেজিস্ট্রেশনে {taka(200)} বোনাস
            </span>
            <h1 className="mt-5 font-display text-3xl font-extrabold leading-tight sm:text-5xl">
              মোবাইল দিয়েই কাজ করে <span className="text-gradient">প্রতিদিন ইনকাম</span> করুন
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
              Smartjobbd26 বাংলাদেশের সহজ মাইক্রোজব প্ল্যাটফর্ম। বিজ্ঞাপন দেখুন, ভিডিও দেখুন, ছোট কাজ করুন — আর
              বিকাশ বা নগদে টাকা তুলে নিন।
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/auth"
                search={{ mode: "register" }}
                className="bg-brand inline-flex items-center justify-center gap-1 rounded-2xl px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-glow"
              >
                ফ্রি রেজিস্ট্রেশন করুন <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center justify-center rounded-2xl border border-border bg-card px-6 py-3.5 text-sm font-bold"
              >
                লগইন করুন
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-3">
              {STATS.map((s) => (
                <div key={s.l} className="surface-card p-3">
                  <p className="font-display text-lg font-extrabold text-primary">{s.v}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14">
          <h2 className="text-center font-display text-2xl font-bold">কীভাবে ইনকাম করবেন?</h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">তিনটি সহজ উপায়ে আয় শুরু করুন</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {WORKS.map((w) => (
              <div key={w.t} className="surface-card p-5">
                <div className="bg-brand grid h-11 w-11 place-items-center rounded-2xl text-primary-foreground">
                  <w.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-base font-bold">{w.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{w.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-border/60 bg-card/40 px-4 py-14">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center font-display text-2xl font-bold">মাত্র ৪ ধাপে শুরু</h2>
            <ol className="mt-8 space-y-3">
              {STEPS.map((s, i) => (
                <li key={s} className="surface-card flex items-start gap-3 p-4">
                  <span className="bg-brand grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold text-primary-foreground">
                    {bn(i + 1)}
                  </span>
                  <p className="min-w-0 text-sm">{s}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14">
          <h2 className="text-center font-display text-2xl font-bold">ইউজারদের অভিজ্ঞতা</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {REVIEWS.map((r) => (
              <div key={r.n} className="surface-card p-5">
                <Quote className="h-5 w-5 text-primary" />
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.r}</p>
                <div className="mt-4 border-t border-border/60 pt-3">
                  <p className="text-sm font-bold">{r.n}</p>
                  <p className="text-xs text-muted-foreground">{r.c}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-14">
          <div className="surface-card grid gap-4 p-6 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <Wallet className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-bold">বিকাশ ও নগদে পেমেন্ট</p>
                <p className="text-sm text-muted-foreground">সর্বনিম্ন {taka(300)} থেকে উইথড্র করা যায়।</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-bold">নিরাপদ ও যাচাইকৃত</p>
                <p className="text-sm text-muted-foreground">প্রতিটি কাজ ও পেমেন্ট অ্যাডমিন যাচাই করে।</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 px-4 py-8 text-center">
        <Logo />
        <p className="mt-3 text-xs text-muted-foreground">© {bn(2026)} Smartjobbd26 — সকল অধিকার সংরক্ষিত।</p>
        <Link to="/admin-login" className="mt-2 inline-block text-xs text-muted-foreground underline">
          অ্যাডমিন লগইন
        </Link>
      </footer>
    </div>
  );
}
