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

## উপায় ১ — Lovable চ্যাটে (সবচেয়ে সহজ)

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

## উপায় ২ — Supabase SQL Editor (যদি অ্যাকসেস থাকে)

Supabase Dashboard → আপনার প্রজেক্ট → **SQL Editor** → **New query** →
`0007_signup_bonus_and_global_ad_link.sql`-এর পুরো লেখা পেস্ট → **Run**।

## চালানোর পর কী হবে

1. `app_settings`-এ `signup_bonus` (১০০) ও `global_ad_link` কলাম যোগ হবে।
2. `handle_new_user()` ট্রিগার বোনাসের পরিমাণ সেটিংস থেকে পড়বে — অ্যাডমিন প্যানেলে
   সংখ্যা বদলালেই নতুন ইউজারের বোনাস বদলাবে।
3. `admin_apply_ad_link()` ফাংশন তৈরি হবে — "সব প্ল্যান ও টাস্কে বসান" বাটন তখন
   এক ধাপেই পুরো কাজ করবে।
4. অ্যাডমিন প্যানেলের হলুদ "ডাটাবেস আপডেট বাকি" বার্তাটা নিজে থেকেই চলে যাবে।
