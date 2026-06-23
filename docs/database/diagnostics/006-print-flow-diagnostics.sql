-- Pollería ASI - Diagnostics for pending print flow
-- Use this in Supabase SQL Editor if tickets do not appear in /caja/tickets-pendientes.

-- 1) Confirm print tracking columns exist.
select
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'pluma_sales'
  and column_name in ('printed_at', 'printed_by_user_id')
order by column_name;

-- 2) Confirm the RPC exists.
select
  routine_name,
  routine_type
from information_schema.routines
where routine_schema = 'public'
  and routine_name = 'mark_pluma_sale_printed';

-- 3) Confirm Vane exists in Auth and is linked to app_users.
select
  app_user.id as app_user_id,
  app_user.auth_user_id,
  app_user.name,
  app_user.email,
  app_user.username,
  app_user.role,
  app_user.active,
  app_user.can_print_tickets,
  auth_user.id is not null as exists_in_auth
from public.app_users as app_user
left join auth.users as auth_user
  on auth_user.id = app_user.auth_user_id
where lower(app_user.email) = 'vane@polleria-asi.com';

-- 4) Latest sales registered by Vane.
select
  sale.sale_number,
  sale.status,
  sale.created_at,
  to_jsonb(sale) ->> 'printed_at' as printed_at,
  to_jsonb(sale) ->> 'printed_by_user_id' as printed_by_user_id,
  sale.grand_total,
  app_user.name as cashier_name,
  app_user.email as cashier_email
from public.pluma_sales as sale
join public.app_users as app_user
  on app_user.id = sale.cashier_user_id
where lower(app_user.email) = 'vane@polleria-asi.com'
order by sale.created_at desc
limit 10;

-- 5) Tickets that should appear in pending list.
-- This query works before and after migration 006. If printed_at does not
-- exist yet, it treats all completed sales as pending for diagnosis.
select
  sale.sale_number,
  sale.status,
  sale.created_at,
  to_jsonb(sale) ->> 'printed_at' as printed_at,
  sale.grand_total,
  app_user.name as cashier_name,
  app_user.email as cashier_email
from public.pluma_sales as sale
left join public.app_users as app_user
  on app_user.id = sale.cashier_user_id
where sale.status = 'COMPLETADA'
  and coalesce(to_jsonb(sale) ->> 'printed_at', '') = ''
order by sale.created_at desc
limit 20;

-- 6) Last printed tickets. Vane should not create rows here unless pc_caja
-- marked them as printed later.
select
  sale.sale_number,
  sale.status,
  sale.created_at,
  to_jsonb(sale) ->> 'printed_at' as printed_at,
  sale.grand_total,
  printed_by.name as printed_by_name,
  printed_by.email as printed_by_email
from public.pluma_sales as sale
left join public.app_users as printed_by
  on printed_by.id::text = to_jsonb(sale) ->> 'printed_by_user_id'
where sale.status = 'COMPLETADA'
  and coalesce(to_jsonb(sale) ->> 'printed_at', '') <> ''
order by to_jsonb(sale) ->> 'printed_at' desc
limit 20;
