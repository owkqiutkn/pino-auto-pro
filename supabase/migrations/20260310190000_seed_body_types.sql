insert into public.body_types (name)
values
    ('Sedan'),
    ('SUV'),
    ('Coupe'),
    ('Hatchback'),
    ('Convertible'),
    ('Wagon'),
    ('Pickup Truck'),
    ('Minivan'),
    ('Van'),
    ('Crossover'),
    ('Roadster'),
    ('Liftback')
on conflict (name) do nothing;
