-- Pollería ASI - Initial Supabase PostgreSQL schema
-- Run this file in the Supabase SQL Editor.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.business_settings (
  id uuid primary key default gen_random_uuid(),
  business_name text not null check (length(trim(business_name)) > 0),
  phone text not null check (length(trim(phone)) > 0),
  current_price_per_kg numeric(10,2) not null check (current_price_per_kg > 0),
  preparation_price_per_chicken numeric(10,2) not null default 8.00 check (preparation_price_per_chicken >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  email text unique,
  role text not null check (role in ('ADMIN', 'CAJERO')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.premium_customers (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  phone text,
  discount_per_kg numeric(10,2) not null default 0 check (discount_per_kg >= 0),
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pluma_sales (
  id uuid primary key default gen_random_uuid(),
  sale_number text unique not null check (length(trim(sale_number)) > 0),
  customer_id uuid references public.premium_customers(id) on update cascade on delete set null,
  customer_name_snapshot text,
  cashier_user_id uuid references public.app_users(id) on update cascade on delete restrict,
  chicken_quantity integer not null check (chicken_quantity > 0),
  total_weight_kg numeric(10,3) not null check (total_weight_kg > 0),
  base_price_per_kg numeric(10,2) not null check (base_price_per_kg > 0),
  discount_per_kg numeric(10,2) not null default 0 check (discount_per_kg >= 0),
  applied_price_per_kg numeric(10,2) not null check (applied_price_per_kg > 0),
  chicken_subtotal numeric(10,2) not null check (chicken_subtotal >= 0),
  preparation_unit_price numeric(10,2) not null check (preparation_unit_price >= 0),
  preparation_total numeric(10,2) not null check (preparation_total >= 0),
  grand_total numeric(10,2) not null check (grand_total >= 0),
  payment_method text not null default 'EFECTIVO' check (payment_method in ('EFECTIVO')),
  status text not null default 'COMPLETADA' check (status in ('COMPLETADA', 'CANCELADA')),
  created_at timestamptz not null default now(),
  constraint pluma_sales_applied_price_matches check (
    applied_price_per_kg = base_price_per_kg - discount_per_kg
  ),
  constraint pluma_sales_chicken_subtotal_matches check (
    chicken_subtotal = round(total_weight_kg * applied_price_per_kg, 2)
  ),
  constraint pluma_sales_preparation_total_matches check (
    preparation_total = round(chicken_quantity * preparation_unit_price, 2)
  ),
  constraint pluma_sales_grand_total_matches check (
    grand_total = chicken_subtotal + preparation_total
  )
);

create table if not exists public.pluma_sale_cancellations (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.pluma_sales(id) on update cascade on delete restrict,
  cancelled_by_user_id uuid references public.app_users(id) on update cascade on delete restrict,
  reason text not null check (length(trim(reason)) > 0),
  created_at timestamptz not null default now(),
  constraint pluma_sale_cancellations_one_per_sale unique (sale_id)
);

create or replace function public.mark_pluma_sale_cancelled()
returns trigger
language plpgsql
as $$
begin
  update public.pluma_sales
  set status = 'CANCELADA'
  where id = new.sale_id;

  return new;
end;
$$;

drop trigger if exists business_settings_set_updated_at on public.business_settings;
create trigger business_settings_set_updated_at
before update on public.business_settings
for each row execute function public.set_updated_at();

drop trigger if exists app_users_set_updated_at on public.app_users;
create trigger app_users_set_updated_at
before update on public.app_users
for each row execute function public.set_updated_at();

drop trigger if exists premium_customers_set_updated_at on public.premium_customers;
create trigger premium_customers_set_updated_at
before update on public.premium_customers
for each row execute function public.set_updated_at();

drop trigger if exists pluma_sale_cancellations_mark_sale_cancelled on public.pluma_sale_cancellations;
create trigger pluma_sale_cancellations_mark_sale_cancelled
after insert on public.pluma_sale_cancellations
for each row execute function public.mark_pluma_sale_cancelled();

create index if not exists idx_business_settings_created_at
on public.business_settings (created_at desc);

create index if not exists idx_app_users_role_active
on public.app_users (role, active);

create index if not exists idx_premium_customers_active_name
on public.premium_customers (active, name);

create index if not exists idx_pluma_sales_created_at
on public.pluma_sales (created_at desc);

create index if not exists idx_pluma_sales_cashier_user_id
on public.pluma_sales (cashier_user_id);

create index if not exists idx_pluma_sales_customer_id
on public.pluma_sales (customer_id);

create index if not exists idx_pluma_sales_status_created_at
on public.pluma_sales (status, created_at desc);

create index if not exists idx_pluma_sale_cancellations_created_at
on public.pluma_sale_cancellations (created_at desc);

insert into public.business_settings (
  business_name,
  phone,
  current_price_per_kg,
  preparation_price_per_chicken
)
select
  'Pollería ASI',
  '000-000-0000',
  48.00,
  8.00
where not exists (
  select 1 from public.business_settings
);
