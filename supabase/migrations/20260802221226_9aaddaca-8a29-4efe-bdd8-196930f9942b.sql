CREATE TABLE public.payment_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  method pay_method NOT NULL,
  number text NOT NULL,
  label text NOT NULL DEFAULT 'পার্সোনাল',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.payment_numbers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_numbers TO authenticated;
GRANT ALL ON public.payment_numbers TO service_role;

ALTER TABLE public.payment_numbers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payment numbers public read" ON public.payment_numbers
  FOR SELECT TO anon, authenticated
  USING (is_active OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "payment numbers admin write" ON public.payment_numbers
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_payment_numbers_updated_at
  BEFORE UPDATE ON public.payment_numbers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.payment_numbers (method, number, label)
SELECT 'bkash'::pay_method, bkash_number, 'পার্সোনাল' FROM public.app_settings WHERE id = 'main'
UNION ALL
SELECT 'nagad'::pay_method, nagad_number, 'পার্সোনাল' FROM public.app_settings WHERE id = 'main';