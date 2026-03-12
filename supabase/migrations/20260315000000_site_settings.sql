-- Singleton table for site-wide settings (logo, social URLs)
create table public.site_settings (
    id text not null default 'default',
    logo_light text,
    logo_dark text,
    instagram_url text,
    facebook_url text,
    twitter_url text,
    updated_at timestamptz not null default now(),
    constraint site_settings_pkey primary key (id)
);

alter table public.site_settings enable row level security;

grant select on table public.site_settings to anon;
grant select on table public.site_settings to authenticated;
grant update on table public.site_settings to authenticated;

create policy "Public can view site settings"
on public.site_settings
as permissive
for select
to public
using (true);

create policy "Authenticated can update site settings"
on public.site_settings
as permissive
for update
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

-- Seed single row with default/empty values
insert into public.site_settings (id, logo_light, logo_dark, instagram_url, facebook_url, twitter_url)
values ('default', null, null, null, null, null)
on conflict (id) do nothing;
