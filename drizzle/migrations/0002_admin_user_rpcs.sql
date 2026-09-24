CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.admin_delete_user(_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  IF _user_id = auth.uid() THEN RAISE EXCEPTION 'নিজের একাউন্ট মুছা যাবে না'; END IF;
  DELETE FROM auth.users WHERE id = _user_id;
END; $$;

CREATE OR REPLACE FUNCTION public.admin_reset_password(_user_id uuid, _password text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, extensions AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  IF length(_password) < 6 THEN RAISE EXCEPTION 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে'; END IF;
  UPDATE auth.users SET encrypted_password = extensions.crypt(_password, extensions.gen_salt('bf')), updated_at = now() WHERE id = _user_id;
END; $$;

REVOKE ALL ON FUNCTION public.admin_delete_user(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_reset_password(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_reset_password(uuid, text) TO authenticated;