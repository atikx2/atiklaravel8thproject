
DROP POLICY "own profile update" ON public.profiles;
CREATE POLICY "admin profile update" ON public.profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
REVOKE UPDATE ON public.profiles FROM authenticated;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.on_deposit_status() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.on_withdrawal_insert() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.on_withdrawal_status() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.on_submission_status() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
