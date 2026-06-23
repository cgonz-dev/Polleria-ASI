# SPEC 007 - Corte del Día

## Objetivo

Implementar el módulo **Corte del Día** para revisar ventas diarias de pollo en pluma, efectivo esperado, tickets pendientes/impresos y desglose por usuario.

## Implementado

- Ruta funcional `/caja/corte-dia`.
- Selector de fecha.
- Botón `Actualizar`.
- Resumen de ventas del día.
- Desglose financiero.
- Desglose por usuario/cajero.
- Desglose público general vs clientes premium.
- Resumen de tickets impresos y pendientes.
- Acceso directo a `/caja/tickets-pendientes`.
- Modal para cerrar o actualizar corte.
- Registro histórico de cierres en `daily_cash_closures`.
- RPC `close_daily_cash_closure`.
- Realtime sobre `pluma_sales` para refrescar corte cuando entran ventas o cambian tickets.
- Vista responsive para PC, tablet y celular.

## Migración

Ejecutar:

```txt
docs/database/007-daily-cash-closures.sql
```

Debe correrse después de:

```txt
docs/database/006-print-tracking-pluma-sales.sql
```

## Tabla

La migración crea:

```txt
public.daily_cash_closures
```

Guarda una fotografía del corte del día:

- Fecha de negocio.
- Efectivo esperado.
- Efectivo contado.
- Diferencia.
- Ventas.
- Pollos.
- Kg.
- Subtotal pollo.
- Preparación.
- Total.
- Tickets pendientes.
- Tickets impresos.
- Usuario que cerró.
- Notas.

Solo puede existir un cierre por `business_date`.

## Reglas

Solo se consideran ventas:

```txt
status = COMPLETADA
```

No se consideran ventas canceladas.

El rango del día usa horario:

```txt
America/Mexico_City
```

El efectivo esperado equivale por ahora al total vendido porque el único método de pago es `EFECTIVO`.

## Cierre

Solo usuarios `ADMIN` pueden cerrar o actualizar corte.

El frontend envía:

```txt
business_date
counted_cash_total
notes
```

La base calcula los totales reales desde `pluma_sales`.

Si después del cierre entran ventas o cambian tickets, la pantalla muestra aviso de posible diferencia entre corte guardado y ventas actuales.

## Fuera de alcance

- Turnos.
- Gastos.
- Entradas/salidas manuales de efectivo.
- Inventario.
- Exportación a Excel/PDF.
- Reportes semanales o mensuales.
