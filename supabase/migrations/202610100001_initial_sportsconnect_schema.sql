-- SportsConnect initial schema. Apply this migration to the intended Supabase project only.
create extension if not exists pgcrypto;

do $$ begin
  create type public.profile_role as enum ('athlete', 'coach', 'club', 'association');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.post_visibility as enum ('public', 'network');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.media_kind as enum ('image', 'video');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.reaction_kind as enum ('like', 'appreciate', 'celebrate');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.opportunity_kind as enum ('trial', 'scholarship', 'scouting', 'camp', 'training_program', 'competition', 'other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.application_status as enum ('applied', 'reviewing', 'shortlisted', 'accepted', 'rejected', 'withdrawn');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,50}$'),
  full_name text not null default 'New Athlete' check (char_length(full_name) between 1 and 100),
  role public.profile_role not null default 'athlete',
  bio text not null default '' check (char_length(bio) <= 1000),
  location text not null default '' check (char_length(location) <= 120),
  primary_sport text not null default '' check (char_length(primary_sport) <= 80),
  avatar_url text,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 3000),
  visibility public.post_visibility not null default 'public',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  url text not null,
  storage_path text,
  media_type public.media_kind not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint follows_no_self_follow check (follower_id <> following_id)
);

create table if not exists public.post_reactions (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reaction_type public.reaction_kind not null default 'like',
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 1500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 5 and 160),
  organization text not null check (char_length(organization) between 2 and 160),
  description text not null check (char_length(description) between 10 and 5000),
  sport text not null check (char_length(sport) between 2 and 80),
  type public.opportunity_kind not null default 'other',
  location text not null default '' check (char_length(location) <= 180),
  deadline date,
  status text not null default 'published' check (status in ('draft', 'published', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.opportunity_applications (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  applicant_id uuid not null references public.profiles(id) on delete cascade,
  cover_note text not null default '' check (char_length(cover_note) <= 2000),
  status public.application_status not null default 'applied',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (opportunity_id, applicant_id)
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 4000),
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  type text not null check (char_length(type) between 1 and 60),
  entity_id uuid,
  body text not null default '' check (char_length(body) <= 500),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists posts_author_created_idx on public.posts(author_id, created_at desc);
create index if not exists posts_created_idx on public.posts(created_at desc);
create index if not exists post_media_post_sort_idx on public.post_media(post_id, sort_order);
create index if not exists follows_following_idx on public.follows(following_id);
create index if not exists comments_post_created_idx on public.comments(post_id, created_at asc);
create index if not exists opportunities_status_deadline_idx on public.opportunities(status, deadline);
create index if not exists applications_applicant_idx on public.opportunity_applications(applicant_id, created_at desc);
create index if not exists conversation_members_user_idx on public.conversation_members(user_id);
create index if not exists messages_conversation_created_idx on public.messages(conversation_id, created_at asc);
create index if not exists notifications_recipient_created_idx on public.notifications(recipient_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at before update on public.posts
for each row execute function public.set_updated_at();

drop trigger if exists comments_set_updated_at on public.comments;
create trigger comments_set_updated_at before update on public.comments
for each row execute function public.set_updated_at();

drop trigger if exists opportunities_set_updated_at on public.opportunities;
create trigger opportunities_set_updated_at before update on public.opportunities
for each row execute function public.set_updated_at();

drop trigger if exists applications_set_updated_at on public.opportunity_applications;
create trigger applications_set_updated_at before update on public.opportunity_applications
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
  role_value public.profile_role;
begin
  base_username := lower(regexp_replace(
    coalesce(new.raw_user_meta_data ->> 'username', split_part(coalesce(new.email, 'athlete'), '@', 1)),
    '[^a-zA-Z0-9_]+', '_', 'g'
  ));
  base_username := trim(both '_' from base_username);
  if char_length(base_username) < 3 then base_username := 'athlete'; end if;
  base_username := left(base_username, 40) || '_' || left(replace(new.id::text, '-', ''), 8);

  role_value := case new.raw_user_meta_data ->> 'role'
    when 'coach' then 'coach'::public.profile_role
    when 'club' then 'club'::public.profile_role
    when 'association' then 'association'::public.profile_role
    else 'athlete'::public.profile_role
  end;

  insert into public.profiles (id, username, full_name, role)
  values (
    new.id,
    base_username,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 'New Athlete'),
    role_value
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_user();

-- SECURITY DEFINER is needed so RLS policies can check membership without
-- recursively querying the RLS-protected conversation_members table.
create or replace function public.is_conversation_member(target_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.conversation_members cm
    where cm.conversation_id = target_conversation_id
      and cm.user_id = auth.uid()
  );
$$;

revoke all on function public.is_conversation_member(uuid) from public;
grant execute on function public.is_conversation_member(uuid) to authenticated;

create or replace function public.create_direct_conversation(recipient_profile_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
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
  if not exists (select 1 from public.profiles p where p.id = recipient_profile_id) then
    raise exception 'Recipient profile was not found' using errcode = 'P0002';
  end if;

  select c.id into existing_conversation_id
  from public.conversations c
  join public.conversation_members m1 on m1.conversation_id = c.id and m1.user_id = current_user_id
  join public.conversation_members m2 on m2.conversation_id = c.id and m2.user_id = recipient_profile_id
  where (select count(*) from public.conversation_members m3 where m3.conversation_id = c.id) = 2
  limit 1;

  if existing_conversation_id is not null then
    return existing_conversation_id;
  end if;

  insert into public.conversations (created_by)
  values (current_user_id)
  returning id into new_conversation_id;

  insert into public.conversation_members (conversation_id, user_id)
  values (new_conversation_id, current_user_id), (new_conversation_id, recipient_profile_id);

  return new_conversation_id;
end;
$$;

revoke all on function public.create_direct_conversation(uuid) from public;
grant execute on function public.create_direct_conversation(uuid) to authenticated;

create or replace function public.notify_on_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (recipient_id, actor_id, type, entity_id, body)
  select cm.user_id, new.sender_id, 'message', new.conversation_id, left(new.content, 120)
  from public.conversation_members cm
  where cm.conversation_id = new.conversation_id
    and cm.user_id <> new.sender_id;
  return new;
end;
$$;

drop trigger if exists messages_create_notifications on public.messages;
create trigger messages_create_notifications
after insert on public.messages
for each row execute function public.notify_on_message();

create or replace function public.notify_on_follow()
returns trigger
language plpgsql
security definer
set search_path = public
as $
begin
  insert into public.notifications (recipient_id, actor_id, type, entity_id, body)
  values (new.following_id, new.follower_id, 'follow', new.follower_id, 'Started following you');
  return new;
end;
$;

drop trigger if exists follows_create_notification on public.follows;
create trigger follows_create_notification
after insert on public.follows
for each row execute function public.notify_on_follow();

create or replace function public.notify_on_reaction()
returns trigger
language plpgsql
security definer
set search_path = public
as $
declare
  post_author_id uuid;
begin
  select p.author_id into post_author_id from public.posts p where p.id = new.post_id;
  if post_author_id is not null and post_author_id <> new.user_id then
    insert into public.notifications (recipient_id, actor_id, type, entity_id, body)
    values (post_author_id, new.user_id, 'reaction', new.post_id, 'Reacted to your post');
  end if;
  return new;
end;
$;

drop trigger if exists reactions_create_notification on public.post_reactions;
create trigger reactions_create_notification
after insert on public.post_reactions
for each row execute function public.notify_on_reaction();

create or replace function public.notify_on_comment()
returns trigger
language plpgsql
security definer
set search_path = public
as $
declare
  post_author_id uuid;
begin
  select p.author_id into post_author_id from public.posts p where p.id = new.post_id;
  if post_author_id is not null and post_author_id <> new.author_id then
    insert into public.notifications (recipient_id, actor_id, type, entity_id, body)
    values (post_author_id, new.author_id, 'comment', new.post_id, left(new.content, 120));
  end if;
  return new;
end;
$;

drop trigger if exists comments_create_notification on public.comments;
create trigger comments_create_notification
after insert on public.comments
for each row execute function public.notify_on_comment();

create or replace function public.notify_on_application()
returns trigger
language plpgsql
security definer
set search_path = public
as $
declare
  opportunity_owner_id uuid;
begin
  select o.created_by into opportunity_owner_id from public.opportunities o where o.id = new.opportunity_id;
  if opportunity_owner_id is not null and opportunity_owner_id <> new.applicant_id then
    insert into public.notifications (recipient_id, actor_id, type, entity_id, body)
    values (opportunity_owner_id, new.applicant_id, 'application', new.opportunity_id, 'Someone applied to your opportunity');
  end if;
  return new;
end;
$;

drop trigger if exists applications_create_notification on public.opportunity_applications;
create trigger applications_create_notification
after insert on public.opportunity_applications
for each row execute function public.notify_on_application();

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.post_media enable row level security;
alter table public.follows enable row level security;
alter table public.post_reactions enable row level security;
alter table public.comments enable row level security;
alter table public.opportunities enable row level security;
alter table public.opportunity_applications enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "Profiles are publicly readable" on public.profiles;
create policy "Profiles are publicly readable" on public.profiles for select using (true);
drop policy if exists "Users update their own profile" on public.profiles;
create policy "Users update their own profile" on public.profiles for update to authenticated
using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "Read public, followed-network, and own posts" on public.posts;
create policy "Read public, followed-network, and own posts" on public.posts for select
using (
  visibility = 'public'
  or author_id = auth.uid()
  or (visibility = 'network' and exists (
    select 1 from public.follows f
    where f.follower_id = auth.uid() and f.following_id = author_id
  ))
);
drop policy if exists "Create own posts" on public.posts;
create policy "Create own posts" on public.posts for insert to authenticated
with check (author_id = auth.uid());
drop policy if exists "Update own posts" on public.posts;
create policy "Update own posts" on public.posts for update to authenticated
using (author_id = auth.uid()) with check (author_id = auth.uid());
drop policy if exists "Delete own posts" on public.posts;
create policy "Delete own posts" on public.posts for delete to authenticated
using (author_id = auth.uid());

drop policy if exists "Read media from readable posts" on public.post_media;
create policy "Read media from readable posts" on public.post_media for select
using (exists (select 1 from public.posts p where p.id = post_id));
drop policy if exists "Manage media on own posts" on public.post_media;
create policy "Manage media on own posts" on public.post_media for all to authenticated
using (exists (select 1 from public.posts p where p.id = post_id and p.author_id = auth.uid()))
with check (exists (select 1 from public.posts p where p.id = post_id and p.author_id = auth.uid()));

drop policy if exists "Users can view relevant follows" on public.follows;
create policy "Users can view relevant follows" on public.follows for select to authenticated
using (follower_id = auth.uid() or following_id = auth.uid());
drop policy if exists "Follow as yourself" on public.follows;
create policy "Follow as yourself" on public.follows for insert to authenticated
with check (follower_id = auth.uid() and follower_id <> following_id);
drop policy if exists "Unfollow as yourself" on public.follows;
create policy "Unfollow as yourself" on public.follows for delete to authenticated
using (follower_id = auth.uid());

drop policy if exists "Read reactions" on public.post_reactions;
create policy "Read reactions" on public.post_reactions for select to authenticated using (true);
drop policy if exists "React as yourself" on public.post_reactions;
create policy "React as yourself" on public.post_reactions for insert to authenticated
with check (user_id = auth.uid());
drop policy if exists "Change own reaction" on public.post_reactions;
create policy "Change own reaction" on public.post_reactions for update to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "Remove own reaction" on public.post_reactions;
create policy "Remove own reaction" on public.post_reactions for delete to authenticated
using (user_id = auth.uid());

drop policy if exists "Read comments on readable posts" on public.comments;
create policy "Read comments on readable posts" on public.comments for select
using (exists (select 1 from public.posts p where p.id = post_id));
drop policy if exists "Comment as yourself on readable posts" on public.comments;
create policy "Comment as yourself on readable posts" on public.comments for insert to authenticated
with check (author_id = auth.uid() and exists (select 1 from public.posts p where p.id = post_id));
drop policy if exists "Edit own comments" on public.comments;
create policy "Edit own comments" on public.comments for update to authenticated
using (author_id = auth.uid()) with check (author_id = auth.uid());
drop policy if exists "Delete own comments" on public.comments;
create policy "Delete own comments" on public.comments for delete to authenticated
using (author_id = auth.uid());

drop policy if exists "Read published or own opportunities" on public.opportunities;
create policy "Read published or own opportunities" on public.opportunities for select
using (status = 'published' or created_by = auth.uid());
drop policy if exists "Create opportunities as yourself" on public.opportunities;
create policy "Create opportunities as yourself" on public.opportunities for insert to authenticated
with check (created_by = auth.uid());
drop policy if exists "Update own opportunities" on public.opportunities;
create policy "Update own opportunities" on public.opportunities for update to authenticated
using (created_by = auth.uid()) with check (created_by = auth.uid());
drop policy if exists "Delete own opportunities" on public.opportunities;
create policy "Delete own opportunities" on public.opportunities for delete to authenticated
using (created_by = auth.uid());

drop policy if exists "Read own applications or applications to own opportunities" on public.opportunity_applications;
create policy "Read own applications or applications to own opportunities" on public.opportunity_applications for select to authenticated
using (
  applicant_id = auth.uid()
  or exists (select 1 from public.opportunities o where o.id = opportunity_id and o.created_by = auth.uid())
);
drop policy if exists "Apply as yourself" on public.opportunity_applications;
create policy "Apply as yourself" on public.opportunity_applications for insert to authenticated
with check (
  applicant_id = auth.uid()
  and exists (select 1 from public.opportunities o where o.id = opportunity_id and o.status = 'published')
);
drop policy if exists "Members read their conversations" on public.conversations;
create policy "Members read their conversations" on public.conversations for select to authenticated
using (public.is_conversation_member(id));
drop policy if exists "Members read conversation participants" on public.conversation_members;
create policy "Members read conversation participants" on public.conversation_members for select to authenticated
using (public.is_conversation_member(conversation_id));
drop policy if exists "Members read messages" on public.messages;
create policy "Members read messages" on public.messages for select to authenticated
using (public.is_conversation_member(conversation_id));
drop policy if exists "Send messages as yourself" on public.messages;
create policy "Send messages as yourself" on public.messages for insert to authenticated
with check (sender_id = auth.uid() and public.is_conversation_member(conversation_id));

drop policy if exists "Read own notifications" on public.notifications;
create policy "Read own notifications" on public.notifications for select to authenticated
using (recipient_id = auth.uid());
drop policy if exists "Mark own notifications read" on public.notifications;
create policy "Mark own notifications read" on public.notifications for update to authenticated
using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());

grant usage on schema public to anon, authenticated;
grant select on public.profiles, public.posts, public.post_media, public.comments, public.opportunities to anon, authenticated;
grant insert, update, delete on public.posts, public.post_media, public.comments to authenticated;
grant update (username, full_name, bio, location, primary_sport, avatar_url) on public.profiles to authenticated;
grant select, insert, delete on public.follows to authenticated;
grant select, insert, update, delete on public.post_reactions to authenticated;
grant insert, update, delete on public.opportunities to authenticated;
grant select on public.opportunity_applications to authenticated;
grant insert (opportunity_id, applicant_id, cover_note) on public.opportunity_applications to authenticated;
grant select on public.conversations, public.conversation_members, public.messages, public.notifications to authenticated;
grant insert on public.messages to authenticated;
grant update (read_at) on public.notifications to authenticated;

-- Profiles are created by the auth.users trigger; users should not insert rows directly.
