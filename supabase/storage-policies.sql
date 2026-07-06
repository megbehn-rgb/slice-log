-- Slice Log — Supabase Storage policies for the `photos` bucket
--
-- Run this once in the Supabase SQL Editor, in addition to schema.sql, after
-- creating the "photos" bucket (Storage -> New bucket -> name it "photos" ->
-- toggle Public on).
--
-- Toggling a bucket "Public" only affects anonymous SELECT via a plain
-- public URL (what getPublicUrl() relies on) -- it does NOT grant INSERT or
-- DELETE. storage.objects has its own Row Level Security, separate from the
-- bucket-level public toggle, and ships with RLS enabled and no policies by
-- default, so uploads/deletes fail with "new row violates row-level
-- security policy" until you add policies like these.
--
-- Same trust model as the rest of this app (see schema.sql): no auth, so
-- these policies are scoped to the "photos" bucket but otherwise open to
-- anyone holding the anon key.

drop policy if exists "Public read access for photos bucket" on storage.objects;
create policy "Public read access for photos bucket"
on storage.objects for select
using (bucket_id = 'photos');

drop policy if exists "Public insert access for photos bucket" on storage.objects;
create policy "Public insert access for photos bucket"
on storage.objects for insert
with check (bucket_id = 'photos');

drop policy if exists "Public delete access for photos bucket" on storage.objects;
create policy "Public delete access for photos bucket"
on storage.objects for delete
using (bucket_id = 'photos');
