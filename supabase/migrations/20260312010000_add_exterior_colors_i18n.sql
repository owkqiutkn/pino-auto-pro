-- Add bilingual columns for exterior_colors (EN/FR) and backfill from existing name

ALTER TABLE public.exterior_colors
ADD COLUMN IF NOT EXISTS name_en text,
ADD COLUMN IF NOT EXISTS name_fr text;

UPDATE public.exterior_colors
SET
  name_en = COALESCE(name_en, name),
  name_fr = COALESCE(name_fr, name);

ALTER TABLE public.exterior_colors
ALTER COLUMN name_en SET NOT NULL,
ALTER COLUMN name_fr SET NOT NULL;

