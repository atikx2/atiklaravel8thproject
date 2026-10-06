import { Link } from "@tanstack/react-router";
import { Zap } from "lucide-react";

export function Logo({ to = "/", compact = false }: { to?: string; compact?: boolean }) {
  return (
    <Link to={to} className="flex min-w-0 items-center gap-2.5">
      <span className="bg-brand glow grid h-10 w-10 shrink-0 place-items-center rounded-2xl">
        <Zap className="h-5 w-5 fill-primary-foreground text-primary-foreground" />
      </span>
      {!compact && (
        <span className="font-display truncate text-lg leading-none font-extrabold tracking-tight">
          Smart <span className="text-brand">Job BD 26</span>
        </span>
      )}
    </Link>
  );
}
