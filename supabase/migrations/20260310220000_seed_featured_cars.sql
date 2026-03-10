-- Seed 10 featured cars with cover images from Pexels.
-- Idempotent: use ON CONFLICT (slug) DO NOTHING and skip car_images if car already exists.

-- 1. 2022 Toyota Camry
WITH ins AS (
  INSERT INTO public.cars (slug, title, brand, model, year, km, price, discounted_price, status, description, featured, category)
  VALUES (
    '2022-toyota-camry',
    '2022 Toyota Camry',
    'Toyota',
    'Camry',
    2022,
    25000,
    28500,
    26900,
    'available',
    'Well maintained Toyota Camry with full service history. Low mileage, single owner.',
    true,
    'Sedan'
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id
)
INSERT INTO public.car_images (car_id, image_url, is_cover, sort_order)
SELECT ins.id, 'https://images.pexels.com/photos/18382225/pexels-photo-18382225.png?auto=compress&cs=tinysrgb&h=650&w=940', true, 0
FROM ins WHERE ins.id IS NOT NULL;

-- 2. 2021 Honda Civic
WITH ins AS (
  INSERT INTO public.cars (slug, title, brand, model, year, km, price, status, description, featured, category)
  VALUES (
    '2021-honda-civic',
    '2021 Honda Civic',
    'Honda',
    'Civic',
    2021,
    32000,
    24500,
    'available',
    'Reliable Honda Civic, excellent fuel economy and clean interior.',
    true,
    'Sedan'
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id
)
INSERT INTO public.car_images (car_id, image_url, is_cover, sort_order)
SELECT ins.id, 'https://images.pexels.com/photos/13446948/pexels-photo-13446948.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, 0
FROM ins WHERE ins.id IS NOT NULL;

-- 3. 2023 Nissan Rogue
WITH ins AS (
  INSERT INTO public.cars (slug, title, brand, model, year, km, price, status, description, featured, category)
  VALUES (
    '2023-nissan-rogue',
    '2023 Nissan Rogue',
    'Nissan',
    'Rogue',
    2023,
    12000,
    32900,
    'available',
    'Spacious SUV with modern tech and safety features. Like new condition.',
    true,
    'SUV'
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id
)
INSERT INTO public.car_images (car_id, image_url, is_cover, sort_order)
SELECT ins.id, 'https://images.pexels.com/photos/13446899/pexels-photo-13446899.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, 0
FROM ins WHERE ins.id IS NOT NULL;

-- 4. 2022 Hyundai Sonata
WITH ins AS (
  INSERT INTO public.cars (slug, title, brand, model, year, km, price, discounted_price, status, description, featured, category)
  VALUES (
    '2022-hyundai-sonata',
    '2022 Hyundai Sonata',
    'Hyundai',
    'Sonata',
    2022,
    18000,
    26500,
    24900,
    'available',
    'Comfortable midsize sedan with premium features and warranty remaining.',
    true,
    'Sedan'
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id
)
INSERT INTO public.car_images (car_id, image_url, is_cover, sort_order)
SELECT ins.id, 'https://images.pexels.com/photos/1402787/pexels-photo-1402787.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, 0
FROM ins WHERE ins.id IS NOT NULL;

-- 5. 2023 Kia Sportage
WITH ins AS (
  INSERT INTO public.cars (slug, title, brand, model, year, km, price, status, description, featured, category)
  VALUES (
    '2023-kia-sportage',
    '2023 Kia Sportage',
    'Kia',
    'Sportage',
    2023,
    8000,
    34900,
    'available',
    'Bold design and strong warranty. Loaded with tech and comfort options.',
    true,
    'SUV'
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id
)
INSERT INTO public.car_images (car_id, image_url, is_cover, sort_order)
SELECT ins.id, 'https://images.pexels.com/photos/30433742/pexels-photo-30433742.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, 0
FROM ins WHERE ins.id IS NOT NULL;

-- 6. 2022 Ford Explorer
WITH ins AS (
  INSERT INTO public.cars (slug, title, brand, model, year, km, price, status, description, featured, category)
  VALUES (
    '2022-ford-explorer',
    '2022 Ford Explorer',
    'Ford',
    'Explorer',
    2022,
    28000,
    41900,
    'available',
    'Three-row SUV with plenty of power and space for the whole family.',
    true,
    'SUV'
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id
)
INSERT INTO public.car_images (car_id, image_url, is_cover, sort_order)
SELECT ins.id, 'https://images.pexels.com/photos/13555123/pexels-photo-13555123.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, 0
FROM ins WHERE ins.id IS NOT NULL;

-- 7. 2021 Chevrolet Malibu
WITH ins AS (
  INSERT INTO public.cars (slug, title, brand, model, year, km, price, status, description, featured, category)
  VALUES (
    '2021-chevrolet-malibu',
    '2021 Chevrolet Malibu',
    'Chevrolet',
    'Malibu',
    2021,
    35000,
    22900,
    'available',
    'Affordable midsize sedan with smooth ride and good trunk space.',
    true,
    'Sedan'
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id
)
INSERT INTO public.car_images (car_id, image_url, is_cover, sort_order)
SELECT ins.id, 'https://images.pexels.com/photos/14808290/pexels-photo-14808290.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, 0
FROM ins WHERE ins.id IS NOT NULL;

-- 8. 2023 Mazda CX-5
WITH ins AS (
  INSERT INTO public.cars (slug, title, brand, model, year, km, price, status, description, featured, category)
  VALUES (
    '2023-mazda-cx-5',
    '2023 Mazda CX-5',
    'Mazda',
    'CX-5',
    2023,
    15000,
    35900,
    'available',
    'Sporty crossover with refined handling and upscale interior.',
    true,
    'Crossover'
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id
)
INSERT INTO public.car_images (car_id, image_url, is_cover, sort_order)
SELECT ins.id, 'https://images.pexels.com/photos/28192205/pexels-photo-28192205.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, 0
FROM ins WHERE ins.id IS NOT NULL;

-- 9. 2022 Volkswagen Golf
WITH ins AS (
  INSERT INTO public.cars (slug, title, brand, model, year, km, price, status, description, featured, category)
  VALUES (
    '2022-volkswagen-golf',
    '2022 Volkswagen Golf',
    'Volkswagen',
    'Golf',
    2022,
    22000,
    27900,
    'available',
    'Fun-to-drive hatchback with European build quality and practicality.',
    true,
    'Hatchback'
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id
)
INSERT INTO public.car_images (car_id, image_url, is_cover, sort_order)
SELECT ins.id, 'https://images.pexels.com/photos/33987617/pexels-photo-33987617.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, 0
FROM ins WHERE ins.id IS NOT NULL;

-- 10. 2023 BMW 3 Series
WITH ins AS (
  INSERT INTO public.cars (slug, title, brand, model, year, km, price, discounted_price, status, description, featured, category)
  VALUES (
    '2023-bmw-3-series',
    '2023 BMW 3 Series',
    'BMW',
    '3 Series',
    2023,
    10000,
    48900,
    46900,
    'available',
    'Luxury sport sedan with powerful engine and premium cabin. Certified pre-owned.',
    true,
    'Sedan'
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id
)
INSERT INTO public.car_images (car_id, image_url, is_cover, sort_order)
SELECT ins.id, 'https://images.pexels.com/photos/13467225/pexels-photo-13467225.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, 0
FROM ins WHERE ins.id IS NOT NULL;
