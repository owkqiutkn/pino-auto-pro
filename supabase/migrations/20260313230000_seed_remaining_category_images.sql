-- Seed remaining category image_url (from Pexels via MCP)
UPDATE public.categories
SET image_url = '/categories/hatchback.jpg'
WHERE name_en = 'Hatchback' OR name = 'Hatchback';

UPDATE public.categories
SET image_url = '/categories/convertible.jpg'
WHERE name_en = 'Convertible' OR name = 'Convertible';

UPDATE public.categories
SET image_url = '/categories/wagon.jpg'
WHERE name_en = 'Wagon' OR name = 'Wagon';

UPDATE public.categories
SET image_url = '/categories/minivan.jpg'
WHERE name_en = 'Minivan' OR name = 'Minivan';

UPDATE public.categories
SET image_url = '/categories/van.jpg'
WHERE name_en = 'Van' OR name = 'Van';

UPDATE public.categories
SET image_url = '/categories/crossover.jpg'
WHERE name_en = 'Crossover' OR name = 'Crossover';

UPDATE public.categories
SET image_url = '/categories/roadster.jpg'
WHERE name_en = 'Roadster' OR name = 'Roadster';

UPDATE public.categories
SET image_url = '/categories/liftback.jpg'
WHERE name_en = 'Liftback' OR name = 'Liftback';
