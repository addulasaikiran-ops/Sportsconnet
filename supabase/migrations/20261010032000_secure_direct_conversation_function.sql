begin;

create or replace function private.create_direct_conversation_impl(recipient_profile_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  current_user_id uuid := auth.uid();
  existing_conversation_id uuid;
  new_conversation_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if recipient_profile_id is null or recipient_profile_id = current_user_id then
    raise exception 'Choose another profile to start a conversation' using errcode = '22023';
  end if;

  if not exists (
    select 1 from public.profiles p where p.id = recipient_profile_id
  ) then
    raise exception 'Recipient profile was not found' using errcode = 'P0002';
  end if;

  select c.id into existing_conversation_id
  from public.conversations c
  join public.conversation_members m1
    on m1.conversation_id = c.id and m1.user_id = current_user_id
  join public.conversation_members m2
    on m2.conversation_id = c.id and m2.user_id = recipient_profile_id
  where (
    select count(*)
    from public.conversation_members m3
    where m3.conversation_id = c.id
  ) = 2
  limit 1;

  if existing_conversation_id is not null then
    return existing_conversation_id;
  end if;

  insert into public.conversations (created_by)
  values (current_user_id)
  returning id into new_conversation_id;

  insert into public.conversation_members (conversation_id, user_id)
  values (new_conversation_id, current_user_id),
         (new_conversation_id, recipient_profile_id);

  return new_conversation_id;
end;
$function$;

revoke all on function private.create_direct_conversation_impl(uuid) from public;
revoke all on function private.create_direct_conversation_impl(uuid) from anon;
grant usage on schema private to authenticated, service_role;
grant execute on function private.create_direct_conversation_impl(uuid) to authenticated, service_role;

create or replace function public.create_direct_conversation(recipient_profile_id uuid)
returns uuid
language sql
security invoker
set search_path = ''
as $function$
  select private.create_direct_conversation_impl(recipient_profile_id);
$function$;

revoke all on function public.create_direct_conversation(uuid) from public;
revoke all on function public.create_direct_conversation(uuid) from anon;
grant execute on function public.create_direct_conversation(uuid) to authenticated, service_role;

commit;
