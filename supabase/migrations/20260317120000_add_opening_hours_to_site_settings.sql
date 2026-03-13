-- Add opening_hours to site_settings for configurable business hours
-- JSONB structure: { "monday": { "open": "09:00", "close": "17:00" }, "tuesday": { "closed": true }, ... }
alter table public.site_settings
add column if not exists opening_hours jsonb;
