-- Add more brand models for existing seeded brands.
-- Idempotent via ON CONFLICT (brand_id, name) DO NOTHING.

insert into public.brand_models (brand_id, name)
select b.id, m.model_name
from public.brands b
join (
  values
    ('Yaris'),
    ('Prius'),
    ('Hilux'),
    ('Land Cruiser'),
    ('Fortuner'),
    ('Yaris Cross')
) as m(model_name) on true
where b.name = 'Toyota'
on conflict (brand_id, name) do nothing;

insert into public.brand_models (brand_id, name)
select b.id, m.model_name
from public.brands b
join (
  values
    ('City'),
    ('HR-V'),
    ('BR-V'),
    ('Fit'),
    ('Odyssey'),
    ('Passport')
) as m(model_name) on true
where b.name = 'Honda'
on conflict (brand_id, name) do nothing;

insert into public.brand_models (brand_id, name)
select b.id, m.model_name
from public.brands b
join (
  values
    ('Versa'),
    ('Kicks'),
    ('X-Trail'),
    ('Murano'),
    ('Frontier'),
    ('Terra')
) as m(model_name) on true
where b.name = 'Nissan'
on conflict (brand_id, name) do nothing;

insert into public.brand_models (brand_id, name)
select b.id, m.model_name
from public.brands b
join (
  values
    ('Accent'),
    ('Kona'),
    ('Palisade'),
    ('Creta'),
    ('Venue'),
    ('Staria')
) as m(model_name) on true
where b.name = 'Hyundai'
on conflict (brand_id, name) do nothing;

insert into public.brand_models (brand_id, name)
select b.id, m.model_name
from public.brands b
join (
  values
    ('Picanto'),
    ('Seltos'),
    ('Carnival'),
    ('Sonet'),
    ('Stonic'),
    ('Niro')
) as m(model_name) on true
where b.name = 'Kia'
on conflict (brand_id, name) do nothing;

insert into public.brand_models (brand_id, name)
select b.id, m.model_name
from public.brands b
join (
  values
    ('Mustang'),
    ('Ranger'),
    ('Bronco'),
    ('Everest'),
    ('Expedition'),
    ('Maverick')
) as m(model_name) on true
where b.name = 'Ford'
on conflict (brand_id, name) do nothing;

insert into public.brand_models (brand_id, name)
select b.id, m.model_name
from public.brands b
join (
  values
    ('Cruze'),
    ('Onix'),
    ('Trax'),
    ('Trailblazer'),
    ('Tahoe'),
    ('Colorado')
) as m(model_name) on true
where b.name = 'Chevrolet'
on conflict (brand_id, name) do nothing;

insert into public.brand_models (brand_id, name)
select b.id, m.model_name
from public.brands b
join (
  values
    ('CX-3'),
    ('CX-30'),
    ('CX-50'),
    ('CX-60'),
    ('BT-50'),
    ('MX-5')
) as m(model_name) on true
where b.name = 'Mazda'
on conflict (brand_id, name) do nothing;

insert into public.brand_models (brand_id, name)
select b.id, m.model_name
from public.brands b
join (
  values
    ('Passat'),
    ('T-Roc'),
    ('Touareg'),
    ('Amarok'),
    ('Virtus'),
    ('Taos')
) as m(model_name) on true
where b.name = 'Volkswagen'
on conflict (brand_id, name) do nothing;

insert into public.brand_models (brand_id, name)
select b.id, m.model_name
from public.brands b
join (
  values
    ('1 Series'),
    ('7 Series'),
    ('X1'),
    ('X7'),
    ('M3'),
    ('i4')
) as m(model_name) on true
where b.name = 'BMW'
on conflict (brand_id, name) do nothing;
