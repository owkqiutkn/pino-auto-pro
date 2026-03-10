create table "public"."brands" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "created_at" timestamp with time zone not null default now()
);

create table "public"."brand_models" (
    "id" uuid not null default gen_random_uuid(),
    "brand_id" uuid not null,
    "name" text not null,
    "created_at" timestamp with time zone not null default now()
);

create unique index brands_pkey on public.brands using btree (id);
create unique index brands_name_key on public.brands using btree (name);

create unique index brand_models_pkey on public.brand_models using btree (id);
create unique index brand_models_brand_id_name_key on public.brand_models using btree (brand_id, name);
create index brand_models_brand_id_idx on public.brand_models using btree (brand_id);

alter table "public"."brands" add constraint "brands_pkey" primary key using index "brands_pkey";
alter table "public"."brands" add constraint "brands_name_key" unique using index "brands_name_key";

alter table "public"."brand_models" add constraint "brand_models_pkey" primary key using index "brand_models_pkey";
alter table "public"."brand_models" add constraint "brand_models_brand_id_name_key" unique using index "brand_models_brand_id_name_key";
alter table "public"."brand_models" add constraint "brand_models_brand_id_fkey" foreign key (brand_id) references public.brands(id) on update cascade on delete cascade not valid;
alter table "public"."brand_models" validate constraint "brand_models_brand_id_fkey";

alter table "public"."brands" enable row level security;
alter table "public"."brand_models" enable row level security;

grant select on table "public"."brands" to "anon";

grant delete on table "public"."brands" to "authenticated";
grant insert on table "public"."brands" to "authenticated";
grant references on table "public"."brands" to "authenticated";
grant select on table "public"."brands" to "authenticated";
grant trigger on table "public"."brands" to "authenticated";
grant truncate on table "public"."brands" to "authenticated";
grant update on table "public"."brands" to "authenticated";

grant delete on table "public"."brands" to "service_role";
grant insert on table "public"."brands" to "service_role";
grant references on table "public"."brands" to "service_role";
grant select on table "public"."brands" to "service_role";
grant trigger on table "public"."brands" to "service_role";
grant truncate on table "public"."brands" to "service_role";
grant update on table "public"."brands" to "service_role";

grant select on table "public"."brand_models" to "anon";

grant delete on table "public"."brand_models" to "authenticated";
grant insert on table "public"."brand_models" to "authenticated";
grant references on table "public"."brand_models" to "authenticated";
grant select on table "public"."brand_models" to "authenticated";
grant trigger on table "public"."brand_models" to "authenticated";
grant truncate on table "public"."brand_models" to "authenticated";
grant update on table "public"."brand_models" to "authenticated";

grant delete on table "public"."brand_models" to "service_role";
grant insert on table "public"."brand_models" to "service_role";
grant references on table "public"."brand_models" to "service_role";
grant select on table "public"."brand_models" to "service_role";
grant trigger on table "public"."brand_models" to "service_role";
grant truncate on table "public"."brand_models" to "service_role";
grant update on table "public"."brand_models" to "service_role";

create policy "Public can view brands"
on "public"."brands"
as permissive
for select
to public
using (true);

create policy "Authenticated can manage brands"
on "public"."brands"
as permissive
for all
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "Public can view brand models"
on "public"."brand_models"
as permissive
for select
to public
using (true);

create policy "Authenticated can manage brand models"
on "public"."brand_models"
as permissive
for all
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);
