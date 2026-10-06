# মাইগ্রেশন 0007 কীভাবে চালাবেন (Supabase অ্যাকসেস ছাড়াই)

এই ফাইলটা শুধু নির্দেশনা — আসল SQL আছে `0007_signup_bonus_and_global_ad_link.sql`-এ।

## কী কী এখনই কাজ করছে (SQL ছাড়াই)

- সাইটের সব জায়গায় ব্র্যান্ড **Smart Job BD 26**
- সব লেখায় **১০০ টাকা** সাইনআপ বোনাস
- অ্যাডমিন → **সেটিংস ও পেমেন্ট** → **গ্লোবাল বিজ্ঞাপন লিংক** সেভ করা
- **"সব প্ল্যান ও টাস্কে এই লিংক বসান"** বাটন (সরাসরি সব সারি আপডেট করে)
- নতুন প্ল্যান/টাস্কে লিংক খালি থাকলে গ্লোবাল লিংক অটো ফলব্যাক

> কলাম না থাকলে মানগুলো `app_settings`-এর `extra` সারিতে JSON হিসেবে জমা থাকে, তাই
> অ্যাডমিন প্যানেল মাইগ্রেশন ছাড়াও পুরোপুরি কাজ করে।

## কী কাজ করবে না SQL না চালালে

- **নতুন রেজিস্ট্রেশনে আসল টাকা** — ডাটাবেস ট্রিগার এখনো ২০০ টাকা জমা করে (সাইটে লেখা ১০০)।
  এটা বদলাতে নিচের SQL একবার চালাতেই হবে।

## উপায় ০ — Lovable-এর নিজের SQL Editor (সবচেয়ে ভালো, বারবার ব্যবহারযোগ্য)

supabase.com-এ ঢোকার দরকার **নেই**। Lovable Cloud প্রজেক্টে Lovable-এর ভেতরেই একটা SQL
এডিটর আছে:

1. Lovable প্রজেক্ট খুলুন
2. উপরের টুলবারে **More** (⋯) → **Cloud**
3. বাঁ পাশের তালিকা থেকে **SQL editor**
4. `0007_signup_bonus_and_global_ad_link.sql`-এর পুরো লেখা পেস্ট করে **Run**

ভবিষ্যতে যত মাইগ্রেশন লাগবে, সবই এখান থেকে নিজে চালাতে পারবেন — চ্যাটের ক্রেডিট খরচ হবে না।
একই Cloud সেকশনে Database (টেবিল ও ডেটা), Users, Logs, Secrets-ও আছে।

> **SQL editor না দেখলে** (মোবাইলে বা কিছু প্ল্যানে দেখা যায় না) — নিচের **উপায় ১** ব্যবহার করুন,
> ওটাই সবচেয়ে নিশ্চিত পথ। সবচেয়ে ছোট প্রম্পট: *"`handle_new_user()` ফাংশনে নতুন ইউজারের
> বোনাস ২০০ এর বদলে ১০০ করে দাও — `profiles.balance` আর `transactions` দুই জায়গাতেই।
> কোডে/UI-তে কোনো পরিবর্তন করো না।"*

> কোন ব্যাকএন্ড ব্যবহার করছেন বুঝবেন কীভাবে: **More → Cloud**-এ যদি Lovable-এর নিজের
> Database/Users/SQL editor স্ক্রিন দেখেন → **Lovable Cloud** (প্রজেক্টটা Lovable-এর মালিকানায়,
> supabase.com-এ দেখা যাবে না)। আর যদি Supabase লোগো, প্রজেক্টের নাম ও "open dashboard"
> লিংক দেখেন → প্রজেক্টটা **আপনার নিজের Supabase অ্যাকাউন্টে**, তখন supabase.com-এ লগইন
> করলেই SQL Editor পাবেন।

## উপায় ১ — Lovable চ্যাটে ছোট্ট একটা মেসেজ (ফোনের জন্য সহজ)

Supabase ড্যাশবোর্ডে ঢোকার দরকার নেই। Lovable নিজেই এই ডাটাবেসের মালিক, তাই চ্যাটে
নিচের লেখাটুকু পাঠালেই ও নিজে SQL লিখে মাইগ্রেশন চালিয়ে দেবে:

> আমার ডাটাবেসে তিনটা কাজ করে দাও (শুধু ব্যাকএন্ড, UI-তে হাত দিও না):
> ১) `app_settings` টেবিলে দুটো কলাম যোগ করো — `signup_bonus numeric NOT NULL DEFAULT 100`
> আর `global_ad_link text NOT NULL DEFAULT ''`; তারপর `id='main'` সারিতে `signup_bonus = 100` সেট করো।
> ২) `handle_new_user()` ট্রিগার ফাংশনে নতুন ইউজারের বোনাস ২০০ হার্ডকোড করা আছে —
> সেটা `app_settings.signup_bonus` থেকে পড়ার মতো করে দাও (না পেলে ১০০)।
> ৩) `admin_apply_ad_link(_link text) RETURNS integer` নামে একটা SECURITY DEFINER ফাংশন বানাও,
> যেটা শুরুতে `has_role(auth.uid(),'admin')` চেক করবে, তারপর `app_settings.global_ad_link`,
> সব `packages.ad_link` আর সব `jobs.link` ওই লিংকে আপডেট করে কয়টা সারি বদলালো তা রিটার্ন করবে;
> শেষে `GRANT EXECUTE` দাও `authenticated` রোলকে।

Lovable কাজটা করার পর অ্যাডমিন প্যানেলের হলুদ "ডাটাবেস আপডেট বাকি" নোটিশটা চলে যাবে।

## উপায় ২ — Lovable চ্যাটে পুরো SQL দিয়ে

Lovable প্রজেক্টের চ্যাট বক্সে নিচের পুরো মেসেজটা কপি-পেস্ট করে পাঠান:

---

আমার ডাটাবেসে নিচের SQL মাইগ্রেশনটা চালিয়ে দাও (Supabase migration হিসেবে অ্যাপ্লাই করো,
কোনো UI পরিবর্তন লাগবে না):

```sql
-- সাইনআপ বোনাস (ডিফল্ট ১০০ টাকা) ও গ্লোবাল বিজ্ঞাপন লিংক — দুটোই অ্যাডমিন প্যানেল থেকে বদলানো যাবে।

ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS signup_bonus numeric NOT NULL DEFAULT 100;
--> statement-breakpoint
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS global_ad_link text NOT NULL DEFAULT '';
--> statement-breakpoint

-- চালু সাইটে আগের ২০০ টাকা বোনাস এখন ১০০ টাকা
UPDATE public.app_settings SET signup_bonus = 100 WHERE id = 'main';
--> statement-breakpoint

-- নতুন ইউজার: প্রোফাইল + সেটিংস অনুযায়ী বোনাস (আগে হার্ডকোড ২০০ ছিল)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE b numeric;
BEGIN
  SELECT COALESCE(signup_bonus, 100) INTO b FROM public.app_settings WHERE id = 'main';
  IF b IS NULL THEN b := 100; END IF;

  INSERT INTO public.profiles (id, username, phone, balance)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email,'@',1)),
    COALESCE(NEW.raw_user_meta_data->>'phone',''),
    b
  );

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;

  IF b > 0 THEN
    INSERT INTO public.transactions (user_id, kind, amount, note)
    VALUES (NEW.id, 'bonus', b, 'নতুন রেজিস্ট্রেশন বোনাস');
  END IF;

  RETURN NEW;
END; $function$;
--> statement-breakpoint
-- ট্রিগার ফাংশন ক্লায়েন্ট থেকে কল করা যাবে না (আগের হার্ডেনিং বজায় রাখা হলো)
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
--> statement-breakpoint

-- এক ক্লিকে সব প্ল্যান ও টাস্কে একই বিজ্ঞাপন লিংক বসানোর জন্য (অ্যাডমিন-only)
CREATE OR REPLACE FUNCTION public.admin_apply_ad_link(_link text)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE n_pkg integer; n_job integer;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'শুধু অ্যাডমিন এই কাজ করতে পারবে';
  END IF;

  UPDATE public.app_settings SET global_ad_link = COALESCE(_link, '') WHERE id = 'main';

  UPDATE public.packages SET ad_link = COALESCE(_link, '');
  GET DIAGNOSTICS n_pkg = ROW_COUNT;

  UPDATE public.jobs SET link = COALESCE(_link, '');
  GET DIAGNOSTICS n_job = ROW_COUNT;

  RETURN n_pkg + n_job;
END; $function$;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.admin_apply_ad_link(text) TO authenticated;
```

---

Lovable মাইগ্রেশনটা রিভিউ করতে বলবে — **Apply / Approve** চাপলেই কাজ শেষ।

## উপায় ৩ — supabase.com-এর SQL Editor (শুধু নিজের Supabase প্রজেক্ট হলে)

Supabase Dashboard → আপনার প্রজেক্ট → **SQL Editor** → **New query** →
`0007_signup_bonus_and_global_ad_link.sql`-এর পুরো লেখা পেস্ট → **Run**।

## ভবিষ্যতে নিজের হাতে পূর্ণ অ্যাকসেস চাইলে

Lovable Cloud-এর ডাটাবেস Lovable-এর মালিকানাধীন — চ্যাটে বললেও supabase.com-এর
ড্যাশবোর্ড/সার্ভিস কি/কানেকশন স্ট্রিং পাওয়া যায় না। পূর্ণ মালিকানা চাইলে একমাত্র পথ হলো
নিজের Supabase প্রজেক্টে সরে যাওয়া: **Cloud → Overview → Advanced settings →
Export project data → Remove Lovable Cloud**, তারপর নিজের Supabase প্রজেক্ট কানেক্ট করা।

> ⚠️ সাবধান: Cloud সরালে পুরোনো ডাটাবেস স্থায়ীভাবে মুছে যায়। আগে ইউজার, ডিপোজিট,
> উইথড্র, ব্যালেন্স — সব এক্সপোর্ট করে নতুন প্রজেক্টে তুলতে হবে, আর ইউজারদের পাসওয়ার্ড
> সব ক্ষেত্রে মাইগ্রেট হয় না। লাইভ সাইটে আসল ইউজার থাকলে এটা পরে, ঠান্ডা মাথায় করবেন।

## চালানোর পর কী হবে

1. `app_settings`-এ `signup_bonus` (১০০) ও `global_ad_link` কলাম যোগ হবে।
2. `handle_new_user()` ট্রিগার বোনাসের পরিমাণ সেটিংস থেকে পড়বে — অ্যাডমিন প্যানেলে
   সংখ্যা বদলালেই নতুন ইউজারের বোনাস বদলাবে।
3. `admin_apply_ad_link()` ফাংশন তৈরি হবে — "সব প্ল্যান ও টাস্কে বসান" বাটন তখন
   এক ধাপেই পুরো কাজ করবে।
4. অ্যাডমিন প্যানেলের হলুদ "ডাটাবেস আপডেট বাকি" বার্তাটা নিজে থেকেই চলে যাবে।
