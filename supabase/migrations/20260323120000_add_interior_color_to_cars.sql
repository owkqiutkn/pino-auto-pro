-- Interior color uses the same canonical values as exterior (public.exterior_colors), stored as text like exterior_color.
alter table public.cars
    add column if not exists interior_color text;
