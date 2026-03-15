-- Add name_es (and description_es on cars) for Spanish locale across all i18n tables.
-- Backfill from name_en/description_en then set NOT NULL where other locale columns are NOT NULL.

-- categories
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS name_es text;

UPDATE public.categories
SET name_es = COALESCE(name_es, name_en, name);

ALTER TABLE public.categories
ALTER COLUMN name_es SET NOT NULL;

-- exterior_colors
ALTER TABLE public.exterior_colors
ADD COLUMN IF NOT EXISTS name_es text;

UPDATE public.exterior_colors
SET name_es = COALESCE(name_es, name_en, name);

ALTER TABLE public.exterior_colors
ALTER COLUMN name_es SET NOT NULL;

-- feature_categories
ALTER TABLE public.feature_categories
ADD COLUMN IF NOT EXISTS name_es text;

UPDATE public.feature_categories
SET name_es = COALESCE(name_es, name_en, name);

ALTER TABLE public.feature_categories
ALTER COLUMN name_es SET NOT NULL;

-- features
ALTER TABLE public.features
ADD COLUMN IF NOT EXISTS name_es text;

UPDATE public.features
SET name_es = COALESCE(name_es, name_en, name);

ALTER TABLE public.features
ALTER COLUMN name_es SET NOT NULL;

-- engines (backfill from name_en if present, else name)
ALTER TABLE public.engines
ADD COLUMN IF NOT EXISTS name_es text;

UPDATE public.engines
SET name_es = COALESCE(name_es, name);

ALTER TABLE public.engines
ALTER COLUMN name_es SET NOT NULL;

-- fuels
ALTER TABLE public.fuels
ADD COLUMN IF NOT EXISTS name_es text;

UPDATE public.fuels
SET name_es = COALESCE(name_es, name);

ALTER TABLE public.fuels
ALTER COLUMN name_es SET NOT NULL;

-- transmissions
ALTER TABLE public.transmissions
ADD COLUMN IF NOT EXISTS name_es text;

UPDATE public.transmissions
SET name_es = COALESCE(name_es, name);

ALTER TABLE public.transmissions
ALTER COLUMN name_es SET NOT NULL;

-- cars: description_es (nullable like description_en/description_fr)
ALTER TABLE public.cars
ADD COLUMN IF NOT EXISTS description_es text;

UPDATE public.cars
SET description_es = COALESCE(description_es, description_en, description);
