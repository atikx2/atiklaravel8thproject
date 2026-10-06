ALTER TABLE public.app_settings
  ADD COLUMN signup_bonus numeric NOT NULL DEFAULT 100,
  ADD COLUMN global_ad_link text NOT NULL DEFAULT '';

UPDATE public.app_settings SET signup_bonus = 100 WHERE id = 'main';

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE bonus numeric;
BEGIN
  SELECT signup_bonus INTO bonus FROM public.app_settings WHERE id = 'main';
  bonus := COALESCE(bonus, 100);
  INSERT INTO public.profiles (id, username, phone, balance)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email,'@',1)),
    COALESCE(NEW.raw_user_meta_data->>'phone',''),
    bonus
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  INSERT INTO public.transactions (user_id, kind, amount, note)
  VALUES (NEW.id, 'bonus', bonus, 'নতুন রেজিস্ট্রেশন বোনাস');
  RETURN NEW;
END; $function$;

CREATE OR REPLACE FUNCTION public.admin_apply_ad_link(_link text)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE n integer := 0; c integer;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  UPDATE public.app_settings SET global_ad_link = _link WHERE id = 'main';
  GET DIAGNOSTICS c = ROW_COUNT; n := n + c;
  UPDATE public.packages SET ad_link = _link;
  GET DIAGNOSTICS c = ROW_COUNT; n := n + c;
  UPDATE public.jobs SET link = _link;
  GET DIAGNOSTICS c = ROW_COUNT; n := n + c;
  RETURN n;
END; $function$;

GRANT EXECUTE ON FUNCTION public.admin_apply_ad_link(text) TO authenticated;