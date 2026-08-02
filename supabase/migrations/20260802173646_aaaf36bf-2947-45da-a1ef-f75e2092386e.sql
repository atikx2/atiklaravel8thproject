
CREATE TYPE public.app_role AS ENUM ('admin','user');
CREATE TYPE public.job_type AS ENUM ('ad','video','microtask');
CREATE TYPE public.req_status AS ENUM ('pending','approved','rejected');
CREATE TYPE public.pay_method AS ENUM ('bkash','nagad');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL UNIQUE,
  phone text NOT NULL,
  balance numeric NOT NULL DEFAULT 0,
  total_earned numeric NOT NULL DEFAULT 0,
  has_deposited boolean NOT NULL DEFAULT false,
  is_blocked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  job_type public.job_type NOT NULL DEFAULT 'microtask',
  reward numeric NOT NULL DEFAULT 0,
  link text,
  duration_seconds integer NOT NULL DEFAULT 15,
  proof_required boolean NOT NULL DEFAULT false,
  slots integer NOT NULL DEFAULT 1000,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.jobs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.job_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  proof text,
  reward numeric NOT NULL DEFAULT 0,
  status public.req_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_submissions TO authenticated;
GRANT ALL ON public.job_submissions TO service_role;
ALTER TABLE public.job_submissions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.deposits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  method public.pay_method NOT NULL,
  amount numeric NOT NULL,
  sender_number text NOT NULL,
  trx_id text NOT NULL,
  status public.req_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.deposits TO authenticated;
GRANT ALL ON public.deposits TO service_role;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  method public.pay_method NOT NULL,
  amount numeric NOT NULL,
  account_number text NOT NULL,
  status public.req_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.withdrawals TO authenticated;
GRANT ALL ON public.withdrawals TO service_role;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL,
  amount numeric NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- policies
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id OR public.has_role(auth.uid(),'admin')) WITH CHECK (true);
CREATE POLICY "roles read own" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "jobs public read" ON public.jobs FOR SELECT TO anon, authenticated USING (is_active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "jobs admin write" ON public.jobs FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "subs read" ON public.job_submissions FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "subs insert" ON public.job_submissions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "subs admin update" ON public.job_submissions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "dep read" ON public.deposits FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "dep insert" ON public.deposits FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "dep admin update" ON public.deposits FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "wd read" ON public.withdrawals FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "wd insert" ON public.withdrawals FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "wd admin update" ON public.withdrawals FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "tx read" ON public.transactions FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- new user: profile + 200 bonus
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, username, phone, balance)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email,'@',1)),
    COALESCE(NEW.raw_user_meta_data->>'phone',''),
    200
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  INSERT INTO public.transactions (user_id, kind, amount, note)
  VALUES (NEW.id, 'bonus', 200, 'নতুন রেজিস্ট্রেশন বোনাস');
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- deposit approval -> balance
CREATE OR REPLACE FUNCTION public.on_deposit_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status <> 'approved' THEN
    UPDATE public.profiles SET balance = balance + NEW.amount, has_deposited = true WHERE id = NEW.user_id;
    INSERT INTO public.transactions (user_id, kind, amount, note) VALUES (NEW.user_id,'deposit',NEW.amount,'ডিপোজিট অনুমোদিত');
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_deposit_status AFTER UPDATE ON public.deposits FOR EACH ROW EXECUTE FUNCTION public.on_deposit_status();

-- withdrawal: deduct on request, refund on reject
CREATE OR REPLACE FUNCTION public.on_withdrawal_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE bal numeric;
BEGIN
  SELECT balance INTO bal FROM public.profiles WHERE id = NEW.user_id;
  IF bal < NEW.amount THEN RAISE EXCEPTION 'পর্যাপ্ত ব্যালেন্স নেই'; END IF;
  UPDATE public.profiles SET balance = balance - NEW.amount WHERE id = NEW.user_id;
  INSERT INTO public.transactions (user_id, kind, amount, note) VALUES (NEW.user_id,'withdraw',-NEW.amount,'উইথড্র অনুরোধ');
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_withdrawal_insert AFTER INSERT ON public.withdrawals FOR EACH ROW EXECUTE FUNCTION public.on_withdrawal_insert();

CREATE OR REPLACE FUNCTION public.on_withdrawal_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'rejected' AND OLD.status <> 'rejected' THEN
    UPDATE public.profiles SET balance = balance + NEW.amount WHERE id = NEW.user_id;
    INSERT INTO public.transactions (user_id, kind, amount, note) VALUES (NEW.user_id,'refund',NEW.amount,'উইথড্র বাতিল - ফেরত');
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_withdrawal_status AFTER UPDATE ON public.withdrawals FOR EACH ROW EXECUTE FUNCTION public.on_withdrawal_status();

-- submission approval -> earning
CREATE OR REPLACE FUNCTION public.on_submission_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status <> 'approved' THEN
    UPDATE public.profiles SET balance = balance + NEW.reward, total_earned = total_earned + NEW.reward WHERE id = NEW.user_id;
    INSERT INTO public.transactions (user_id, kind, amount, note) VALUES (NEW.user_id,'earning',NEW.reward,'কাজ অনুমোদিত');
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_submission_status AFTER UPDATE ON public.job_submissions FOR EACH ROW EXECUTE FUNCTION public.on_submission_status();
