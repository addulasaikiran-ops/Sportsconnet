-- Permit signed-URL creation only for post media whose post the requester can read.
drop policy if exists "SportsConnect read media for readable posts" on storage.objects;
create policy "SportsConnect read media for readable posts"
on storage.objects for select to anon, authenticated
using (
  bucket_id = 'post-media'
  and exists (
    select 1
    from public.posts p
    where p.id::text = (storage.foldername(name))[2]
      and p.author_id::text = (storage.foldername(name))[1]
      and (
        p.visibility = 'public'
        or p.author_id = (select auth.uid())
        or (
          p.visibility = 'network'
          and exists (
            select 1 from public.follows f
            where f.follower_id = (select auth.uid())
              and f.following_id = p.author_id
          )
        )
      )
  )
);
