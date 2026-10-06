-- Trigger execution does not need public API access.
revoke all on function public.create_profile_for_new_user() from public, anon, authenticated;
-- Legacy access checks are meaningful only with an authenticated user.
revoke all on function public.can_access_legacy_page(text) from anon;