-- Add bilingual columns for categories (EN/FR) and backfill from existing name

ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS name_en text,
ADD COLUMN IF NOT EXISTS name_fr text;

UPDATE public.categories
SET
  name_en = COALESCE(name_en, name),
  name_fr = COALESCE(name_fr, name);

-- Make columns required for new inserts (existing rows now backfilled)
ALTER TABLE public.categories
ALTER COLUMN name_en SET NOT NULL,
ALTER COLUMN name_fr SET NOT NULL;
