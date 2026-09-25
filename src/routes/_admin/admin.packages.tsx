import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { taka, bn } from "@/lib/auth";
import { usePackages, type Package } from "@/lib/packages";
import { AdminPage, AdminField, Empty } from "@/components/admin/ui";
import { Package as PackageIcon, Plus, Trash2, Save } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/packages")({
  head: () => ({
    meta: [
      { title: "প্যাকেজ ম্যানেজমেন্ট | অ্যাডমিন" },
      { name: "description", content: "বিনিয়োগ প্যাকেজ তৈরি, সম্পাদনা ও মুছে ফেলার নিয়ন্ত্রণ।" },
      { property: "og:title", content: "প্যাকেজ ম্যানেজমেন্ট | অ্যাডমিন" },
      { property: "og:description", content: "প্যাকেজের দাম, দৈনিক আয় ও মেয়াদ নিয়ন্ত্রণ করুন।" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PackagesAdmin,
});

const empty = { name: "", price: "", daily_ads: "3", daily_income: "", validity_days: "60", sort_order: "0", ad_link: "" };

function PackagesAdmin() {
  const qc = useQueryClient();
  const list = usePackages(true);
  const [form, setForm] = useState({ ...empty });
  const set = (k: keyof typeof empty) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !Number(form.price)) return;
    await supabase.from("packages").insert({
      name: form.name.trim(),
      price: Number(form.price),
      daily_ads: Number(form.daily_ads) || 0,
      daily_income: Number(form.daily_income) || 0,
      validity_days: Number(form.validity_days) || 60,
      sort_order: Number(form.sort_order) || 0,
      ad_link: form.ad_link.trim(),
    });
    setForm({ ...empty });
    void qc.invalidateQueries();
  };

  return (
    <AdminPage title="প্যাকেজ ম্যানেজমেন্ট" subtitle="বিনিয়োগ প্যাকেজ যোগ, সম্পাদনা ও মুছুন" icon={PackageIcon}>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
        <form onSubmit={create} className="surface-card h-fit space-y-3 p-4">
          <h2 className="font-display text-base font-bold">নতুন প্যাকেজ</h2>
          <AdminField label="প্যাকেজের নাম" value={form.name} onChange={set("name")} placeholder="প্যাকেজ ১" />
          <div className="grid grid-cols-2 gap-2">
            <AdminField label="দাম (টাকা)" value={form.price} onChange={set("price")} />
            <AdminField label="দৈনিক বিজ্ঞাপন" value={form.daily_ads} onChange={set("daily_ads")} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <AdminField label="দৈনিক আয় (টাকা)" value={form.daily_income} onChange={set("daily_income")} />
            <AdminField label="মেয়াদ (দিন)" value={form.validity_days} onChange={set("validity_days")} />
          </div>
          <AdminField label="ডিফল্ট বিজ্ঞাপন লিংক" value={form.ad_link} onChange={set("ad_link")} placeholder="https://..." />
          <AdminField label="ক্রম" value={form.sort_order} onChange={set("sort_order")} />
          <button className="bg-brand flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-primary-foreground">
            <Plus className="h-4 w-4" /> প্যাকেজ যোগ করুন
          </button>
        </form>

        <div className="space-y-3">
          {list.map((p) => (
            <PackageRow key={p.id} p={p} />
          ))}
          {list.length === 0 && <Empty text="কোনো প্যাকেজ নেই।" />}
        </div>
      </div>
    </AdminPage>
  );
}

function PackageRow({ p }: { p: Package }) {
  const qc = useQueryClient();
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState({
    name: p.name,
    price: String(p.price),
    daily_ads: String(p.daily_ads),
    daily_income: String(p.daily_income),
    validity_days: String(p.validity_days),
    sort_order: String(p.sort_order),
    ad_link: p.ad_link ?? "",
  });
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  const save = async () => {
    await supabase
      .from("packages")
      .update({
        name: f.name.trim(),
        price: Number(f.price) || 0,
        daily_ads: Number(f.daily_ads) || 0,
        daily_income: Number(f.daily_income) || 0,
        validity_days: Number(f.validity_days) || 60,
        sort_order: Number(f.sort_order) || 0,
        ad_link: f.ad_link.trim(),
      })
      .eq("id", p.id);
    setEdit(false);
    void qc.invalidateQueries();
  };

  return (
    <div className="surface-card space-y-3 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">
            {p.name} · {taka(p.price)}
          </p>
          <p className="text-xs text-muted-foreground">
            দৈনিক {bn(p.daily_ads)} বিজ্ঞাপন · {taka(p.daily_income)} · {bn(p.validity_days)} দিন
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={async () => {
              await supabase.from("packages").update({ is_active: !p.is_active }).eq("id", p.id);
              void qc.invalidateQueries();
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
              p.is_active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
            }`}
          >
            {p.is_active ? "সক্রিয়" : "বন্ধ"}
          </button>
          <button
            onClick={() => setEdit((e) => !e)}
            className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary"
          >
            {edit ? "বাতিল" : "এডিট"}
          </button>
          <button
            aria-label="মুছুন"
            onClick={async () => {
              await supabase.from("packages").delete().eq("id", p.id);
              void qc.invalidateQueries();
            }}
            className="rounded-lg bg-destructive/15 p-2 text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {edit && (
        <div className="space-y-3 border-t border-border pt-3">
          <AdminField label="নাম" value={f.name} onChange={set("name")} />
          <div className="grid grid-cols-2 gap-2">
            <AdminField label="দাম" value={f.price} onChange={set("price")} />
            <AdminField label="দৈনিক বিজ্ঞাপন" value={f.daily_ads} onChange={set("daily_ads")} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <AdminField label="দৈনিক আয়" value={f.daily_income} onChange={set("daily_income")} />
            <AdminField label="মেয়াদ (দিন)" value={f.validity_days} onChange={set("validity_days")} />
          </div>
          <AdminField label="ডিফল্ট বিজ্ঞাপন লিংক" value={f.ad_link} onChange={set("ad_link")} placeholder="https://..." />
          <AdminField label="ক্রম" value={f.sort_order} onChange={set("sort_order")} />
          <button
            onClick={save}
            className="bg-brand flex w-full items-center justify-center gap-2 rounded-2xl py-2.5 text-sm font-bold text-primary-foreground"
          >
            <Save className="h-4 w-4" /> সেভ করুন
          </button>
        </div>
      )}
    </div>
  );
}
