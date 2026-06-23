-- Pollería ASI - Automatic sale number for pluma sales
-- Run this file after docs/database/001-initial-schema.sql.

create sequence if not exists public.pluma_sale_number_seq start 1;

create or replace function public.generate_pluma_sale_number()
returns text
language sql
as $$
  select 'PL-' || lpad(nextval('public.pluma_sale_number_seq')::text, 6, '0');
$$;

do $$
declare
  max_sale_number bigint;
begin
  select max(substring(sale_number from 'PL-([0-9]+)')::bigint)
  into max_sale_number
  from public.pluma_sales
  where sale_number ~ '^PL-[0-9]+$';

  if max_sale_number is null or max_sale_number < 1 then
    perform setval('public.pluma_sale_number_seq', 1, false);
  else
    perform setval('public.pluma_sale_number_seq', max_sale_number, true);
  end if;
end $$;

alter table public.pluma_sales
alter column sale_number set default public.generate_pluma_sale_number();
