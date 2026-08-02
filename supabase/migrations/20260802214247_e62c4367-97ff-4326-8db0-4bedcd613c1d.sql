CREATE TABLE public.app_settings (
  id text PRIMARY KEY,
  bkash_number text NOT NULL DEFAULT '01700000000',
  nagad_number text NOT NULL DEFAULT '01800000000',
  min_withdraw numeric NOT NULL DEFAULT 500,
  min_deposit numeric NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.app_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings public read" ON public.app_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "settings admin insert" ON public.app_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "settings admin update" ON public.app_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER app_settings_updated_at BEFORE UPDATE ON public.app_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.app_settings (id) VALUES ('main');

GRANT INSERT, DELETE ON public.user_roles TO authenticated;
CREATE POLICY "roles admin insert" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "roles admin delete" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin') AND user_id <> auth.uid());