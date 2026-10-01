CREATE OR REPLACE FUNCTION public.check_deposit_package()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NEW.package_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM public.package_purchases WHERE user_id = NEW.user_id AND package_id = NEW.package_id AND expires_at > now()) THEN
      RAISE EXCEPTION 'এই প্যাকেজটি আপনার একাউন্টে সক্রিয় আছে। মেয়াদ শেষ হলে আবার কিনতে পারবেন';
    END IF;
    IF EXISTS (SELECT 1 FROM public.deposits WHERE user_id = NEW.user_id AND package_id = NEW.package_id AND status = 'pending') THEN
      RAISE EXCEPTION 'এই প্যাকেজের একটি অনুরোধ অনুমোদনের অপেক্ষায় আছে';
    END IF;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS deposits_check_package ON public.deposits;
CREATE TRIGGER deposits_check_package BEFORE INSERT ON public.deposits
FOR EACH ROW EXECUTE FUNCTION public.check_deposit_package();

CREATE OR REPLACE FUNCTION public.on_deposit_package_approved()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE p public.packages%ROWTYPE;
BEGIN
  IF NEW.status = 'approved' AND OLD.status <> 'approved' AND NEW.package_id IS NOT NULL THEN
    SELECT * INTO p FROM public.packages WHERE id = NEW.package_id;
    IF FOUND AND NOT EXISTS (
      SELECT 1 FROM public.package_purchases WHERE user_id = NEW.user_id AND package_id = NEW.package_id AND expires_at > now()
    ) THEN
      INSERT INTO public.package_purchases (user_id, package_id, price, daily_income, daily_ads, expires_at)
      VALUES (NEW.user_id, p.id, p.price, p.daily_income, p.daily_ads, now() + (p.validity_days || ' days')::interval);
    END IF;
  END IF;
  RETURN NEW;
END; $$;

GRANT SELECT ON public.packages TO anon, authenticated;
GRANT SELECT ON public.package_purchases TO authenticated;
GRANT SELECT ON public.package_ad_views TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_package_ad(uuid, integer) TO authenticated;