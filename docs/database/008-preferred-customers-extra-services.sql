-- Pollería ASI - Preferred customers and extra services
-- Run after docs/database/007-daily-cash-closures.sql.

alter table public.business_settings
add column if not exists preferred_customer_default_price_per_kg numeric(10,2) null;

alter table public.business_settings
add column if not exists default_skinning_price_per_chicken numeric(10,2) not null default 0;

alter table public.business_settings
add column if not exists default_breast_fillet_price_per_chicken numeric(10,2) not null default 0;

update public.business_settings
set preferred_customer_default_price_per_kg = coalesce(
  preferred_customer_default_price_per_kg,
  current_price_per_kg
);

alter table public.business_settings
drop constraint if exists business_settings_preferred_customer_default_price_check;

alter table public.business_settings
add constraint business_settings_preferred_customer_default_price_check
check (
  preferred_customer_default_price_per_kg is null
  or preferred_customer_default_price_per_kg >= 0
);

alter table public.business_settings
drop constraint if exists business_settings_default_skinning_price_check;

alter table public.business_settings
add constraint business_settings_default_skinning_price_check
check (default_skinning_price_per_chicken >= 0);

alter table public.business_settings
drop constraint if exists business_settings_default_breast_fillet_price_check;

alter table public.business_settings
add constraint business_settings_default_breast_fillet_price_check
check (default_breast_fillet_price_per_chicken >= 0);

alter table public.premium_customers
add column if not exists preferred_price_per_kg numeric(10,2) null;

alter table public.premium_customers
add column if not exists skinning_price_per_chicken numeric(10,2) not null default 0;

alter table public.premium_customers
add column if not exists breast_fillet_price_per_chicken numeric(10,2) not null default 0;

update public.premium_customers pc
set preferred_price_per_kg = coalesce(
  pc.preferred_price_per_kg,
  (
    select greatest(
      bs.current_price_per_kg - coalesce(pc.discount_per_kg, 0),
      0
    )
    from public.business_settings bs
    order by bs.created_at asc
    limit 1
  ),
  0
)
where pc.preferred_price_per_kg is null;

update public.premium_customers pc
set skinning_price_per_chicken = coalesce(
  pc.skinning_price_per_chicken,
  (
    select bs.default_skinning_price_per_chicken
    from public.business_settings bs
    order by bs.created_at asc
    limit 1
  ),
  0
);

update public.premium_customers pc
set breast_fillet_price_per_chicken = coalesce(
  pc.breast_fillet_price_per_chicken,
  (
    select bs.default_breast_fillet_price_per_chicken
    from public.business_settings bs
    order by bs.created_at asc
    limit 1
  ),
  0
);

alter table public.premium_customers
alter column preferred_price_per_kg set not null;

alter table public.premium_customers
drop constraint if exists premium_customers_preferred_price_check;

alter table public.premium_customers
add constraint premium_customers_preferred_price_check
check (preferred_price_per_kg >= 0);

alter table public.premium_customers
drop constraint if exists premium_customers_skinning_price_check;

alter table public.premium_customers
add constraint premium_customers_skinning_price_check
check (skinning_price_per_chicken >= 0);

alter table public.premium_customers
drop constraint if exists premium_customers_breast_fillet_price_check;

alter table public.premium_customers
add constraint premium_customers_breast_fillet_price_check
check (breast_fillet_price_per_chicken >= 0);

alter table public.pluma_sales
add column if not exists weight_type text not null default 'PLUMA';

alter table public.pluma_sales
add column if not exists preparation_applies boolean not null default true;

alter table public.pluma_sales
add column if not exists skinning_requested boolean not null default false;

alter table public.pluma_sales
add column if not exists skinning_unit_price numeric(10,2) not null default 0;

alter table public.pluma_sales
add column if not exists skinning_total numeric(10,2) not null default 0;

alter table public.pluma_sales
add column if not exists breast_fillet_requested boolean not null default false;

alter table public.pluma_sales
add column if not exists breast_fillet_unit_price numeric(10,2) not null default 0;

alter table public.pluma_sales
add column if not exists breast_fillet_total numeric(10,2) not null default 0;

alter table public.pluma_sales
add column if not exists extra_services_total numeric(10,2) not null default 0;

alter table public.pluma_sales
drop constraint if exists pluma_sales_applied_price_matches;

alter table public.pluma_sales
drop constraint if exists pluma_sales_grand_total_matches;

alter table public.pluma_sales
drop constraint if exists pluma_sales_weight_type_check;

alter table public.pluma_sales
add constraint pluma_sales_weight_type_check
check (weight_type in ('PLUMA', 'PELADO'));

alter table public.pluma_sales
drop constraint if exists pluma_sales_weight_preparation_mode_check;

alter table public.pluma_sales
add constraint pluma_sales_weight_preparation_mode_check
check (
  (weight_type = 'PLUMA' and preparation_applies = true)
  or (weight_type = 'PELADO' and preparation_applies = false)
);

alter table public.pluma_sales
drop constraint if exists pluma_sales_extra_prices_check;

alter table public.pluma_sales
add constraint pluma_sales_extra_prices_check
check (
  skinning_unit_price >= 0
  and skinning_total >= 0
  and breast_fillet_unit_price >= 0
  and breast_fillet_total >= 0
  and extra_services_total >= 0
);

alter table public.pluma_sales
drop constraint if exists pluma_sales_extra_totals_match;

alter table public.pluma_sales
add constraint pluma_sales_extra_totals_match
check (
  skinning_total = case
    when skinning_requested then round(chicken_quantity * skinning_unit_price, 2)
    else 0
  end
  and breast_fillet_total = case
    when breast_fillet_requested then round(chicken_quantity * breast_fillet_unit_price, 2)
    else 0
  end
  and extra_services_total = skinning_total + breast_fillet_total
);

alter table public.pluma_sales
add constraint pluma_sales_grand_total_matches
check (grand_total = chicken_subtotal + preparation_total + extra_services_total);

alter table public.daily_cash_closures
add column if not exists skinning_total numeric(10,2) not null default 0;

alter table public.daily_cash_closures
add column if not exists breast_fillet_total numeric(10,2) not null default 0;

alter table public.daily_cash_closures
add column if not exists extra_services_total numeric(10,2) not null default 0;

create or replace function public.close_daily_cash_closure(
  p_business_date date,
  p_counted_cash_total numeric,
  p_notes text default null
)
returns public.daily_cash_closures
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_result public.daily_cash_closures;
  v_start timestamptz;
  v_end timestamptz;
begin
  if not public.is_admin() then
    raise exception 'No autorizado para cerrar corte';
  end if;

  if p_counted_cash_total < 0 then
    raise exception 'El efectivo contado no puede ser negativo';
  end if;

  select public.current_app_user_id()
  into v_user_id;

  if v_user_id is null then
    raise exception 'Usuario interno no encontrado';
  end if;

  v_start := (p_business_date::timestamp at time zone 'America/Mexico_City');
  v_end := ((p_business_date + interval '1 day')::timestamp at time zone 'America/Mexico_City');

  insert into public.daily_cash_closures (
    business_date,
    expected_cash_total,
    counted_cash_total,
    cash_difference,
    sales_count,
    total_chickens,
    total_weight_kg,
    chicken_subtotal,
    preparation_total,
    skinning_total,
    breast_fillet_total,
    extra_services_total,
    grand_total,
    pending_print_count,
    printed_count,
    closed_by_user_id,
    notes
  )
  select
    p_business_date,
    coalesce(sum(ps.grand_total), 0)::numeric(10,2) as expected_cash_total,
    p_counted_cash_total::numeric(10,2) as counted_cash_total,
    (p_counted_cash_total - coalesce(sum(ps.grand_total), 0))::numeric(10,2) as cash_difference,
    count(ps.id)::integer as sales_count,
    coalesce(sum(ps.chicken_quantity), 0)::integer as total_chickens,
    coalesce(sum(ps.total_weight_kg), 0)::numeric(10,3) as total_weight_kg,
    coalesce(sum(ps.chicken_subtotal), 0)::numeric(10,2) as chicken_subtotal,
    coalesce(sum(ps.preparation_total), 0)::numeric(10,2) as preparation_total,
    coalesce(sum(ps.skinning_total), 0)::numeric(10,2) as skinning_total,
    coalesce(sum(ps.breast_fillet_total), 0)::numeric(10,2) as breast_fillet_total,
    coalesce(sum(ps.extra_services_total), 0)::numeric(10,2) as extra_services_total,
    coalesce(sum(ps.grand_total), 0)::numeric(10,2) as grand_total,
    count(ps.id) filter (where ps.printed_at is null)::integer as pending_print_count,
    count(ps.id) filter (where ps.printed_at is not null)::integer as printed_count,
    v_user_id,
    nullif(trim(p_notes), '')
  from public.pluma_sales ps
  where ps.status = 'COMPLETADA'
    and ps.created_at >= v_start
    and ps.created_at < v_end
  on conflict (business_date) do update set
    expected_cash_total = excluded.expected_cash_total,
    counted_cash_total = excluded.counted_cash_total,
    cash_difference = excluded.cash_difference,
    sales_count = excluded.sales_count,
    total_chickens = excluded.total_chickens,
    total_weight_kg = excluded.total_weight_kg,
    chicken_subtotal = excluded.chicken_subtotal,
    preparation_total = excluded.preparation_total,
    skinning_total = excluded.skinning_total,
    breast_fillet_total = excluded.breast_fillet_total,
    extra_services_total = excluded.extra_services_total,
    grand_total = excluded.grand_total,
    pending_print_count = excluded.pending_print_count,
    printed_count = excluded.printed_count,
    closed_by_user_id = excluded.closed_by_user_id,
    notes = excluded.notes,
    updated_at = now()
  returning *
  into v_result;

  return v_result;
end;
$$;
