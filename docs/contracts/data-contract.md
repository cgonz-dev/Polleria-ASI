# Contrato de Datos - Pollería ASI

Este contrato describe el modelo actual para Supabase PostgreSQL, autenticación, ventas en pluma, Clientes Preferenciales, tickets y corte del día.

## Decisiones principales

- El nombre de negocio es **Clientes Preferenciales**.
- No se usa el término proveedor para este módulo.
- La tabla física `premium_customers` se conserva por compatibilidad técnica, pero la UI y documentación de producto usan Clientes Preferenciales.
- `discount_per_kg` queda deprecado; la lógica nueva usa `preferred_price_per_kg`.
- Cada venta guarda snapshots de precios, peso, preparación, servicios extra y usuario.
- Público general se pesa en pluma, paga precio público por kg y paga preparación.
- Cliente Preferencial se pesa ya pelado, usa precio propio por kg, no paga preparación y puede pagar despielada o pechuga fileteada.
- El primer método de pago permitido es `EFECTIVO`.
- Solo ventas `COMPLETADA` cuentan para tickets y corte.
- La impresión se rastrea en `pluma_sales` con `printed_at` y `printed_by_user_id`.
- El corte del día guarda snapshots en `daily_cash_closures` y usa zona `America/Mexico_City`.

## business_settings

Configuración general del negocio.

| Campo | Tipo | Regla |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `business_name` | `text` | Requerido |
| `phone` | `text` | Requerido |
| `current_price_per_kg` | `numeric(10,2)` | Precio público, mayor a 0 |
| `preparation_price_per_chicken` | `numeric(10,2)` | Preparación público general, no negativo |
| `preferred_customer_default_price_per_kg` | `numeric(10,2)` | Default para nuevo Cliente Preferencial; si está vacío se usa precio público |
| `default_skinning_price_per_chicken` | `numeric(10,2)` | Default despielada, no negativo |
| `default_breast_fillet_price_per_chicken` | `numeric(10,2)` | Default pechuga fileteada, no negativo |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Se actualiza por trigger |

Los cambios de configuración no modifican clientes existentes automáticamente.

## app_users

Usuarios internos vinculados a Supabase Auth.

| Campo | Tipo | Regla |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `auth_user_id` | `uuid` | Opcional, referencia `auth.users(id)` |
| `name` | `text` | Requerido |
| `email` | `text` | Opcional, único |
| `username` | `text` | Opcional, único |
| `role` | `text` | `ADMIN` o `CAJERO` |
| `active` | `boolean` | Usuario activo |
| `can_print_tickets` | `boolean` | Permiso de impresión |

## premium_customers

Tabla técnica para **Clientes Preferenciales**.

| Campo | Tipo | Regla |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `name` | `text` | Requerido |
| `phone` | `text` | Opcional |
| `discount_per_kg` | `numeric(10,2)` | Deprecado, mantener por compatibilidad |
| `preferred_price_per_kg` | `numeric(10,2)` | Precio propio por kg, no negativo |
| `skinning_price_per_chicken` | `numeric(10,2)` | Despielada por pollo, no negativo |
| `breast_fillet_price_per_chicken` | `numeric(10,2)` | Pechuga fileteada por pollo, no negativo |
| `active` | `boolean` | Permite seleccionar en venta |
| `notes` | `text` | Opcional |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Se actualiza por trigger |

Al crear un cliente, la UI precarga precios desde `business_settings`, pero permite modificarlos antes de guardar.

## pluma_sales

Ventas de pollo.

| Campo | Tipo | Regla |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `sale_number` | `text` | Generado por base de datos con formato `PL-000001` |
| `customer_id` | `uuid` | Null para público general; referencia técnica a `premium_customers(id)` |
| `customer_name_snapshot` | `text` | Nombre guardado al momento de venta |
| `cashier_user_id` | `uuid` | Usuario que registró la venta |
| `chicken_quantity` | `integer` | Mayor a 0 |
| `total_weight_kg` | `numeric(10,3)` | Mayor a 0 |
| `weight_type` | `text` | `PLUMA` o `PELADO` |
| `base_price_per_kg` | `numeric(10,2)` | Precio público vigente |
| `discount_per_kg` | `numeric(10,2)` | Deprecado, usar `0` |
| `applied_price_per_kg` | `numeric(10,2)` | Precio cobrado por kg |
| `chicken_subtotal` | `numeric(10,2)` | `total_weight_kg * applied_price_per_kg` |
| `preparation_applies` | `boolean` | `true` para público general, `false` para Cliente Preferencial |
| `preparation_unit_price` | `numeric(10,2)` | Precio unitario si aplica; `0` si no aplica |
| `preparation_total` | `numeric(10,2)` | Preparación total |
| `skinning_requested` | `boolean` | Despielada solicitada |
| `skinning_unit_price` | `numeric(10,2)` | Precio snapshot de despielada |
| `skinning_total` | `numeric(10,2)` | Total despielada |
| `breast_fillet_requested` | `boolean` | Pechuga fileteada solicitada |
| `breast_fillet_unit_price` | `numeric(10,2)` | Precio snapshot de pechuga fileteada |
| `breast_fillet_total` | `numeric(10,2)` | Total pechuga fileteada |
| `extra_services_total` | `numeric(10,2)` | `skinning_total + breast_fillet_total` |
| `grand_total` | `numeric(10,2)` | Total final de la venta |
| `payment_method` | `text` | `EFECTIVO` |
| `printed_at` | `timestamptz` | Null mientras está pendiente |
| `printed_by_user_id` | `uuid` | Usuario que marcó impreso |
| `status` | `text` | `COMPLETADA` o `CANCELADA` |
| `created_at` | `timestamptz` | Fecha de venta |

### Público general

```txt
weight_type = PLUMA
preparation_applies = true
applied_price_per_kg = current_price_per_kg
preparation_total = chicken_quantity * preparation_price_per_chicken
extra_services_total = 0
grand_total = chicken_subtotal + preparation_total
```

### Cliente Preferencial

```txt
weight_type = PELADO
preparation_applies = false
applied_price_per_kg = preferred_price_per_kg del cliente
preparation_total = 0
extra_services_total = skinning_total + breast_fillet_total
grand_total = chicken_subtotal + extra_services_total
```

## Ticket imprimible

El ticket usa datos guardados en `pluma_sales`.

- Público general muestra `Peso en pluma`, `Pollo en pluma` y preparación.
- Cliente Preferencial muestra `Peso ya pelado`, `Pollo preparado` y no muestra preparación.
- Extras aparecen solo si aplican.
- El ticket conserva formato 80mm y se imprime con `printing-ticket`.
- Usuarios sin `can_print_tickets` pueden ver el ticket, pero no imprimir ni marcar impreso.

## Tickets pendientes por imprimir

Un ticket está pendiente cuando:

```sql
select *
from public.pluma_sales
where status = 'COMPLETADA'
  and printed_at is null
order by created_at desc;
```

El RPC para marcar impreso es:

```txt
public.mark_pluma_sale_printed(p_sale_id uuid)
```

Si el ticket ya está impreso, no sobrescribe `printed_at` ni `printed_by_user_id`.

## daily_cash_closures

Snapshot histórico del cierre diario.

| Campo | Tipo | Regla |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `business_date` | `date` | Fecha local, única |
| `expected_cash_total` | `numeric(10,2)` | Total esperado según ventas |
| `counted_cash_total` | `numeric(10,2)` | Efectivo contado |
| `cash_difference` | `numeric(10,2)` | `counted_cash_total - expected_cash_total` |
| `sales_count` | `integer` | Ventas consideradas |
| `total_chickens` | `integer` | Pollos vendidos |
| `total_weight_kg` | `numeric(10,3)` | Kg vendidos |
| `chicken_subtotal` | `numeric(10,2)` | Subtotal pollo |
| `preparation_total` | `numeric(10,2)` | Preparación |
| `skinning_total` | `numeric(10,2)` | Despielada |
| `breast_fillet_total` | `numeric(10,2)` | Pechuga fileteada |
| `extra_services_total` | `numeric(10,2)` | Servicios extra |
| `grand_total` | `numeric(10,2)` | Total vendido |
| `pending_print_count` | `integer` | Tickets pendientes |
| `printed_count` | `integer` | Tickets impresos |
| `closed_by_user_id` | `uuid` | Usuario que cerró |
| `notes` | `text` | Opcional |
| `created_at` | `timestamptz` | Fecha de creación |
| `updated_at` | `timestamptz` | Fecha de actualización |

RPC:

```txt
public.close_daily_cash_closure(p_business_date date, p_counted_cash_total numeric, p_notes text)
```

La función suma snapshots ya guardados en `pluma_sales`; no recalcula precios desde configuración ni desde clientes.

## pluma_sale_cancellations

Registro de cancelaciones.

| Campo | Tipo | Regla |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `sale_id` | `uuid` | Referencia `pluma_sales(id)` |
| `cancelled_by_user_id` | `uuid` | Usuario que canceló |
| `reason` | `text` | Requerido |
| `created_at` | `timestamptz` | Default `now()` |
