-- STEP 4 — Run only AFTER the Razorpay branch is merged to main and live.
-- The old live screen still offers the in-app request form, so this waits until
-- the new screen (Buy + gift code) is in production. Existing request rows stay.
-- Customers no longer send WhatsApp/in-app access requests; existing request
-- rows stay readable by the owner. Guarded so a signature drift cannot abort.
do $$
begin
  if to_regprocedure('public.request_page_access(jsonb)') is not null then
    revoke execute on function public.request_page_access(jsonb) from authenticated;
  end if;
end $$;
