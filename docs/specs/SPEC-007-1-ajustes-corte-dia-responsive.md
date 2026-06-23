# SPEC 007.1 - Ajustes de Corte del Día y Responsividad

## Objetivo

Refinar la pantalla `/caja/corte-dia` sin rehacer el módulo completo, manteniendo el cálculo ya implementado en SPEC 007 y mejorando su uso operativo en desktop, tablet y celular.

## Cambios implementados

- Se muestra `Última actualización` con formato local de México.
- La hora se actualiza al cargar, al presionar `Actualizar`, al recibir cambios por Realtime y después de cerrar o actualizar un corte.
- El estado de cierre muestra claramente quién cerró, fecha de cierre, efectivo esperado, efectivo contado y diferencia.
- Si `updated_at` es distinto de `created_at`, se muestra la última actualización del cierre.
- Si el resumen vivo ya no coincide con el snapshot cerrado, se muestra el aviso de revisión del corte.
- Se agregó botón `Imprimir corte` solo para usuarios `ADMIN`.
- Se creó la zona imprimible `.corte-dia-print-area`.
- Se separó la impresión de corte de la impresión de ticket usando clases de modo:
  - `printing-ticket` para ticket de 80mm.
  - `printing-daily-cut` para corte del día.
- En móvil, el desglose por usuario se muestra como tarjetas en lugar de tabla horizontal.
- Los botones principales del corte usan altura táctil cómoda y ancho completo en móvil.
- El desglose financiero se vuelve una lista más legible en pantallas pequeñas.

## Vista imprimible del corte

La impresión del corte incluye:

- Pollería ASI.
- CORTE DEL DÍA.
- Fecha del corte.
- Última actualización.
- Total vendido.
- Ventas.
- Pollos vendidos.
- Kg vendidos.
- Preparación.
- Subtotal pollo.
- Total efectivo esperado.
- Tickets impresos y pendientes.
- Desglose por usuario.
- Público general vs clientes premium.
- Estado de cierre, efectivo contado, diferencia y notas si existen.

## Decisión técnica de impresión

Antes de este ajuste, las reglas globales de `@media print` estaban orientadas al ticket de 80mm. Eso podía hacer que cualquier impresión nueva heredara ancho y comportamiento de ticket.

Para evitar competencia entre ambos impresos, los botones de impresión agregan temporalmente una clase al `html` y al `body`:

```txt
printing-ticket
printing-daily-cut
```

El CSS de impresión aplica reglas específicas según la clase activa. Así el ticket conserva su formato de 80mm y el corte imprime solamente el resumen administrativo.

## Responsividad

La pantalla mantiene este comportamiento:

- Desktop: tarjetas principales en grid amplio y desglose por usuario como tabla.
- Tablet: grids compactos sin pérdida de lectura.
- Celular: controles apilados, botones anchos, tarjetas principales en una columna y desglose por usuario en tarjetas.

## Criterios de aceptación cubiertos

- `/caja/corte-dia` muestra hora de última actualización.
- Usuarios autenticados pueden ver el corte.
- Solo `ADMIN` puede cerrar o imprimir corte.
- El cierre muestra usuario, fecha, esperado, contado y diferencia.
- La UI avisa si hay cambios posteriores al cierre.
- La impresión del corte no muestra sidebar ni botones.
- La impresión del ticket conserva su flujo separado de 80mm.
- El layout móvil evita tablas horizontales innecesarias en el desglose por usuario.

## Validación recomendada

Ejecutar:

```bash
npm run lint
npm run build
```

Probar manualmente:

```txt
/caja/corte-dia
/ventas/pluma
/caja/tickets-pendientes
```

Validar en DevTools tamaños tipo iPhone SE, iPhone 12/13/14, Pixel 7, iPad Mini y desktop.
