-- Pollería ASI - Supabase Auth profiles and initial permissions
-- Run after docs/database/001-initial-schema.sql and docs/database/002-pluma-sale-number.sql.

alter table public.app_users
add column if not exists auth_user_id uuid unique references auth.users(id) on delete set null;

alter table public.app_users
add column if not exists username text unique;

alter table public.app_users
add column if not exists can_print_tickets boolean not null default false;

alter table public.app_users
drop constraint if exists app_users_role_check;

alter table public.app_users
add constraint app_users_role_check
check (role in ('ADMIN', 'CAJERO'));

create index if not exists idx_app_users_auth_user_id
on public.app_users(auth_user_id);

create index if not exists idx_app_users_active_role
on public.app_users(active, role);

create index if not exists idx_app_users_can_print_tickets
on public.app_users(can_print_tickets);

alter table public.app_users enable row level security;
alter table public.business_settings enable row level security;
alter table public.premium_customers enable row level security;
alter table public.pluma_sales enable row level security;
alter table public.pluma_sale_cancellations enable row level security;

create or replace function public.current_app_user_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select id
  from public.app_users
  where auth_user_id = auth.uid()
    and active = true
  limit 1;
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.app_users
    where auth_user_id = auth.uid()
      and active = true
      and role = 'ADMIN'
  );
$$;

create or replace function public.can_print_tickets()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.app_users
    where auth_user_id = auth.uid()
      and active = true
      and can_print_tickets = true
  );
$$;

drop policy if exists "Users can read own profile" on public.app_users;
drop policy if exists "Admins can read users" on public.app_users;
drop policy if exists "Admins can update users" on public.app_users;

create policy "Users can read own profile"
on public.app_users
for select
to authenticated
using (auth_user_id = auth.uid());

create policy "Admins can read users"
on public.app_users
for select
to authenticated
using (public.is_admin());

create policy "Admins can update users"
on public.app_users
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Authenticated can read business settings" on public.business_settings;
drop policy if exists "Admins can update business settings" on public.business_settings;

create policy "Authenticated can read business settings"
on public.business_settings
for select
to authenticated
using (true);

create policy "Admins can update business settings"
on public.business_settings
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Authenticated can read active premium customers" on public.premium_customers;
drop policy if exists "Admins can manage premium customers" on public.premium_customers;

create policy "Authenticated can read active premium customers"
on public.premium_customers
for select
to authenticated
using (active = true or public.is_admin());

create policy "Admins can manage premium customers"
on public.premium_customers
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Authenticated can read pluma sales" on public.pluma_sales;
drop policy if exists "Authenticated can insert own pluma sales" on public.pluma_sales;
drop policy if exists "Admins can update pluma sales" on public.pluma_sales;

create policy "Authenticated can read pluma sales"
on public.pluma_sales
for select
to authenticated
using (true);

create policy "Authenticated can insert own pluma sales"
on public.pluma_sales
for insert
to authenticated
with check (cashier_user_id = public.current_app_user_id());

create policy "Admins can update pluma sales"
on public.pluma_sales
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage pluma cancellations" on public.pluma_sale_cancellations;

create policy "Admins can manage pluma cancellations"
on public.pluma_sale_cancellations
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant usage on schema public to authenticated;

grant select on public.business_settings to authenticated;
grant select on public.premium_customers to authenticated;
grant select, insert, update on public.pluma_sales to authenticated;
grant select, update on public.app_users to authenticated;
grant select, insert on public.pluma_sale_cancellations to authenticated;

grant execute on function public.current_app_user_id() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.can_print_tickets() to authenticated;

grant usage, select on sequence public.pluma_sale_number_seq to authenticated;

-- Create users in Supabase Auth manually from the dashboard.
-- Then link the real auth.users.id values to public.app_users.
-- Example only, do not run with placeholder UUID values:
--
-- update public.app_users
-- set
--   auth_user_id = '<UUID_AUTH_USER>',
--   username = 'vane',
--   role = 'CAJERO',
--   can_print_tickets = false,
--   active = true,
--   updated_at = now()
-- where email = 'vane@polleria-asi.com';
