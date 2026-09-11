import { useEffect, useRef, useState } from "react";

const bnDigits = (s: string) => s.replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]!);

export function CountUp({
  to,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1600,
}: {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const run = () => {
      if (started.current) return;
      started.current = true;
      const start = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setValue(to * eased);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) run();
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);

  const text = decimals
    ? value.toFixed(decimals)
    : Math.round(value).toLocaleString("en-US");

  return (
    <span ref={ref}>
      {prefix}
      {bnDigits(text)}
      {suffix}
    </span>
  );
}
