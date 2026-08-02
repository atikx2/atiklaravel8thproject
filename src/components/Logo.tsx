import { Link } from "@tanstack/react-router";
import { Zap } from "lucide-react";

export function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="flex min-w-0 items-center gap-2">
      <span className="bg-brand grid h-9 w-9 shrink-0 place-items-center rounded-xl">
        <Zap className="h-5 w-5 text-primary-foreground" />
      </span>
      <span className="font-display truncate text-lg leading-none font-bold tracking-tight">
        Smart<span className="text-brand">jobbd</span>26
      </span>
    </Link>
  );
}