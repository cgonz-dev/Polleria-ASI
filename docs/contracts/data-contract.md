# Contrato de Datos - Pollería ASI

Este contrato describe el modelo inicial de datos para Supabase PostgreSQL, autenticación con Supabase Auth, perfiles internos y permisos básicos del MVP.

## Decisiones principales

- El sistema guarda snapshots de precio, descuento y cliente en cada venta para que el historial no cambie si después se actualiza la configuración o el cliente premium.
- El cliente premium no tiene precio fijo. Solo guarda un descuento por kilo.
- El primer método de pago permitido es `EFECTIVO`.
- Los roles iniciales del sistema son `ADMIN` y `CAJERO`.
- Las ventas no se borran físicamente. Para cancelar se registra una razón y la venta pasa a `CANCELADA`.
- El modelo soporta varios cajeros y varios dispositivos conectados a la misma base de datos.
- `sale_number` se genera automáticamente en PostgreSQL con formato `PL-000001`.
- El frontend no debe enviar `sale_number`; debe recibirlo desde Supabase después del insert.
- El login usa Supabase Auth con email y contraseña. El perfil operativo vive en `public.app_users`.
- Cada venta en pluma queda asociada al usuario autenticado mediante `cashier_user_id`.
- El permiso `can_print_tickets` controla si el usuario puede usar el botón de impresión.
- La impresión se rastrea en `pluma_sales` con `printed_at` y `printed_by_user_id`.
- `printed_at is null` significa ticket pendiente de imprimir.
- `printed_at is not null` significa ticket marcado como impreso.
- El corte del día guarda snapshots en `daily_cash_closures`.
- Solo ventas `COMPLETADA` cuentan para el corte.
- El corte usa el día local de México en zona `America/Mexico_City`.
- El ticket imprimible usa datos persistidos de `pluma_sales`, no datos temporales del formulario.
- El teléfono impreso sale de `business_settings.phone`.
- La impresión actual usa el diálogo del navegador; QZ Tray queda como mejora futura.
- El ticket para cliente final no muestra cajero, tipo de cliente, descuento, precio base, etiqueta técnica de precio aplicado ni forma de pago.

## business_settings

Configuración general de la pollería.

| Campo | Tipo | Regla |
| --- | --- | --- |
| `id` | `uuid` | Primary key, default `gen_random_uuid()` |
| `business_name` | `text` | Requerido |
| `phone` | `text` | Requerido |
| `current_price_per_kg` | `numeric(10,2)` | Requerido, mayor a 0 |
| `preparation_price_per_chicken` | `numeric(10,2)` | Requerido, default `8.00`, no negativo |
| `created_at` | `timestamptz` | Requerido, default `now()` |
| `updated_at` | `timestamptz` | Requerido, default `now()`, se actualiza por trigger |

Debe existir al menos un registro. El script inicial crea uno con:

```txt
business_name = Pollería ASI
phone = 000-000-0000
current_price_per_kg = 48.00
preparation_price_per_chicken = 8.00
```

## app_users

Usuarios internos para asociar operaciones a cajeros o administradores. Cada registro puede vincularse con un usuario real de Supabase Auth mediante `auth_user_id`.

| Campo | Tipo | Regla |
| --- | --- | --- |
| `id` | `uuid` | Primary key, default `gen_random_uuid()` |
| `auth_user_id` | `uuid` | Opcional, único, referencia `auth.users(id)` |
| `name` | `text` | Requerido |
| `email` | `text` | Opcional, único |
| `username` | `text` | Opcional, único |
| `role` | `text` | Requerido, solo `ADMIN` o `CAJERO` |
| `active` | `boolean` | Requerido, default `true` |
| `can_print_tickets` | `boolean` | Requerido, default `false` |
| `created_at` | `timestamptz` | Requerido, default `now()` |
| `updated_at` | `timestamptz` | Requerido, default `now()`, se actualiza por trigger |

Los usuarios se crean manualmente en Supabase Auth durante esta etapa. La pantalla `/admin/usuarios` solo administra el perfil interno: rol, activo y permiso de impresión.

## premium_customers

Clientes premium con descuento por kilo.

| Campo | Tipo | Regla |
| --- | --- | --- |
| `id` | `uuid` | Primary key, default `gen_random_uuid()` |
| `name` | `text` | Requerido |
| `phone` | `text` | Opcional |
| `discount_per_kg` | `numeric(10,2)` | Requerido, default `0`, no negativo |
| `active` | `boolean` | Requerido, default `true` |
| `notes` | `text` | Opcional |
| `created_at` | `timestamptz` | Requerido, default `now()` |
| `updated_at` | `timestamptz` | Requerido, default `now()`, se actualiza por trigger |

Regla de precio premium:

```txt
precio_aplicado = precio_actual_general - descuento_por_kg
```

Ejemplo:

```txt
Precio general: 48.00
Descuento cliente premium: 3.00
Precio aplicado: 45.00
```

## pluma_sales

Ventas de pollo en pluma.

| Campo | Tipo | Regla |
| --- | --- | --- |
| `id` | `uuid` | Primary key, default `gen_random_uuid()` |
| `sale_number` | `text` | Requerido, único |
| `customer_id` | `uuid` | Opcional, referencia `premium_customers(id)` |
| `customer_name_snapshot` | `text` | Snapshot opcional del nombre del cliente |
| `cashier_user_id` | `uuid` | Opcional, referencia `app_users(id)` |
| `chicken_quantity` | `integer` | Requerido, mayor a 0 |
| `total_weight_kg` | `numeric(10,3)` | Requerido, mayor a 0 |
| `base_price_per_kg` | `numeric(10,2)` | Requerido, mayor a 0 |
| `discount_per_kg` | `numeric(10,2)` | Requerido, default `0`, no negativo |
| `applied_price_per_kg` | `numeric(10,2)` | Requerido, mayor a 0 |
| `chicken_subtotal` | `numeric(10,2)` | Requerido, calculado |
| `preparation_unit_price` | `numeric(10,2)` | Requerido, no negativo |
| `preparation_total` | `numeric(10,2)` | Requerido, calculado |
| `grand_total` | `numeric(10,2)` | Requerido, calculado |
| `payment_method` | `text` | Requerido, default `EFECTIVO` |
| `printed_at` | `timestamptz` | Opcional, null mientras el ticket está pendiente |
| `printed_by_user_id` | `uuid` | Opcional, referencia `app_users(id)` |
| `status` | `text` | Requerido, default `COMPLETADA` |
| `created_at` | `timestamptz` | Requerido, default `now()` |

Regla de numeración:

```txt
sale_number = PL-000001, PL-000002, PL-000003...
```

La migración `docs/database/002-pluma-sale-number.sql` crea:

- `public.pluma_sale_number_seq`
- `public.generate_pluma_sale_number()`
- Default de `pluma_sales.sale_number`

El frontend no debe enviar `sale_number`, `id` ni `created_at` al registrar venta.

Reglas de cálculo:

```txt
precio_aplicado = precio_base_por_kg - descuento_por_kg
subtotal_pollo = peso_total_kg * precio_aplicado
preparacion = cantidad_pollos * precio_preparacion_unitario
total = subtotal_pollo + preparacion
```

Con los nombres de columnas:

```txt
applied_price_per_kg = base_price_per_kg - discount_per_kg
chicken_subtotal = total_weight_kg * applied_price_per_kg
preparation_total = chicken_quantity * preparation_unit_price
grand_total = chicken_subtotal + preparation_total
```

Reglas de redondeo:

- Pesos mexicanos: 2 decimales.
- Peso total en kg: 3 decimales.
- Cantidad de pollos: entero.
- El frontend usa los mismos redondeos antes de guardar para evitar diferencias de centavos con los checks de base de datos.

Flujo desde pantalla de Venta en Pluma:

1. Validar sesión activa con Supabase Auth.
2. Cargar el perfil interno activo desde `app_users`.
3. Cargar `business_settings` y clientes premium activos.
4. Elegir público general o cliente premium.
5. Capturar cantidad de pollos y peso total.
6. Calcular importes en frontend.
7. Insertar venta en `pluma_sales` con `cashier_user_id` del usuario autenticado y sin enviar `sale_number`.
8. Mostrar el `sale_number` devuelto por Supabase.
9. Abrir modal de ticket imprimible.
10. Si el usuario tiene `can_print_tickets`, imprimir con el navegador y después marcar como impreso.
11. Si no se marca como impreso, la venta sigue en tickets pendientes.
12. Si el usuario no puede imprimir, mostrar aviso para imprimir desde la PC de caja.
13. Iniciar nueva venta y limpiar captura.

Para público general:

```txt
customer_id = null
customer_name_snapshot = Público general
discount_per_kg = 0
```

Para cliente premium:

```txt
customer_id = id del cliente premium
customer_name_snapshot = nombre del cliente premium
discount_per_kg = discount_per_kg del cliente premium
```

Estados permitidos:

- `COMPLETADA`
- `CANCELADA`

Métodos de pago permitidos:

- `EFECTIVO`

## Ticket imprimible

El ticket de Venta en Pluma se muestra después de guardar correctamente una venta.

Características:

- Tamaño objetivo: 80mm.
- Blanco y negro para impresión térmica.
- Usa `sale_number` generado por base de datos.
- Usa datos guardados en `pluma_sales`, pero solo muestra información útil para el cliente final.
- Usa `business_settings.phone`; la migración `docs/database/003-update-business-phone.sql` actualiza el teléfono a `456-106-0141`.
- Si `business_settings.phone` todavía contiene el valor temporal `000-000-0000`, la UI del ticket usa `456-106-0141`.
- El encabezado del ticket siempre debe iniciar con `POLLERÍA ASI` y `Tel: 456-106-0141`.
- Muestra `Precio por kg` usando `applied_price_per_kg`, que ya incluye cualquier descuento premium.
- Muestra `Pollo en pluma` usando `chicken_subtotal`.
- Muestra preparación como sección: `Preparación:` y debajo `cantidad pollos x precio_unitario` alineado con `preparation_total`.
- La impresión actual usa `window.print()` y CSS `@media print` para mostrar solo el ticket.
- La impresión directa/silenciosa con QZ Tray queda fuera de alcance.
- El botón `Imprimir ticket` solo aparece para usuarios con `app_users.can_print_tickets = true`.
- Si el usuario no puede imprimir, el modal muestra: `Ticket registrado. Imprime desde la PC de caja.`
- El botón `Marcar como impreso` solo aparece para usuarios con `app_users.can_print_tickets = true`.
- Marcar como impreso se hace con RPC, no con update directo desde frontend.

El ticket no debe mostrar:

- Cajero.
- Tipo de cliente.
- Precio base.
- Descuento.
- Etiqueta `Precio aplicado`.
- Pago.
- `Cliente: Público general`.

Si existe un nombre real de cliente premium, el ticket puede mostrar `Cliente: Nombre`, sin indicar que es premium ni mostrar descuento.

## Tickets pendientes por imprimir

La ruta `/caja/tickets-pendientes` muestra ventas completadas que todavía no tienen ticket impreso.

Consulta base de pendientes:

```sql
select *
from public.pluma_sales
where status = 'COMPLETADA'
  and printed_at is null
order by created_at desc;
```

Consulta base de últimos impresos:

```sql
select *
from public.pluma_sales
where status = 'COMPLETADA'
  and printed_at is not null
order by printed_at desc
limit 20;
```

Reglas:

- Usuarios sin `can_print_tickets` pueden ver tickets pendientes e impresos en modo lectura.
- Usuarios sin `can_print_tickets` no pueden imprimir, marcar impreso ni reimprimir.
- Usuarios con `can_print_tickets` pueden imprimir, marcar impreso y reimprimir.
- Reimprimir no cambia `printed_at`.
- No se usa detección de celular/PC como regla de seguridad.

RPC para marcar impreso:

```txt
public.mark_pluma_sale_printed(p_sale_id uuid)
```

La función valida:

```txt
public.can_print_tickets()
```

Si el ticket ya está impreso, no sobrescribe `printed_at` ni `printed_by_user_id`.

Supabase Realtime está habilitado para `public.pluma_sales`. La bandeja escucha cambios de `INSERT` y `UPDATE` para refrescar pendientes, últimos impresos y contador.

## daily_cash_closures

Registro histórico de cierres diarios de caja.

| Campo | Tipo | Regla |
| --- | --- | --- |
| `id` | `uuid` | Primary key, default `gen_random_uuid()` |
| `business_date` | `date` | Fecha local de negocio, única |
| `expected_cash_total` | `numeric(10,2)` | Total esperado según ventas completadas |
| `counted_cash_total` | `numeric(10,2)` | Efectivo contado físicamente |
| `cash_difference` | `numeric(10,2)` | `counted_cash_total - expected_cash_total` |
| `sales_count` | `integer` | Ventas completadas consideradas |
| `total_chickens` | `integer` | Pollos vendidos |
| `total_weight_kg` | `numeric(10,3)` | Kilos vendidos |
| `chicken_subtotal` | `numeric(10,2)` | Subtotal de pollo |
| `preparation_total` | `numeric(10,2)` | Total de preparación |
| `grand_total` | `numeric(10,2)` | Total vendido |
| `pending_print_count` | `integer` | Tickets completados sin imprimir |
| `printed_count` | `integer` | Tickets marcados como impresos |
| `closed_by_user_id` | `uuid` | Referencia `app_users(id)` |
| `notes` | `text` | Opcional |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Default `now()`, se actualiza por trigger |

Reglas:

- Solo puede existir un cierre por `business_date`.
- Usuarios autenticados pueden leer cierres.
- Solo `ADMIN` puede cerrar o actualizar corte.
- Cerrar corte no modifica ventas.
- Cerrar corte no marca tickets como impresos.
- Si entran ventas después del cierre, el resumen vivo cambia y el cierre queda como snapshot hasta que un `ADMIN` lo actualice.

RPC para cerrar corte:

```txt
public.close_daily_cash_closure(p_business_date date, p_counted_cash_total numeric, p_notes text)
```

El frontend solo envía fecha, efectivo contado y notas. La base calcula:

```txt
expected_cash_total
sales_count
total_chickens
total_weight_kg
chicken_subtotal
preparation_total
grand_total
pending_print_count
printed_count
cash_difference
```

El rango de fecha se calcula en horario:

```txt
America/Mexico_City
```

## pluma_sale_cancellations

Registro de cancelaciones de ventas.

| Campo | Tipo | Regla |
| --- | --- | --- |
| `id` | `uuid` | Primary key, default `gen_random_uuid()` |
| `sale_id` | `uuid` | Requerido, referencia `pluma_sales(id)` |
| `cancelled_by_user_id` | `uuid` | Opcional, referencia `app_users(id)` |
| `reason` | `text` | Requerido |
| `created_at` | `timestamptz` | Requerido, default `now()` |

Reglas:

- Solo se permite una cancelación por venta.
- Al insertar una cancelación, un trigger actualiza `pluma_sales.status` a `CANCELADA`.
- La venta original permanece en `pluma_sales`.

## Índices iniciales

- `business_settings.created_at`
- `app_users.role, app_users.active`
- `premium_customers.active, premium_customers.name`
- `pluma_sales.created_at`
- `pluma_sales.cashier_user_id`
- `pluma_sales.customer_id`
- `pluma_sales.status, pluma_sales.created_at`
- `pluma_sale_cancellations.created_at`
