# SPEC 004.1 - Corrección de ticket y mejora visual amigable

## Objetivo

Corregir el ticket imprimible de Venta en Pluma para que sea un recibo simple para cliente final y suavizar la identidad visual global.

## Implementado

- Ticket sin cajero.
- Ticket sin tipo de cliente.
- Ticket sin precio base.
- Ticket sin descuento.
- Ticket sin etiqueta técnica de precio aplicado.
- Ticket sin forma de pago.
- Ticket sin `Cliente: Público general`.
- Ticket con `Precio por kg` usando `applied_price_per_kg`.
- Ticket con teléfono `456-106-0141`, incluso si la configuración sigue con el teléfono temporal.
- Encabezado centrado con `POLLERÍA ASI` y `Tel: 456-106-0141`.
- Preparación mostrada como sección: `Preparación:` y `cantidad pollos x precio_unitario` junto al importe.
- CSS de impresión reforzado para imprimir solo `.ticket-print-area`.
- Branding global suavizado: crema claro, blanco, verde amable y rojo solo para acciones.

## Contenido del ticket

```txt
Pollería ASI
Tel: 456-106-0141

VENTA POLLO EN PLUMA
Ticket: PL-000006
Fecha: 22/06/2026 12:41 p.m.

Pollos: 1
Peso total: 3.600 kg
Precio por kg: $48.00/kg

Pollo en pluma: $172.80

Preparación:
1 pollo x $8.00 $8.00

TOTAL: $180.80

Gracias por su compra
```

## Impresión

La impresión usa `window.print()` y reglas `@media print` para ocultar sidebar, header, formulario, resumen normal, botones y fondos de app. Solo el ticket de 80mm debe quedar visible.

## Fuera de alcance

- QZ Tray.
- Impresión silenciosa.
- Cambio de modelo de cálculo.
- Cambios en guardado de venta.
