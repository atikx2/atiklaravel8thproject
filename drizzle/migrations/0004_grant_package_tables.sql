GRANT SELECT ON public.packages TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.packages TO authenticated;
GRANT SELECT ON public.package_purchases TO authenticated;
GRANT SELECT ON public.package_ad_views TO authenticated;
GRANT ALL ON public.packages, public.package_purchases, public.package_ad_views TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_package_ad(uuid, integer) TO authenticated;