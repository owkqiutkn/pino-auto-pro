-- Seed category image_url from public/categories images (copied from new-landing)
UPDATE public.categories
SET image_url = '/categories/coupe.jpg'
WHERE name_en = 'Coupe' OR name = 'Coupe';

UPDATE public.categories
SET image_url = '/categories/sedan.jpg'
WHERE name_en = 'Sedan' OR name = 'Sedan';

UPDATE public.categories
SET image_url = '/categories/suv.jpg'
WHERE name_en = 'SUV' OR name = 'SUV';

UPDATE public.categories
SET image_url = '/categories/truck.jpg'
WHERE name_en = 'Pickup Truck' OR name = 'Pickup Truck';
