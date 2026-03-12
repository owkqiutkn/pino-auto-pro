-- Add description_en and description_fr to cars table for bilingual descriptions.
-- Backfill from existing description into description_en for legacy data.

alter table public.cars
    add column if not exists description_en text,
    add column if not exists description_fr text;

update public.cars
set description_en = coalesce(description_en, description);
