create table if not exists "public"."model_trims" (
    "id" uuid not null default gen_random_uuid(),
    "brand_model_id" uuid not null,
    "name" text not null,
    "created_at" timestamp with time zone not null default now()
);

create unique index if not exists model_trims_pkey on public.model_trims using btree (id);
create unique index if not exists model_trims_brand_model_id_name_key on public.model_trims using btree (brand_model_id, name);
create index if not exists model_trims_brand_model_id_idx on public.model_trims using btree (brand_model_id);

alter table "public"."model_trims" add constraint "model_trims_pkey" primary key using index "model_trims_pkey";
alter table "public"."model_trims" add constraint "model_trims_brand_model_id_name_key" unique using index "model_trims_brand_model_id_name_key";
alter table "public"."model_trims" add constraint "model_trims_brand_model_id_fkey" foreign key (brand_model_id) references public.brand_models(id) on update cascade on delete cascade not valid;
alter table "public"."model_trims" validate constraint "model_trims_brand_model_id_fkey";

alter table "public"."model_trims" enable row level security;

grant select on table "public"."model_trims" to "anon";

grant delete on table "public"."model_trims" to "authenticated";
grant insert on table "public"."model_trims" to "authenticated";
grant references on table "public"."model_trims" to "authenticated";
grant select on table "public"."model_trims" to "authenticated";
grant trigger on table "public"."model_trims" to "authenticated";
grant truncate on table "public"."model_trims" to "authenticated";
grant update on table "public"."model_trims" to "authenticated";

grant delete on table "public"."model_trims" to "service_role";
grant insert on table "public"."model_trims" to "service_role";
grant references on table "public"."model_trims" to "service_role";
grant select on table "public"."model_trims" to "service_role";
grant trigger on table "public"."model_trims" to "service_role";
grant truncate on table "public"."model_trims" to "service_role";
grant update on table "public"."model_trims" to "service_role";

create policy "Public can view model trims"
on "public"."model_trims"
as permissive
for select
to public
using (true);

create policy "Authenticated can manage model trims"
on "public"."model_trims"
as permissive
for all
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

alter table "public"."cars"
    add column if not exists "trim" text;

create index if not exists cars_trim_idx on public.cars using btree (trim);
