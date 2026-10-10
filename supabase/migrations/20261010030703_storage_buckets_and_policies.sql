-- SportsConnect Storage buckets and row-level access policies.
-- Avatars are public profile assets. Post media is private so network-only
-- posts do not leak through permanently public object URLs.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880,
    array['image/jpeg','image/png','image/webp','image/gif']),
  ('post-media', 'post-media', false, 104857600,
    array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime'])
on conflict (id) do update set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public reads are handled by the public avatars bucket. Uploads and mutations
-- are restricted to a user's own first-level folder: <auth.uid()>/<filename>.
drop policy if exists "SportsConnect users upload own avatars" on storage.objects;
create policy "SportsConnect users upload own avatars"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "SportsConnect users update own avatars" on storage.objects;
create policy "SportsConnect users update own avatars"
on storage.objects for update to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "SportsConnect users delete own avatars" on storage.objects;
create policy "SportsConnect users delete own avatars"
on storage.objects for delete to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

-- Post media paths are <author-uuid>/<post-uuid>/<filename>.
-- Reads require an authenticated user who can read the related post under the
-- same public/network/owner rule as the posts table.
drop policy if exists "SportsConnect read media for readable posts" on storage.objects;
create policy "SportsConnect read media for readable posts"
on storage.objects for select to authenticated
using (
  bucket_id = 'post-media'
  and exists (
    select 1
    from public.posts p
    where p.id::text = (storage.foldername(name))[2]
      and p.author_id::text = (storage.foldername(name))[1]
  )
);

drop policy if exists "SportsConnect users upload own post media" on storage.objects;
create policy "SportsConnect users upload own post media"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'post-media'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and exists (
    select 1
    from public.posts p
    where p.id::text = (storage.foldername(name))[2]
      and p.author_id = (select auth.uid())
  )
);

drop policy if exists "SportsConnect users update own post media" on storage.objects;
create policy "SportsConnect users update own post media"
on storage.objects for update to authenticated
using (
  bucket_id = 'post-media'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'post-media'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and exists (
    select 1
    from public.posts p
    where p.id::text = (storage.foldername(name))[2]
      and p.author_id = (select auth.uid())
  )
);

drop policy if exists "SportsConnect users delete own post media" on storage.objects;
create policy "SportsConnect users delete own post media"
on storage.objects for delete to authenticated
using (
  bucket_id = 'post-media'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);
