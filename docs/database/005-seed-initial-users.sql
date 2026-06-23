-- Pollería ASI - Initial app users
-- Run after docs/database/004-auth-users-permissions.sql.
--
-- First create these users manually in Supabase Auth:
--
--   vane@polleria-asi.com
--   lupita@polleria-asi.com
--   adan_jr@polleria-asi.com
--   arturo_cajero@polleria-asi.com
--   pc_caja@polleria-asi.com
--
-- This script links those Auth users to public.app_users.
-- "Admin y cajero" is represented as role = 'ADMIN', because ADMIN can also
-- capture sales. Only pc_caja can print tickets.
--
-- The script intentionally avoids temporary tables so it works reliably in
-- the Supabase SQL Editor.

with initial_users (
  username,
  name,
  email,
  role,
  can_print_tickets
) as (
  values
    ('vane', 'Vane', 'vane@polleria-asi.com', 'ADMIN', false),
    ('lupita', 'Lupita', 'lupita@polleria-asi.com', 'ADMIN', false),
    ('adan_jr', 'Adan Jr', 'adan_jr@polleria-asi.com', 'ADMIN', false),
    (
      'arturo_cajero',
      'Arturo Cajero',
      'arturo_cajero@polleria-asi.com',
      'ADMIN',
      false
    ),
    ('pc_caja', 'PC Caja', 'pc_caja@polleria-asi.com', 'ADMIN', true)
)
insert into public.app_users (
  auth_user_id,
  name,
  email,
  username,
  role,
  active,
  can_print_tickets
)
select
  auth_user.id,
  initial_user.name,
  initial_user.email,
  initial_user.username,
  initial_user.role,
  true,
  initial_user.can_print_tickets
from initial_users as initial_user
join auth.users as auth_user
  on lower(auth_user.email) = lower(initial_user.email)
on conflict (email) do update
set
  auth_user_id = excluded.auth_user_id,
  name = excluded.name,
  username = excluded.username,
  role = excluded.role,
  active = excluded.active,
  can_print_tickets = excluded.can_print_tickets,
  updated_at = now();

-- If this returns rows, those accounts still need to be created in Supabase Auth.
with initial_users (
  username,
  name,
  email,
  role,
  can_print_tickets
) as (
  values
    ('vane', 'Vane', 'vane@polleria-asi.com', 'ADMIN', false),
    ('lupita', 'Lupita', 'lupita@polleria-asi.com', 'ADMIN', false),
    ('adan_jr', 'Adan Jr', 'adan_jr@polleria-asi.com', 'ADMIN', false),
    (
      'arturo_cajero',
      'Arturo Cajero',
      'arturo_cajero@polleria-asi.com',
      'ADMIN',
      false
    ),
    ('pc_caja', 'PC Caja', 'pc_caja@polleria-asi.com', 'ADMIN', true)
)
select
  'Falta crear este usuario en Supabase Auth' as pendiente,
  initial_user.email
from initial_users as initial_user
left join auth.users as auth_user
  on lower(auth_user.email) = lower(initial_user.email)
where auth_user.id is null
order by initial_user.email;

-- Review the linked app profiles.
select
  username,
  name,
  email,
  role,
  active,
  can_print_tickets,
  auth_user_id is not null as linked_to_auth
from public.app_users
where username in (
  'vane',
  'lupita',
  'adan_jr',
  'arturo_cajero',
  'pc_caja'
)
order by username;
