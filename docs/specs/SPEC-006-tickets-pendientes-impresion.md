# SPEC 006 - Tickets pendientes por imprimir

## Objetivo

Implementar una bandeja de tickets pendientes por imprimir para centralizar la impresión en la PC de caja, sin bloquear la captura de ventas desde celular, tablet o cualquier otra PC.

## Implementado

- Migración `docs/database/006-print-tracking-pluma-sales.sql`.
- Campos `printed_at` y `printed_by_user_id` en `pluma_sales`.
- Índices para pendientes e impresos.
- RPC `mark_pluma_sale_printed(p_sale_id uuid)`.
- Realtime habilitado para `public.pluma_sales`.
- Ruta `/caja/tickets-pendientes`.
- Listado de tickets pendientes.
- Sección de últimos tickets impresos.
- Botón `Actualizar` como fallback manual.
- Refresco suave cada 30 segundos como respaldo.
- Suscripción Realtime para nuevos tickets y cambios de impresión.
- Acceso visible desde `/ventas/pluma`.
- Contador de tickets pendientes desde Venta en Pluma.
- Modal de ticket con modos de lectura, impresión, reimpresión y marcar impreso.
- Navegación bajo menú `Caja`.

## Reglas funcionales

Un ticket pendiente es una venta que cumple:

```txt
status = COMPLETADA
printed_at is null
```

Un ticket impreso cumple:

```txt
status = COMPLETADA
printed_at is not null
```

No se creó tabla `print_jobs`. Para este MVP el estado de impresión vive directamente en `pluma_sales`.

## Permisos

La seguridad no depende de detectar si el dispositivo es celular o PC.

La regla principal es:

```txt
currentAppUser.canPrintTickets
```

Usuarios con `can_print_tickets = false` pueden:

- Registrar ventas.
- Ver tickets pendientes.
- Abrir tickets en modo lectura.
- Ver si un ticket está pendiente o impreso.

Usuarios con `can_print_tickets = false` no pueden:

- Imprimir.
- Marcar como impreso.
- Reimprimir.

Usuarios con `can_print_tickets = true` pueden:

- Registrar ventas.
- Ver tickets pendientes.
- Imprimir tickets.
- Marcar tickets como impresos.
- Ver últimos tickets impresos.
- Reimprimir tickets.

## Marcar como impreso

El frontend no actualiza `printed_at` directamente. Usa el RPC:

```txt
public.mark_pluma_sale_printed(p_sale_id uuid)
```

La función valida `public.can_print_tickets()`.

Si el ticket ya tenía `printed_at`, el RPC no sobrescribe la fecha original ni `printed_by_user_id`.

Reimprimir no cambia `printed_at`.

## Flujo desde Venta en Pluma

La pantalla `/ventas/pluma` muestra un acceso visible:

```txt
Ir a imprimir tickets (N)
```

O:

```txt
Ver tickets pendientes (N)
```

según el permiso de impresión del usuario.

Después de registrar una venta:

- Si el usuario no puede imprimir, ve el ticket en pantalla y el botón `Ver tickets pendientes`.
- Si el usuario puede imprimir, puede imprimir y después marcar como impreso.
- Si no se marca como impreso, la venta sigue apareciendo en pendientes.

## Realtime

La bandeja se suscribe a cambios de `public.pluma_sales`.

Cuando entra una venta nueva pendiente, muestra mensaje:

```txt
Nuevo ticket pendiente: PL-000016
```

Cuando un ticket se marca como impreso o deja de estar pendiente, la lista se refresca.

## Pendientes futuros

- Alias `/caja/tickets`.
- Toast visual más elaborado.
- Filtros por fecha/cajero.
- Auditoría detallada de reimpresiones.
