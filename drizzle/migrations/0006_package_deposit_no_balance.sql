CREATE OR REPLACE FUNCTION public.on_deposit_status()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status = 'approved' AND OLD.status <> 'approved' THEN
    IF NEW.package_id IS NOT NULL THEN
      UPDATE public.profiles SET has_deposited = true WHERE id = NEW.user_id;
      INSERT INTO public.transactions (user_id, kind, amount, note) VALUES (NEW.user_id,'deposit',0,'প্যাকেজ ক্রয় অনুমোদিত');
    ELSE
      UPDATE public.profiles SET balance = balance + NEW.amount, has_deposited = true WHERE id = NEW.user_id;
      INSERT INTO public.transactions (user_id, kind, amount, note) VALUES (NEW.user_id,'deposit',NEW.amount,'ডিপোজিট অনুমোদিত');
    END IF;
  END IF;
  RETURN NEW;
END; $function$;