CREATE TABLE public.packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric NOT NULL,
  daily_ads integer NOT NULL DEFAULT 3,
  daily_income numeric NOT NULL DEFAULT 0,
  validity_days integer NOT NULL DEFAULT 60,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.packages TO anon;
GRANT SELECT ON public.packages TO authenticated;
GRANT ALL ON public.packages TO service_role;

ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "packages public read" ON public.packages FOR SELECT TO anon, authenticated
  USING (is_active OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "packages admin write" ON public.packages FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER packages_updated_at BEFORE UPDATE ON public.packages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.package_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id uuid NOT NULL REFERENCES public.packages(id),
  price numeric NOT NULL,
  daily_income numeric NOT NULL DEFAULT 0,
  daily_ads integer NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.package_purchases TO authenticated;
GRANT ALL ON public.package_purchases TO service_role;

ALTER TABLE public.package_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "purchases read" ON public.package_purchases FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

ALTER TABLE public.deposits ADD COLUMN package_id uuid REFERENCES public.packages(id);

CREATE OR REPLACE FUNCTION public.on_deposit_package_approved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE p public.packages%ROWTYPE;
BEGIN
  IF NEW.status = 'approved' AND OLD.status <> 'approved' AND NEW.package_id IS NOT NULL THEN
    SELECT * INTO p FROM public.packages WHERE id = NEW.package_id;
    IF FOUND THEN
      INSERT INTO public.package_purchases (user_id, package_id, price, daily_income, daily_ads, expires_at)
      VALUES (NEW.user_id, p.id, p.price, p.daily_income, p.daily_ads, now() + (p.validity_days || ' days')::interval);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER deposits_package_approved AFTER UPDATE ON public.deposits
  FOR EACH ROW EXECUTE FUNCTION public.on_deposit_package_approved();

INSERT INTO public.packages (name, price, daily_ads, daily_income, validity_days, sort_order) VALUES
  ('প্যাকেজ ১', 500, 3, 300, 60, 1),
  ('প্যাকেজ ২', 1000, 6, 600, 60, 2),
  ('প্যাকেজ ৩', 1500, 9, 900, 60, 3);
