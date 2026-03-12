-- Add carfax_url, cargurus_url, vin, and warranty (yes/no) to cars table.
-- All new columns are nullable for safe migration on existing data.

alter table public.cars
    add column if not exists carfax_url text,
    add column if not exists cargurus_url text,
    add column if not exists vin text,
    add column if not exists warranty boolean;
