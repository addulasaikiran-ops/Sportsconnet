-- Harden function execution and finish supporting indexes for SportsConnect.
-- Keep the membership helper outside the exposed public API schema.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create or replace function private.is_conversation_member(target_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.conversation_members cm
    where cm.conversation_id = target_conversation_id
      and cm.user_id = auth.uid()
  );
$$;

revoke all on function private.is_conversation_member(uuid) from public, anon;
grant execute on function private.is_conversation_member(uuid) to authenticated;

drop policy if exists "Members read their conversations" on public.conversations;
create policy "Members read their conversations" on public.conversations
for select to authenticated using (private.is_conversation_member(id));

drop policy if exists "Members read conversation participants" on public.conversation_members;
create policy "Members read conversation participants" on public.conversation_members
for select to authenticated using (private.is_conversation_member(conversation_id));

drop policy if exists "Members read messages" on public.messages;
create policy "Members read messages" on public.messages
for select to authenticated using (private.is_conversation_member(conversation_id));

drop policy if exists "Send messages as yourself" on public.messages;
create policy "Send messages as yourself" on public.messages
for insert to authenticated
with check (sender_id = (select auth.uid()) and private.is_conversation_member(conversation_id));

drop function if exists public.is_conversation_member(uuid);

-- Only the authenticated RPC used by the application may invoke this function.
revoke all on function public.create_direct_conversation(uuid) from public, anon;
grant execute on function public.create_direct_conversation(uuid) to authenticated;

-- Trigger functions are for database triggers, not public RPC endpoints.
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.notify_on_message() from public, anon, authenticated;
revoke all on function public.notify_on_follow() from public, anon, authenticated;
revoke all on function public.notify_on_reaction() from public, anon, authenticated;
revoke all on function public.notify_on_comment() from public, anon, authenticated;
revoke all on function public.notify_on_application() from public, anon, authenticated;

-- Supporting indexes for foreign-key lookups and cascade operations.
create index if not exists comments_author_id_idx on public.comments(author_id);
create index if not exists conversations_created_by_idx on public.conversations(created_by);
create index if not exists messages_sender_id_idx on public.messages(sender_id);
create index if not exists notifications_actor_id_idx on public.notifications(actor_id);
create index if not exists opportunities_created_by_idx on public.opportunities(created_by);
create index if not exists post_reactions_user_id_idx on public.post_reactions(user_id);

-- Avoid duplicate SELECT policy evaluation for post media.
drop policy if exists "Manage media on own posts" on public.post_media;
create policy "Create media on own posts" on public.post_media
for insert to authenticated
with check (exists (
  select 1 from public.posts p
  where p.id = post_id and p.author_id = (select auth.uid())
));
create policy "Update media on own posts" on public.post_media
for update to authenticated
using (exists (
  select 1 from public.posts p
  where p.id = post_id and p.author_id = (select auth.uid())
))
with check (exists (
  select 1 from public.posts p
  where p.id = post_id and p.author_id = (select auth.uid())
));
create policy "Delete media on own posts" on public.post_media
for delete to authenticated
using (exists (
  select 1 from public.posts p
  where p.id = post_id and p.author_id = (select auth.uid())
));
