import { useEffect, useState } from "react";
import { BadgeCheck, TrendingUp } from "lucide-react";
import { taka } from "@/lib/auth";

const NAMES = [
  "At***", "Ra***", "Su***", "Me***", "Ji***", "Na***", "Fa***", "Sa***",
  "Ta***", "Ru***", "Ab***", "Sh***", "Im***", "Nu***", "Ha***",
];
const ACTIONS = ["উইথড্র করেছেন", "ইনকাম করেছেন", "পেমেন্ট পেয়েছেন"];
const WHEN = ["এইমাত্র", "১ মিনিট আগে", "২ মিনিট আগে", "৫ মিনিট আগে"];

const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)] as T;

type Toast = { id: number; name: string; action: string; amount: number; when: string };

export function LiveNotifications() {
  const [item, setItem] = useState<Toast | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const loop = () => {
      timer = setTimeout(() => {
        setItem({
          id: Date.now(),
          name: pick(NAMES),
          action: pick(ACTIONS),
          amount: (Math.floor(Math.random() * 28) + 3) * 50,
          when: pick(WHEN),
        });
        setTimeout(() => setItem(null), 5000);
        loop();
      }, 7000 + Math.random() * 6000);
    };
    loop();
    return () => clearTimeout(timer);
  }, []);

  if (!item) return null;

  return (
    <div className="pointer-events-none fixed bottom-24 left-3 z-50 sm:bottom-6">
      <div
        key={item.id}
        className="animate-float-in flex items-center gap-2.5 rounded-2xl border border-border bg-card/95 px-3.5 py-2.5 shadow-card backdrop-blur-xl"
      >
        <span className="bg-brand grid h-8 w-8 shrink-0 place-items-center rounded-full">
          <TrendingUp className="h-4 w-4 text-primary-foreground" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold">
            {item.name} {item.action} <span className="text-primary">{taka(item.amount)}</span>
          </p>
          <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <BadgeCheck className="h-3 w-3 text-success" /> {item.when}
          </p>
        </div>
      </div>
    </div>
  );
}
