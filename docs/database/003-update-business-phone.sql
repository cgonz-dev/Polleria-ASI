-- Pollería ASI - Real business phone for ticket printing
-- Run this file after docs/database/001-initial-schema.sql.

update public.business_settings
set
  business_name = 'Pollería ASI',
  phone = '456-106-0141',
  updated_at = now()
where business_name = 'Pollería ASI';

insert into public.business_settings (
  business_name,
  phone,
  current_price_per_kg,
  preparation_price_per_chicken
)
select
  'Pollería ASI',
  '456-106-0141',
  48.00,
  8.00
where not exists (
  select 1
  from public.business_settings
  where business_name = 'Pollería ASI'
);
