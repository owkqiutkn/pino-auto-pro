create table "public"."cars" (
    "id" uuid not null default gen_random_uuid(),
    "slug" text not null,
    "title" text not null,
    "brand" text not null,
    "model" text not null,
    "year" integer not null,
    "km" integer not null,
    "price" integer not null,
    "status" text not null default 'available',
    "description" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    constraint "cars_status_check" check (status = any (array['available'::text, 'sold'::text, 'hidden'::text]))
);

create table "public"."car_images" (
    "id" uuid not null default gen_random_uuid(),
    "car_id" uuid not null,
    "image_url" text not null,
    "sort_order" integer not null default 0,
    "is_cover" boolean not null default false,
    "created_at" timestamp with time zone not null default now()
);

create unique index cars_pkey on public.cars using btree (id);
create unique index cars_slug_key on public.cars using btree (slug);
create index cars_brand_idx on public.cars using btree (brand);
create index cars_year_idx on public.cars using btree (year);
create index cars_km_idx on public.cars using btree (km);
create index cars_price_idx on public.cars using btree (price);
create index cars_status_idx on public.cars using btree (status);
create index cars_created_at_idx on public.cars using btree (created_at desc);

create unique index car_images_pkey on public.car_images using btree (id);
create index car_images_car_id_idx on public.car_images using btree (car_id);
create index car_images_sort_order_idx on public.car_images using btree (sort_order);

alter table "public"."cars" add constraint "cars_pkey" primary key using index "cars_pkey";
alter table "public"."cars" add constraint "cars_slug_key" unique using index "cars_slug_key";

alter table "public"."car_images" add constraint "car_images_pkey" primary key using index "car_images_pkey";
alter table "public"."car_images" add constraint "car_images_car_id_fkey" foreign key (car_id) references public.cars(id) on update cascade on delete cascade not valid;
alter table "public"."car_images" validate constraint "car_images_car_id_fkey";

create or replace function public.set_cars_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger cars_set_updated_at
before update on public.cars
for each row
execute function public.set_cars_updated_at();

alter table "public"."cars" enable row level security;
alter table "public"."car_images" enable row level security;

create policy "Public can view available cars"
on "public"."cars"
as permissive
for select
to anon
using (status = 'available'::text);

create policy "Authenticated can manage cars"
on "public"."cars"
as permissive
for all
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "Public can view images of available cars"
on "public"."car_images"
as permissive
for select
to anon
using (
    exists (
        select 1
        from public.cars
        where cars.id = car_images.car_id
          and cars.status = 'available'::text
    )
);

create policy "Authenticated can manage car images"
on "public"."car_images"
as permissive
for all
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

insert into storage.buckets (id, name, public)
values ('car-images', 'car-images', true)
on conflict (id) do nothing;

create policy "Public can read car images bucket"
on "storage"."objects"
as permissive
for select
to public
using (bucket_id = 'car-images'::text);

create policy "Authenticated can upload car images"
on "storage"."objects"
as permissive
for insert
to authenticated
with check (
    bucket_id = 'car-images'::text
    and name like 'cars/%'
);

create policy "Authenticated can update car images"
on "storage"."objects"
as permissive
for update
to authenticated
using (
    bucket_id = 'car-images'::text
    and name like 'cars/%'
)
with check (
    bucket_id = 'car-images'::text
    and name like 'cars/%'
);

create policy "Authenticated can delete car images"
on "storage"."objects"
as permissive
for delete
to authenticated
using (
    bucket_id = 'car-images'::text
    and name like 'cars/%'
);
