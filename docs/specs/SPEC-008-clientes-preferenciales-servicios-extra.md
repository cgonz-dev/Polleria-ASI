# SPEC 008 - Clientes Preferenciales y Servicios Extra

## Objetivo

Reemplazar el concepto visible de Clientes Premium por **Clientes Preferenciales** y soportar precio especial por cliente, peso ya pelado, ausencia de preparación y servicios extra.

## Decisión de negocio

- Nombre oficial visible: Clientes Preferenciales.
- Textos permitidos: Cliente Preferencial, Clientes Preferenciales, Precio preferencial.
- No usar Proveedor como nombre del módulo.
- La tabla física `premium_customers` se mantiene por compatibilidad técnica.
- `discount_per_kg` queda deprecado y no participa en la nueva venta.

## Base de datos

Se agregó la migración:

```txt
docs/database/008-preferred-customers-extra-services.sql
```

Incluye:

- Defaults en `business_settings`.
- Precios por cliente en `premium_customers`.
- Snapshots de peso, preparación y servicios extra en `pluma_sales`.
- Totales de servicios extra en `daily_cash_closures`.
- Actualización del RPC `close_daily_cash_closure`.

## Configuración

La ruta `/admin/configuracion` permite editar:

- Precio público por kg.
- Preparación público general por pollo.
- Precio default cliente preferencial por kg.
- Despielada default por pollo.
- Pechuga fileteada default por pollo.

Solo `ADMIN` puede editar.

## Clientes Preferenciales

La ruta visible es:

```txt
/clientes/preferenciales
```

La ruta antigua redirige:

```txt
/clientes/premium -> /clientes/preferenciales
```

La pantalla permite:

- Listar clientes.
- Buscar por nombre.
- Crear cliente.
- Editar cliente.
- Activar/desactivar cliente.
- Configurar precio por kg, despielada y pechuga fileteada por cliente.

## Venta en Pluma

### Público general

- Peso en pluma.
- Precio público por kg.
- Preparación por pollo.
- Sin servicios extra.
- Guarda `weight_type = PLUMA`.
- Guarda `preparation_applies = true`.

### Cliente Preferencial

- Requiere seleccionar cliente.
- Peso ya pelado.
- Precio preferencial por kg del cliente.
- Preparación no aplica.
- Puede cobrar despielada.
- Puede cobrar pechuga fileteada.
- Guarda `weight_type = PELADO`.
- Guarda `preparation_applies = false`.
- Guarda snapshots de precios y totales de extras.

## Ticket

El ticket de público general muestra:

- Peso en pluma.
- Pollo en pluma.
- Preparación.

El ticket de Cliente Preferencial muestra:

- Peso ya pelado.
- Pollo preparado.
- Servicios extra solo si aplican.
- No muestra preparación.

La impresión 80mm se mantiene separada con `printing-ticket`.

## Tickets pendientes

La bandeja sigue usando:

```txt
status = COMPLETADA
printed_at is null
```

Las tarjetas muestran `Peso en pluma` o `Peso ya pelado` según el snapshot de la venta.

## Corte del Día

El corte suma desde `pluma_sales`:

- Subtotal pollo.
- Preparación.
- Despielada.
- Pechuga fileteada.
- Servicios extra.
- Total vendido.

El cierre guarda snapshot de:

- `skinning_total`
- `breast_fillet_total`
- `extra_services_total`

## Validación recomendada

1. Ejecutar `docs/database/008-preferred-customers-extra-services.sql` en Supabase.
2. Configurar defaults en `/admin/configuracion`.
3. Crear clientes en `/clientes/preferenciales`.
4. Registrar venta público general.
5. Registrar venta Cliente Preferencial sin extras.
6. Registrar venta Cliente Preferencial con despielada y pechuga fileteada.
7. Validar ticket 80mm.
8. Validar tickets pendientes.
9. Validar corte del día y cierre.
10. Ejecutar:

```bash
npm run lint
npm run build
```
