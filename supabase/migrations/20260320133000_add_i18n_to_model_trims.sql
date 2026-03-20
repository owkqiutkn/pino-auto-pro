alter table "public"."model_trims"
    add column if not exists "name_en" text,
    add column if not exists "name_es" text,
    add column if not exists "name_fr" text;

update "public"."model_trims"
set
    "name_en" = coalesce("name_en", "name"),
    "name_es" = coalesce("name_es", "name"),
    "name_fr" = coalesce("name_fr", "name");

alter table "public"."model_trims"
    alter column "name_en" set not null,
    alter column "name_es" set not null,
    alter column "name_fr" set not null;

alter table "public"."model_trims"
    drop constraint if exists "model_trims_brand_model_id_name_key";

drop index if exists "public"."model_trims_brand_model_id_name_key";

create unique index if not exists model_trims_brand_model_id_name_en_key
    on public.model_trims using btree (brand_model_id, name_en);

alter table "public"."model_trims"
    add constraint "model_trims_brand_model_id_name_en_key"
    unique using index "model_trims_brand_model_id_name_en_key";
