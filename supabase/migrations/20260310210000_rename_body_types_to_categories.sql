-- Rename table body_types to categories
alter table public.body_types rename to categories;

-- Rename indexes
alter index body_types_pkey rename to categories_pkey;
alter index body_types_name_key rename to categories_name_key;

-- Rename column in cars
alter table public.cars rename column body_type to category;

-- Update RLS policy names (drop old, create new with same permissions)
drop policy if exists "Public can view body types" on public.categories;
create policy "Public can view categories"
on public.categories
as permissive
for select
to public
using (true);

drop policy if exists "Authenticated can manage body types" on public.categories;
create policy "Authenticated can manage categories"
on public.categories
as permissive
for all
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);
