-- Pollería ASI - Daily cash closures
-- Run after docs/database/006-print-tracking-pluma-sales.sql.

create table if not exists public.daily_cash_closures (
  id uuid primary key default gen_random_uuid(),
  business_date date not null unique,
  expected_cash_total numeric(10,2) not null,
  counted_cash_total numeric(10,2) not null,
  cash_difference numeric(10,2) not null,
  sales_count integer not null,
  total_chickens integer not null,
  total_weight_kg numeric(10,3) not null,
  chicken_subtotal numeric(10,2) not null,
  preparation_total numeric(10,2) not null,
  grand_total numeric(10,2) not null,
  pending_print_count integer not null,
  printed_count integer not null,
  closed_by_user_id uuid not null references public.app_users(id),
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_daily_cash_closures_business_date
on public.daily_cash_closures(business_date desc);

create index if not exists idx_daily_cash_closures_closed_by
on public.daily_cash_closures(closed_by_user_id);

drop trigger if exists daily_cash_closures_set_updated_at
on public.daily_cash_closures;

create trigger daily_cash_closures_set_updated_at
before update on public.daily_cash_closures
for each row execute function public.set_updated_at();

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

alter table public.daily_cash_closures enable row level security;

drop policy if exists "Authenticated can read daily cash closures"
on public.daily_cash_closures;

drop policy if exists "Admins can manage daily cash closures"
on public.daily_cash_closures;

create policy "Authenticated can read daily cash closures"
on public.daily_cash_closures
for select
to authenticated
using (true);

create policy "Admins can manage daily cash closures"
on public.daily_cash_closures
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant select on public.daily_cash_closures to authenticated;
grant insert, update on public.daily_cash_closures to authenticated;
grant execute on function public.close_daily_cash_closure(date, numeric, text)
to authenticated;
