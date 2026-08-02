import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { LiveNotifications } from "@/components/LiveNotifications";
import { taka, bn } from "@/lib/auth";
import { useSettings } from "@/lib/settings";
import {
  MonitorPlay,
  Youtube,
  ClipboardCheck,
  Wallet,
  ShieldCheck,
  Zap,
  Quote,
  ChevronRight,
  Users,
  CheckCircle2,
  BadgeDollarSign,
  Star,
  Rocket,
  Smartphone,
  MousePointerClick,
  Landmark,
  Lock,
  Clock3,
  HeadphonesIcon,
  Sparkles,
  UserPlus,
  Gift,
  CreditCard,
  Banknote,
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const WORKS = [
  {
    icon: MonitorPlay,
    t: "বিজ্ঞাপন দেখে ইনকাম",
    d: "প্রতিটি বিজ্ঞাপন ১৫–৩০ সেকেন্ড দেখলেই সাথে সাথে ব্যালেন্স যোগ হবে।",
    tone: "from-violet-500 to-indigo-500",
  },
  {
    icon: Youtube,
    t: "ভিডিও দেখে ইনকাম",
    d: "ছোট ছোট ভিডিও দেখুন, প্রতিটি ভিডিওতে নির্দিষ্ট টাকা পাবেন।",
    tone: "from-rose-500 to-orange-500",
  },
  {
    icon: ClipboardCheck,
    t: "মাইক্রো টাস্ক",
    d: "সহজ কাজ করে প্রমাণ জমা দিন, অ্যাডমিন যাচাই করে টাকা দিয়ে দেবে।",
    tone: "from-emerald-500 to-teal-500",
  },
];

const STEPS = [
  { icon: UserPlus, t: "ফ্রি একাউন্ট খুলুন", d: "ইউজারনেম, ফোন নাম্বার ও পাসওয়ার্ড দিলেই একাউন্ট রেডি।" },
  { icon: Gift, t: "২০০ টাকা বোনাস", d: "রেজিস্ট্রেশন করলেই সাথে সাথে ২০০ টাকা সাইনআপ বোনাস।" },
  { icon: CreditCard, t: "একাউন্ট চালু করুন", d: "বিকাশ/নগদে প্রথম ডিপোজিট দিয়ে কাজ আনলক করুন।" },
  { icon: Banknote, t: "ইনকাম ও উইথড্র", d: "প্রতিদিন কাজ করুন, যেকোনো সময় টাকা তুলে নিন।" },
];

const REVIEWS = [
  {
    n: "রাকিব হাসান",
    c: "ঢাকা",
    r: "প্রথমে বিশ্বাস হয়নি, কিন্তু ৩ দিনেই ১২০০ টাকা বিকাশে পেয়েছি। কাজগুলো খুব সহজ, মোবাইল দিয়েই হয়।",
    amt: 1200,
  },
  {
    n: "সুমাইয়া আক্তার",
    c: "সিলেট",
    r: "স্টুডেন্ট হিসেবে পড়ার ফাঁকে ভিডিও দেখে প্রতিদিন ২০০–৩০০ টাকা ইনকাম হচ্ছে। ইন্টারফেসটাও অনেক সহজ।",
    amt: 8400,
  },
  {
    n: "মেহেদী হাসান",
    c: "চট্টগ্রাম",
    r: "উইথড্র দিলে ২৪ ঘণ্টার ভিতরে নগদে টাকা চলে আসে। সাপোর্ট টিমও দ্রুত রিপ্লাই দেয়।",
    amt: 15600,
  },
];

const STATS = [
  { icon: Users, v: "১৫,০০০+", l: "নিবন্ধিত সদস্য", tone: "text-primary bg-primary/10" },
  { icon: CheckCircle2, v: "১,২০,০০০+", l: "সফল টাস্ক", tone: "text-success bg-success/10" },
  { icon: BadgeDollarSign, v: "৳১২,৫০,০০০+", l: "মোট পেমেন্ট", tone: "text-info bg-info/10" },
  { icon: Star, v: "৪.৯/৫", l: "ব্যবহারকারী রেটিং", tone: "text-warning bg-warning/10" },
];

const WHY = [
  { icon: ShieldCheck, t: "নিরাপদ প্ল্যাটফর্ম", d: "প্রতিটি একাউন্ট ও পেমেন্ট সুরক্ষিত ও যাচাইকৃত।", tone: "from-emerald-500 to-green-500" },
  { icon: Rocket, t: "দ্রুত Approval", d: "কাজ ও ডিপোজিট দ্রুত যাচাই করে অনুমোদন দেওয়া হয়।", tone: "from-violet-500 to-fuchsia-500" },
  { icon: MousePointerClick, t: "সহজে আয়", d: "শুধু ক্লিক, দেখা আর ছোট টাস্ক — কোনো স্কিল লাগে না।", tone: "from-amber-500 to-orange-500" },
  { icon: Smartphone, t: "মোবাইল ফ্রেন্ডলি", d: "অ্যাপের মতো ইন্টারফেস, যেকোনো ফোনে চলবে।", tone: "from-sky-500 to-cyan-500" },
  { icon: ClipboardCheck, t: "সহজ টাস্ক", d: "প্রতিদিন নতুন সহজ কাজ, ঘরে বসেই করা যায়।", tone: "from-rose-500 to-pink-500" },
  { icon: Landmark, t: "বাংলাদেশি Payment", d: "বিকাশ ও নগদে সরাসরি টাকা উত্তোলন।", tone: "from-indigo-500 to-blue-500" },
];

const TRUST = [
  { icon: Lock, t: "SSL সুরক্ষিত" },
  { icon: Clock3, t: "২৪ ঘণ্টায় পেমেন্ট" },
  { icon: HeadphonesIcon, t: "বাংলা সাপোর্ট" },
  { icon: Sparkles, t: "কোনো হিডেন চার্জ নেই" },
];

const FAQS = [
  { q: "রেজিস্ট্রেশন করতে কি টাকা লাগে?", a: "না, রেজিস্ট্রেশন সম্পূর্ণ ফ্রি। বরং একাউন্ট খুললেই ২০০ টাকা বোনাস পাবেন।" },
  { q: "কাজ শুরু করতে ডিপোজিট কেন লাগে?", a: "ফেক একাউন্ট বন্ধ রাখতে ও পেমেন্ট নিশ্চিত করতে প্রথমবার একটি ছোট ডিপোজিট দিয়ে একাউন্ট ভেরিফাই করতে হয়।" },
  { q: "টাকা কত দিনে পাবো?", a: "উইথড্র রিকোয়েস্ট দেওয়ার সর্বোচ্চ ২৪ ঘণ্টার মধ্যে বিকাশ বা নগদে টাকা পাঠানো হয়।" },
  { q: "প্রতিদিন কত ইনকাম করা যায়?", a: "কাজের পরিমাণের উপর নির্ভর করে সাধারণত প্রতিদিন ২০০–৫০০ টাকা পর্যন্ত ইনকাম করা সম্ভব।" },
];

function Landing() {
  const settings = useSettings();

  return (
    <div className="min-h-screen bg-background">
      <LiveNotifications />

      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo />
          <Link
            to="/auth"
            className="bg-brand inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-primary-foreground shadow-glow"
          >
            <Lock className="h-3.5 w-3.5" /> লগইন
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden px-4 py-16" style={{ backgroundImage: "var(--gradient-hero)" }}>
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-card px-3.5 py-1.5 text-xs font-bold text-primary shadow-card">
              <Zap className="h-3.5 w-3.5" /> নতুন রেজিস্ট্রেশনে {taka(200)} বোনাস
            </span>
            <h1 className="font-display mt-5 text-3xl leading-tight font-extrabold sm:text-5xl">
              মোবাইল দিয়েই কাজ করে <span className="text-gradient">প্রতিদিন ইনকাম</span> করুন
            </h1>
            <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-sm sm:text-base">
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
                className="border-border bg-card inline-flex items-center justify-center gap-1.5 rounded-2xl border px-6 py-3.5 text-sm font-bold shadow-card"
              >
                <Lock className="h-4 w-4 text-primary" /> লগইন করুন
              </Link>
            </div>

            <div className="text-muted-foreground mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold">
              {TRUST.map((t) => (
                <span key={t.t} className="inline-flex items-center gap-1.5">
                  <t.icon className="h-3.5 w-3.5 text-success" /> {t.t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Trust counters */}
        <section className="mx-auto -mt-6 max-w-6xl px-4">
          <div className="surface-card grid grid-cols-2 gap-3 p-4 sm:grid-cols-4 sm:p-6">
            {STATS.map((s) => (
              <div key={s.l} className="flex flex-col items-center gap-2 text-center">
                <span className={`grid h-11 w-11 place-items-center rounded-2xl ${s.tone}`}>
                  <s.icon className="h-5 w-5" />
                </span>
                <p className="font-display text-lg font-extrabold sm:text-xl">{s.v}</p>
                <p className="text-muted-foreground -mt-1.5 text-[11px] font-medium sm:text-xs">{s.l}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How to earn */}
        <section className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="font-display text-center text-2xl font-bold">কীভাবে ইনকাম করবেন?</h2>
          <p className="text-muted-foreground mt-2 text-center text-sm">তিনটি সহজ উপায়ে আজই আয় শুরু করুন</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {WORKS.map((w) => (
              <div key={w.t} className="surface-card p-5 transition-shadow hover:shadow-glow">
                <div className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${w.tone} text-white`}>
                  <w.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display mt-4 text-base font-bold">{w.t}</h3>
                <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">{w.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why choose */}
        <section className="border-border/70 bg-secondary/50 border-y px-4 py-14">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display text-center text-2xl font-bold">
              কেন <span className="text-gradient">SmartJobBD26</span>?
            </h2>
            <p className="text-muted-foreground mt-2 text-center text-sm">হাজারো ব্যবহারকারীর আস্থার কারণগুলো</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {WHY.map((w) => (
                <div key={w.t} className="surface-card flex items-start gap-3 p-5">
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${w.tone} text-white`}>
                    <w.icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-sm font-bold">{w.t}</h3>
                    <p className="text-muted-foreground mt-1 text-xs leading-relaxed">{w.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="font-display text-center text-2xl font-bold">মাত্র ৪ ধাপে শুরু</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <div key={s.t} className="surface-card relative p-5">
                <span className="font-display text-secondary-foreground/10 absolute top-3 right-4 text-4xl font-extrabold">
                  {bn(i + 1)}
                </span>
                <span className="bg-brand grid h-11 w-11 place-items-center rounded-2xl text-primary-foreground">
                  <s.icon className="h-5 w-5" />
                </span>
                <h3 className="font-display mt-4 text-sm font-bold">{s.t}</h3>
                <p className="text-muted-foreground mt-1 text-xs leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="border-border/70 bg-secondary/50 border-y px-4 py-14">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display text-center text-2xl font-bold">ব্যবহারকারীদের অভিজ্ঞতা</h2>
            <p className="text-muted-foreground mt-2 text-center text-sm">যারা প্রতিদিন Smartjobbd26 থেকে আয় করছেন</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {REVIEWS.map((r) => (
                <figure key={r.n} className="surface-card flex flex-col p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                      ))}
                    </div>
                    <Quote className="h-5 w-5 text-primary/40" />
                  </div>
                  <blockquote className="text-muted-foreground mt-3 grow text-sm leading-relaxed">{r.r}</blockquote>
                  <figcaption className="border-border/70 mt-4 flex items-center gap-3 border-t pt-3">
                    <span className="bg-brand font-display grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold text-primary-foreground">
                      {r.n.charAt(0)}
                    </span>
                    <div className="min-w-0">
                      <p className="flex items-center gap-1 text-sm font-bold">
                        {r.n} <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {r.c} · মোট আয় {taka(r.amt)}
                      </p>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* Payment + FAQ */}
        <section className="mx-auto max-w-6xl px-4 py-14">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="surface-card p-6">
              <h2 className="font-display flex items-center gap-2 text-lg font-bold">
                <Wallet className="h-5 w-5 text-primary" /> পেমেন্ট মেথড
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-pink/30 bg-pink/10 p-4 text-center">
                  <p className="font-display text-base font-extrabold text-pink">বিকাশ</p>
                  <p className="text-muted-foreground mt-1 text-xs">ডিপোজিট ও উইথড্র</p>
                </div>
                <div className="rounded-2xl border border-warning/40 bg-warning/10 p-4 text-center">
                  <p className="font-display text-base font-extrabold text-warning">নগদ</p>
                  <p className="text-muted-foreground mt-1 text-xs">ডিপোজিট ও উইথড্র</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-success" /> সর্বনিম্ন উইথড্র {taka(settings.min_withdraw)}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-success" /> ২৪ ঘণ্টার মধ্যে পেমেন্ট
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-success" /> কোনো এক্সট্রা চার্জ নেই
                </li>
              </ul>
            </div>

            <div className="surface-card p-6">
              <h2 className="font-display flex items-center gap-2 text-lg font-bold">
                <HeadphonesIcon className="h-5 w-5 text-primary" /> সাধারণ প্রশ্ন
              </h2>
              <div className="mt-4 space-y-3">
                {FAQS.map((f) => (
                  <details key={f.q} className="border-border/70 bg-secondary/60 rounded-xl border p-3">
                    <summary className="cursor-pointer list-none text-sm font-bold">{f.q}</summary>
                    <p className="text-muted-foreground mt-2 text-xs leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="bg-brand shadow-glow rounded-3xl px-6 py-10 text-center">
            <h2 className="font-display text-2xl font-extrabold text-primary-foreground">আজই শুরু করুন</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-primary-foreground/85">
              ফ্রি একাউন্ট খুলুন, {taka(200)} বোনাস নিন এবং আজ থেকেই ইনকাম শুরু করুন।
            </p>
            <Link
              to="/auth"
              search={{ mode: "register" }}
              className="bg-card text-foreground mt-6 inline-flex items-center gap-1.5 rounded-2xl px-6 py-3.5 text-sm font-bold shadow-card"
            >
              <Rocket className="h-4 w-4 text-primary" /> ফ্রি একাউন্ট খুলুন
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-border/70 bg-secondary/40 border-t px-4 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center">
          <Logo />
          <p className="text-muted-foreground max-w-md text-xs leading-relaxed">
            Smartjobbd26 — বাংলাদেশের বিশ্বস্ত মাইক্রোজব প্ল্যাটফর্ম। ঘরে বসে মোবাইল দিয়ে আয় করুন।
          </p>
          <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium">
            <Link to="/auth" className="hover:text-primary">লগইন</Link>
            <Link to="/auth" search={{ mode: "register" }} className="hover:text-primary">রেজিস্ট্রেশন</Link>
            <Link to="/admin-login" className="hover:text-primary">অ্যাডমিন</Link>
          </div>
          <p className="text-muted-foreground border-border/70 w-full border-t pt-4 text-[11px]">
            © {bn(2026)} Smartjobbd26 — সকল অধিকার সংরক্ষিত।
          </p>
        </div>
      </footer>
    </div>
  );
}
