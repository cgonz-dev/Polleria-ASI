-- Pollería ASI - Print tracking for pluma sale tickets
-- Run after docs/database/004-auth-users-permissions.sql.

alter table public.pluma_sales
add column if not exists printed_at timestamptz null;

alter table public.pluma_sales
add column if not exists printed_by_user_id uuid null
references public.app_users(id) on delete set null;

create index if not exists idx_pluma_sales_pending_print
on public.pluma_sales(created_at desc)
where status = 'COMPLETADA'
  and printed_at is null;

create index if not exists idx_pluma_sales_printed
on public.pluma_sales(printed_at desc)
where status = 'COMPLETADA'
  and printed_at is not null;

create or replace function public.mark_pluma_sale_printed(p_sale_id uuid)
returns public.pluma_sales
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_sale public.pluma_sales;
begin
  if not public.can_print_tickets() then
    raise exception 'No autorizado para imprimir tickets';
  end if;

  select public.current_app_user_id()
  into v_user_id;

  if v_user_id is null then
    raise exception 'Usuario interno no encontrado';
  end if;

  update public.pluma_sales
  set
    printed_at = coalesce(printed_at, now()),
    printed_by_user_id = coalesce(printed_by_user_id, v_user_id)
  where id = p_sale_id
    and status = 'COMPLETADA'
  returning *
  into v_sale;

  if v_sale.id is null then
    raise exception 'Venta no encontrada o no disponible para impresión';
  end if;

  return v_sale;
end;
$$;

grant execute on function public.mark_pluma_sale_printed(uuid) to authenticated;

alter table public.pluma_sales replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'pluma_sales'
  ) then
    alter publication supabase_realtime add table public.pluma_sales;
  end if;
end $$;
