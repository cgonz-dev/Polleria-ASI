-- Pollería ASI - DEV cleanup for pluma tickets/sales
--
-- WARNING:
-- This deletes all pluma sales and their cancellation records.
-- Use only for development/test data cleanup.
--
-- It does NOT delete:
-- - Supabase Auth users
-- - public.app_users
-- - public.premium_customers
-- - public.business_settings

begin;

-- Review current data before deleting.
select
  'before_cleanup' as step,
  (select count(*) from public.pluma_sales) as pluma_sales_count,
  (
    select count(*)
    from public.pluma_sale_cancellations
  ) as pluma_sale_cancellations_count;

-- Cancellations reference pluma_sales, so delete them first.
delete from public.pluma_sale_cancellations;

delete from public.pluma_sales;

-- Restart ticket numbering if the sequence exists.
do $$
begin
  if exists (
    select 1
    from pg_class
    where relkind = 'S'
      and relnamespace = 'public'::regnamespace
      and relname = 'pluma_sale_number_seq'
  ) then
    alter sequence public.pluma_sale_number_seq restart with 1;
  end if;
end $$;

-- Confirm cleanup.
select
  'after_cleanup' as step,
  (select count(*) from public.pluma_sales) as pluma_sales_count,
  (
    select count(*)
    from public.pluma_sale_cancellations
  ) as pluma_sale_cancellations_count;

commit;
