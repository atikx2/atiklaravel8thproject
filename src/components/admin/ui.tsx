import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatusChip } from "@/routes/_authenticated/dashboard";

export function AdminPage({
  title,
  subtitle,
  icon: Icon,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="bg-brand grid h-10 w-10 shrink-0 place-items-center rounded-2xl">
            <Icon className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display truncate text-lg font-bold sm:text-xl">{title}</h1>
            {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {action}
      </header>
      {children}
    </div>
  );
}

export function Empty({ text = "কোনো তথ্য নেই।" }: { text?: string }) {
  return <p className="surface-card p-8 text-center text-sm text-muted-foreground">{text}</p>;
}

export function AdminField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-secondary/60 px-3 py-2.5 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

export function useSetStatus(table: "deposits" | "withdrawals" | "job_submissions") {
  const qc = useQueryClient();
  return async (id: string, status: "approved" | "rejected") => {
    await supabase.from(table).update({ status }).eq("id", id);
    void qc.invalidateQueries();
  };
}

export function ActionRow({ onOk, onNo, status }: { onOk: () => void; onNo: () => void; status: string }) {
  if (status !== "pending") return <StatusChip status={status} />;
  return (
    <div className="flex shrink-0 gap-1.5">
      <button onClick={onOk} className="rounded-lg bg-success/15 px-3 py-1.5 text-xs font-bold text-success">
        অনুমোদন
      </button>
      <button onClick={onNo} className="rounded-lg bg-destructive/15 px-3 py-1.5 text-xs font-bold text-destructive">
        বাতিল
      </button>
    </div>
  );
}

export function useProfileMap() {
  const { data } = useQuery({
    queryKey: ["admin", "profile-map"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("id,username,phone");
      const map: Record<string, { username: string; phone: string }> = {};
      for (const p of data ?? []) map[p.id] = { username: p.username, phone: p.phone };
      return map;
    },
  });
  return data ?? {};
}