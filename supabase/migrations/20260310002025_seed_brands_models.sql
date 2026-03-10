-- Seed default brands and representative models.
-- Idempotent by unique constraints on brands(name) and brand_models(brand_id, name).

insert into public.brands (name)
values
  ('Toyota'),
  ('Honda'),
  ('Nissan'),
  ('Hyundai'),
  ('Kia'),
  ('Ford'),
  ('Chevrolet'),
  ('Mazda'),
  ('Volkswagen'),
  ('BMW')
on conflict (name) do nothing;

with model_seeds (brand_name, model_name) as (
  values
    ('Toyota', 'Corolla'),
    ('Toyota', 'Camry'),
    ('Toyota', 'RAV4'),
    ('Toyota', 'Highlander'),
    ('Honda', 'Civic'),
    ('Honda', 'Accord'),
    ('Honda', 'CR-V'),
    ('Honda', 'Pilot'),
    ('Nissan', 'Sentra'),
    ('Nissan', 'Altima'),
    ('Nissan', 'Rogue'),
    ('Nissan', 'Pathfinder'),
    ('Hyundai', 'Elantra'),
    ('Hyundai', 'Sonata'),
    ('Hyundai', 'Tucson'),
    ('Hyundai', 'Santa Fe'),
    ('Kia', 'Rio'),
    ('Kia', 'Forte'),
    ('Kia', 'Sportage'),
    ('Kia', 'Sorento'),
    ('Ford', 'Fiesta'),
    ('Ford', 'Focus'),
    ('Ford', 'Escape'),
    ('Ford', 'Explorer'),
    ('Chevrolet', 'Spark'),
    ('Chevrolet', 'Malibu'),
    ('Chevrolet', 'Equinox'),
    ('Chevrolet', 'Traverse'),
    ('Mazda', 'Mazda3'),
    ('Mazda', 'Mazda6'),
    ('Mazda', 'CX-5'),
    ('Mazda', 'CX-9'),
    ('Volkswagen', 'Polo'),
    ('Volkswagen', 'Golf'),
    ('Volkswagen', 'Jetta'),
    ('Volkswagen', 'Tiguan'),
    ('BMW', '3 Series'),
    ('BMW', '5 Series'),
    ('BMW', 'X3'),
    ('BMW', 'X5')
)
insert into public.brand_models (brand_id, name)
select b.id, ms.model_name
from model_seeds ms
join public.brands b on b.name = ms.brand_name
on conflict (brand_id, name) do nothing;
