-- Feature categories and features tables with bilingual support (name_en, name_fr)

create table "public"."feature_categories" (
    "id" uuid not null default gen_random_uuid(),
    "name" text,
    "name_en" text not null,
    "name_fr" text not null,
    "sort_order" integer not null default 0,
    "created_at" timestamp with time zone not null default now()
);

create table "public"."features" (
    "id" uuid not null default gen_random_uuid(),
    "feature_category_id" uuid not null,
    "name" text,
    "name_en" text not null,
    "name_fr" text not null,
    "sort_order" integer not null default 0,
    "created_at" timestamp with time zone not null default now()
);

create table "public"."car_features" (
    "car_id" uuid not null,
    "feature_id" uuid not null
);

create unique index feature_categories_pkey on public.feature_categories using btree (id);
create unique index features_pkey on public.features using btree (id);
create unique index car_features_pkey on public.car_features using btree (car_id, feature_id);

alter table "public"."feature_categories" add constraint "feature_categories_pkey" primary key using index "feature_categories_pkey";
alter table "public"."features" add constraint "features_pkey" primary key using index "features_pkey";
alter table "public"."car_features" add constraint "car_features_pkey" primary key using index "car_features_pkey";

alter table "public"."features" add constraint "features_feature_category_id_fkey"
    foreign key ("feature_category_id") references "public"."feature_categories"("id") on update cascade on delete cascade;

alter table "public"."car_features" add constraint "car_features_car_id_fkey"
    foreign key ("car_id") references "public"."cars"("id") on update cascade on delete cascade;
alter table "public"."car_features" add constraint "car_features_feature_id_fkey"
    foreign key ("feature_id") references "public"."features"("id") on update cascade on delete cascade;

alter table "public"."feature_categories" enable row level security;
alter table "public"."features" enable row level security;
alter table "public"."car_features" enable row level security;

grant select on table "public"."feature_categories" to "anon";
grant select on table "public"."features" to "anon";
grant select on table "public"."car_features" to "anon";

grant delete on table "public"."feature_categories" to "authenticated";
grant insert on table "public"."feature_categories" to "authenticated";
grant references on table "public"."feature_categories" to "authenticated";
grant select on table "public"."feature_categories" to "authenticated";
grant trigger on table "public"."feature_categories" to "authenticated";
grant truncate on table "public"."feature_categories" to "authenticated";
grant update on table "public"."feature_categories" to "authenticated";

grant delete on table "public"."features" to "authenticated";
grant insert on table "public"."features" to "authenticated";
grant references on table "public"."features" to "authenticated";
grant select on table "public"."features" to "authenticated";
grant trigger on table "public"."features" to "authenticated";
grant truncate on table "public"."features" to "authenticated";
grant update on table "public"."features" to "authenticated";

grant delete on table "public"."car_features" to "authenticated";
grant insert on table "public"."car_features" to "authenticated";
grant references on table "public"."car_features" to "authenticated";
grant select on table "public"."car_features" to "authenticated";
grant trigger on table "public"."car_features" to "authenticated";
grant truncate on table "public"."car_features" to "authenticated";
grant update on table "public"."car_features" to "authenticated";

grant delete on table "public"."feature_categories" to "service_role";
grant insert on table "public"."feature_categories" to "service_role";
grant references on table "public"."feature_categories" to "service_role";
grant select on table "public"."feature_categories" to "service_role";
grant trigger on table "public"."feature_categories" to "service_role";
grant truncate on table "public"."feature_categories" to "service_role";
grant update on table "public"."feature_categories" to "service_role";

grant delete on table "public"."features" to "service_role";
grant insert on table "public"."features" to "service_role";
grant references on table "public"."features" to "service_role";
grant select on table "public"."features" to "service_role";
grant trigger on table "public"."features" to "service_role";
grant truncate on table "public"."features" to "service_role";
grant update on table "public"."features" to "service_role";

grant delete on table "public"."car_features" to "service_role";
grant insert on table "public"."car_features" to "service_role";
grant references on table "public"."car_features" to "service_role";
grant select on table "public"."car_features" to "service_role";
grant trigger on table "public"."car_features" to "service_role";
grant truncate on table "public"."car_features" to "service_role";
grant update on table "public"."car_features" to "service_role";

create policy "Public can view feature categories"
on "public"."feature_categories"
as permissive
for select
to public
using (true);

create policy "Authenticated can manage feature categories"
on "public"."feature_categories"
as permissive
for all
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "Public can view features"
on "public"."features"
as permissive
for select
to public
using (true);

create policy "Authenticated can manage features"
on "public"."features"
as permissive
for all
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "Public can view car features"
on "public"."car_features"
as permissive
for select
to public
using (true);

create policy "Authenticated can manage car features"
on "public"."car_features"
as permissive
for all
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);
