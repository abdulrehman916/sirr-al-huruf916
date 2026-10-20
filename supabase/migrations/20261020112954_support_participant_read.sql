create policy support_participant_read on public.platform_records for select to authenticated
using (entity in ('SupportTickets','SupportMessage') and private.can_read_support(entity,data,owner_id));
