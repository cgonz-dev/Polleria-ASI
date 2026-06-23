# Contexto reciente - Pollería ASI

Este documento resume los últimos cambios implementados en el sistema **Pollería ASI** para dar contexto a otra conversación o a ChatGPT.

## Estado general del proyecto

El proyecto es una app web en **Next.js con App Router**, TypeScript, Tailwind CSS, shadcn/ui y Supabase.

El primer módulo funcional es:

```txt
/ventas/pluma
```

Ese módulo permite registrar ventas de pollo en pluma, calcular importes, guardar la venta en Supabase y mostrar un ticket imprimible.

## Login y permisos

Se implementó login con **Supabase Auth** usando email y contraseña.

Cada usuario autenticado debe tener un perfil interno en:

```txt
public.app_users
```

La relación se hace con:

```txt
app_users.auth_user_id = auth.users.id
```

La app ya cuenta con:

- Ruta `/login`.
- Contexto global de autenticación.
- Rutas internas protegidas.
- Menú que respeta permisos.
- Rutas `/admin/*` restringidas a usuarios `ADMIN`.
- Botón de cerrar sesión.
- Usuario visible en el layout.

## Usuarios iniciales indispensables

Se creó el script:

```txt
docs/database/005-seed-initial-users.sql
```

Antes de ejecutarlo, se deben crear manualmente estos usuarios en Supabase Auth:

```txt
vane@polleria-asi.com
lupita@polleria-asi.com
adan_jr@polleria-asi.com
arturo_cajero@polleria-asi.com
pc_caja@polleria-asi.com
```

Después se ejecuta `005-seed-initial-users.sql` para vincularlos con `public.app_users`.

Quedan configurados así:

```txt
vane            ADMIN, puede capturar ventas, no imprime
lupita          ADMIN, puede capturar ventas, no imprime
adan_jr         ADMIN, puede capturar ventas, no imprime
arturo_cajero   ADMIN, puede capturar ventas, no imprime
pc_caja         ADMIN, puede capturar ventas, sí imprime tickets
```

En esta etapa, `ADMIN` también puede operar como cajero. Por eso los usuarios que son “cajero y admin” quedaron con rol `ADMIN`.

## Permiso de impresión

La impresión se controla con:

```txt
app_users.can_print_tickets
```

Regla actual:

- Si `can_print_tickets = true`, el usuario ve el botón **Imprimir ticket**.
- Si `can_print_tickets = false`, el usuario puede registrar la venta y ver el ticket en pantalla, pero no puede imprimirlo.

Mensaje visible para usuarios sin permiso de impresión:

```txt
Ticket registrado. Imprime desde la PC de caja.
```

Esto permite que cajeros/admins vean el ticket sin imprimir, y que solo la PC de caja imprima.

## Venta en Pluma

La pantalla `/ventas/pluma` ya no usa selector manual de cajero.

Ahora la venta se guarda con el usuario autenticado:

```txt
pluma_sales.cashier_user_id = app_users.id del usuario actual
```

La pantalla muestra un bloque:

```txt
Atiende: nombre del usuario autenticado
```

## Ticket

El ticket:

- Se muestra después de guardar una venta.
- Usa el número de venta generado por Supabase/PostgreSQL.
- Está pensado para impresión de 80mm.
- No muestra datos internos como cajero, tipo de cliente, descuento, precio base o forma de pago.
- Solo muestra botón de impresión si el usuario tiene permiso.

## Logo

El archivo del logo existe en:

```txt
public/brand/logo-asi.png
```

Se corrigió la pantalla de login para que ya no muestre solo el texto `ASI`, sino el logo real usando:

```txt
/brand/logo-asi.png
```

Si el logo no carga, conserva `ASI` como fallback.

## Corrección del seed

El primer script `005-seed-initial-users.sql` usaba una tabla temporal y falló en Supabase SQL Editor con:

```txt
relation "initial_polleria_asi_users" does not exist
```

Se corrigió el script para no usar tablas temporales. Ahora usa CTEs (`with initial_users as (...)`) para funcionar de forma confiable en Supabase SQL Editor.

## Vista de tickets pendientes por imprimir

La vista de tickets pendientes ya quedó implementada en:

```txt
/caja/tickets-pendientes
```

También se agregó la migración:

```txt
docs/database/006-print-tracking-pluma-sales.sql
```

La vista muestra:

- Tickets pendientes por imprimir.
- Últimos tickets impresos.
- Contador de pendientes.
- Realtime con Supabase para nuevos tickets y tickets marcados como impresos.
- Acción de imprimir y marcar impreso solo para usuarios con `can_print_tickets = true`.

Se agregaron a `pluma_sales`:

```txt
printed_at timestamptz null
printed_by_user_id uuid null references public.app_users(id)
```

Así `pc_caja` consulta ventas con:

```txt
printed_at is null
```

Y las marca como impresas después de imprimir el ticket usando el RPC:

```txt
public.mark_pluma_sale_printed(p_sale_id uuid)
```
