insert into public.exterior_colors (name)
values
    ('White'),
    ('Black'),
    ('Silver'),
    ('Gray'),
    ('Blue'),
    ('Red'),
    ('Green'),
    ('Yellow')
on conflict (name) do nothing;

insert into public.engines (name)
values
    ('I4'),
    ('I6'),
    ('V6'),
    ('V8'),
    ('Electric'),
    ('Hybrid')
on conflict (name) do nothing;

insert into public.fuels (name)
values
    ('Gasoline'),
    ('Diesel'),
    ('Electric'),
    ('Hybrid'),
    ('Plug-in Hybrid')
on conflict (name) do nothing;

insert into public.transmissions (name)
values
    ('Manual'),
    ('Automatic'),
    ('CVT'),
    ('Dual-clutch')
on conflict (name) do nothing;

