ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS ad_link text NOT NULL DEFAULT '';

CREATE TABLE public.package_ad_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  purchase_id uuid NOT NULL REFERENCES public.package_purchases(id) ON DELETE CASCADE,
  ad_index integer NOT NULL,
  view_date date NOT NULL DEFAULT ((now() AT TIME ZONE 'Asia/Dhaka')::date),
  reward numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (purchase_id, ad_index, view_date)
);
GRANT SELECT ON public.package_ad_views TO authenticated;
GRANT ALL ON public.package_ad_views TO service_role;
ALTER TABLE public.package_ad_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ad views read" ON public.package_ad_views FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.complete_package_ad(_purchase_id uuid, _ad_index integer)
RETURNS numeric LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE pp public.package_purchases%ROWTYPE; r numeric; d date := (now() AT TIME ZONE 'Asia/Dhaka')::date;
BEGIN
  SELECT * INTO pp FROM public.package_purchases WHERE id = _purchase_id AND user_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'প্যাকেজ পাওয়া যায়নি'; END IF;
  IF pp.expires_at < now() THEN RAISE EXCEPTION 'প্যাকেজের মেয়াদ শেষ'; END IF;
  IF _ad_index < 1 OR _ad_index > pp.daily_ads THEN RAISE EXCEPTION 'অবৈধ বিজ্ঞাপন'; END IF;
  IF EXISTS (SELECT 1 FROM public.package_ad_views WHERE purchase_id = _purchase_id AND ad_index = _ad_index AND view_date = d) THEN
    RAISE EXCEPTION 'আজ এই বিজ্ঞাপন দেখা হয়েছে';
  END IF;
  r := CASE WHEN pp.daily_ads > 0 THEN round(pp.daily_income / pp.daily_ads, 2) ELSE 0 END;
  INSERT INTO public.package_ad_views (user_id, purchase_id, ad_index, view_date, reward) VALUES (auth.uid(), _purchase_id, _ad_index, d, r);
  UPDATE public.profiles SET balance = balance + r, total_earned = total_earned + r WHERE id = auth.uid();
  INSERT INTO public.transactions (user_id, kind, amount, note) VALUES (auth.uid(), 'earning', r, 'প্যাকেজ বিজ্ঞাপন দেখা');
  RETURN r;
END; $$;
GRANT EXECUTE ON FUNCTION public.complete_package_ad(uuid, integer) TO authenticated;