create table "public"."exterior_colors" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "created_at" timestamp with time zone not null default now()
);

create table "public"."engines" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "created_at" timestamp with time zone not null default now()
);

create table "public"."fuels" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "created_at" timestamp with time zone not null default now()
);

create table "public"."transmissions" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "created_at" timestamp with time zone not null default now()
);

create unique index exterior_colors_pkey on public.exterior_colors using btree (id);
create unique index exterior_colors_name_key on public.exterior_colors using btree (name);

create unique index engines_pkey on public.engines using btree (id);
create unique index engines_name_key on public.engines using btree (name);

create unique index fuels_pkey on public.fuels using btree (id);
create unique index fuels_name_key on public.fuels using btree (name);

create unique index transmissions_pkey on public.transmissions using btree (id);
create unique index transmissions_name_key on public.transmissions using btree (name);

alter table "public"."exterior_colors" add constraint "exterior_colors_pkey" primary key using index "exterior_colors_pkey";
alter table "public"."exterior_colors" add constraint "exterior_colors_name_key" unique using index "exterior_colors_name_key";

alter table "public"."engines" add constraint "engines_pkey" primary key using index "engines_pkey";
alter table "public"."engines" add constraint "engines_name_key" unique using index "engines_name_key";

alter table "public"."fuels" add constraint "fuels_pkey" primary key using index "fuels_pkey";
alter table "public"."fuels" add constraint "fuels_name_key" unique using index "fuels_name_key";

alter table "public"."transmissions" add constraint "transmissions_pkey" primary key using index "transmissions_pkey";
alter table "public"."transmissions" add constraint "transmissions_name_key" unique using index "transmissions_name_key";

alter table "public"."exterior_colors" enable row level security;
alter table "public"."engines" enable row level security;
alter table "public"."fuels" enable row level security;
alter table "public"."transmissions" enable row level security;

grant select on table "public"."exterior_colors" to "anon";
grant select on table "public"."engines" to "anon";
grant select on table "public"."fuels" to "anon";
grant select on table "public"."transmissions" to "anon";

grant delete on table "public"."exterior_colors" to "authenticated";
grant insert on table "public"."exterior_colors" to "authenticated";
grant references on table "public"."exterior_colors" to "authenticated";
grant select on table "public"."exterior_colors" to "authenticated";
grant trigger on table "public"."exterior_colors" to "authenticated";
grant truncate on table "public"."exterior_colors" to "authenticated";
grant update on table "public"."exterior_colors" to "authenticated";

grant delete on table "public"."engines" to "authenticated";
grant insert on table "public"."engines" to "authenticated";
grant references on table "public"."engines" to "authenticated";
grant select on table "public"."engines" to "authenticated";
grant trigger on table "public"."engines" to "authenticated";
grant truncate on table "public"."engines" to "authenticated";
grant update on table "public"."engines" to "authenticated";

grant delete on table "public"."fuels" to "authenticated";
grant insert on table "public"."fuels" to "authenticated";
grant references on table "public"."fuels" to "authenticated";
grant select on table "public"."fuels" to "authenticated";
grant trigger on table "public"."fuels" to "authenticated";
grant truncate on table "public"."fuels" to "authenticated";
grant update on table "public"."fuels" to "authenticated";

grant delete on table "public"."transmissions" to "authenticated";
grant insert on table "public"."transmissions" to "authenticated";
grant references on table "public"."transmissions" to "authenticated";
grant select on table "public"."transmissions" to "authenticated";
grant trigger on table "public"."transmissions" to "authenticated";
grant truncate on table "public"."transmissions" to "authenticated";
grant update on table "public"."transmissions" to "authenticated";

grant delete on table "public"."exterior_colors" to "service_role";
grant insert on table "public"."exterior_colors" to "service_role";
grant references on table "public"."exterior_colors" to "service_role";
grant select on table "public"."exterior_colors" to "service_role";
grant trigger on table "public"."exterior_colors" to "service_role";
grant truncate on table "public"."exterior_colors" to "service_role";
grant update on table "public"."exterior_colors" to "service_role";

grant delete on table "public"."engines" to "service_role";
grant insert on table "public"."engines" to "service_role";
grant references on table "public"."engines" to "service_role";
grant select on table "public"."engines" to "service_role";
grant trigger on table "public"."engines" to "service_role";
grant truncate on table "public"."engines" to "service_role";
grant update on table "public"."engines" to "service_role";

grant delete on table "public"."fuels" to "service_role";
grant insert on table "public"."fuels" to "service_role";
grant references on table "public"."fuels" to "service_role";
grant select on table "public"."fuels" to "service_role";
grant trigger on table "public"."fuels" to "service_role";
grant truncate on table "public"."fuels" to "service_role";
grant update on table "public"."fuels" to "service_role";

grant delete on table "public"."transmissions" to "service_role";
grant insert on table "public"."transmissions" to "service_role";
grant references on table "public"."transmissions" to "service_role";
grant select on table "public"."transmissions" to "service_role";
grant trigger on table "public"."transmissions" to "service_role";
grant truncate on table "public"."transmissions" to "service_role";
grant update on table "public"."transmissions" to "service_role";

create policy "Public can view exterior colors"
on "public"."exterior_colors"
as permissive
for select
to public
using (true);

create policy "Authenticated can manage exterior colors"
on "public"."exterior_colors"
as permissive
for all
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "Public can view engines"
on "public"."engines"
as permissive
for select
to public
using (true);

create policy "Authenticated can manage engines"
on "public"."engines"
as permissive
for all
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "Public can view fuels"
on "public"."fuels"
as permissive
for select
to public
using (true);

create policy "Authenticated can manage fuels"
on "public"."fuels"
as permissive
for all
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "Public can view transmissions"
on "public"."transmissions"
as permissive
for select
to public
using (true);

create policy "Authenticated can manage transmissions"
on "public"."transmissions"
as permissive
for all
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

