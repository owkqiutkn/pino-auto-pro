alter table public.cars
add column if not exists featured boolean not null default false;

create index if not exists cars_featured_idx on public.cars using btree (featured);
