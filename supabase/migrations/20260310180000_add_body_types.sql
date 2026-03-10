create table "public"."body_types" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "created_at" timestamp with time zone not null default now()
);

create unique index body_types_pkey on public.body_types using btree (id);
create unique index body_types_name_key on public.body_types using btree (name);

alter table "public"."body_types" add constraint "body_types_pkey" primary key using index "body_types_pkey";
alter table "public"."body_types" add constraint "body_types_name_key" unique using index "body_types_name_key";

alter table "public"."cars" add column "body_type" text;

alter table "public"."body_types" enable row level security;

grant select on table "public"."body_types" to "anon";

grant delete on table "public"."body_types" to "authenticated";
grant insert on table "public"."body_types" to "authenticated";
grant references on table "public"."body_types" to "authenticated";
grant select on table "public"."body_types" to "authenticated";
grant trigger on table "public"."body_types" to "authenticated";
grant truncate on table "public"."body_types" to "authenticated";
grant update on table "public"."body_types" to "authenticated";

grant delete on table "public"."body_types" to "service_role";
grant insert on table "public"."body_types" to "service_role";
grant references on table "public"."body_types" to "service_role";
grant select on table "public"."body_types" to "service_role";
grant trigger on table "public"."body_types" to "service_role";
grant truncate on table "public"."body_types" to "service_role";
grant update on table "public"."body_types" to "service_role";

create policy "Public can view body types"
on "public"."body_types"
as permissive
for select
to public
using (true);

create policy "Authenticated can manage body types"
on "public"."body_types"
as permissive
for all
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);
