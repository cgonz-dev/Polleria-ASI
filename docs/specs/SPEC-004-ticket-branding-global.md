# SPEC 004 - Ticket imprimible y branding global Pollería ASI

## Objetivo

Implementar ticket imprimible para **Venta en Pluma** y mejorar el branding global de la aplicación **Pollería ASI**.

## Implementado

- Modal de ticket después de registrar una venta.
- Botón `Imprimir ticket` con `window.print()` para usuarios con permiso de impresión.
- Botón `Nueva venta` que cierra ticket, limpia captura y enfoca cantidad de pollos.
- Ticket optimizado para 80mm.
- CSS `@media print` para imprimir solo el ticket.
- Migración `docs/database/003-update-business-phone.sql` para teléfono `456-106-0141`.
- Sidebar y header con identidad visual Pollería ASI.
- Fallback de logo `ASI` y código preparado para `/brand/logo-asi.png`.
- Paleta global aplicada a navegación, fondos, tarjetas y estados.

## Fuera de alcance

- QZ Tray.
- Impresión silenciosa.
- Configuración avanzada de impresoras.
- Cancelaciones.
- Corte del día.
- Inventario.
- Facturación.

La autenticación, permisos y RLS inicial quedaron agregados en SPEC 005.

## Ticket

El ticket muestra:

- Pollería ASI.
- Teléfono del negocio.
- `sale_number`.
- Fecha y hora local de México.
- Cantidad de pollos.
- Peso total.
- Precio por kg.
- Subtotal pollo.
- Preparación.
- Total.

Por correcciones posteriores, el ticket para cliente final ya no muestra cajero, tipo de cliente, descuento, precio base, etiqueta técnica de precio aplicado ni forma de pago.

El ticket se genera con los datos devueltos por la venta guardada en `pluma_sales`, no con datos temporales del formulario.

## Branding

Paleta usada:

```txt
brand.primary = #028201
brand.danger = #F20F02
brand.accent = #FBBE01
brand.warning = #E98D01
brand.warningSoft = #E9A517
brand.background = #FFF7D6
brand.surface = #FFFFFF
brand.text = #1F1F1F
```

## Logo

La app busca el logo en:

```txt
public/brand/logo-asi.png
```

Si el archivo no existe, muestra el fallback `ASI`.

## Prueba mínima

1. Ejecutar en Supabase `docs/database/003-update-business-phone.sql`.
2. Colocar logo real en `public/brand/logo-asi.png` si está disponible.
3. Abrir `/ventas/pluma`.
4. Registrar una venta.
5. Confirmar que se abre el ticket.
6. Presionar `Imprimir ticket`.
7. Confirmar que la vista previa imprime solo el ticket de 80mm.
