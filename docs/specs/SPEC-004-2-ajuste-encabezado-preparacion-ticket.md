# SPEC 004.2 - Ajuste de encabezado y preparación en ticket

## Objetivo

Corregir el ticket imprimible de Venta en Pluma para asegurar encabezado visible y preparación más clara para el cliente final.

## Implementado

- El ticket siempre muestra `POLLERÍA ASI` centrado.
- El ticket siempre muestra `Tel: 456-106-0141` debajo del nombre.
- Si `business_settings.phone` viene vacío o `000-000-0000`, se usa el teléfono real como fallback.
- La sección de preparación ahora muestra:

```txt
Preparación:
4 pollos x $8.00         $32.00
```

- Para una pieza muestra:

```txt
1 pollo x $8.00           $8.00
```

- El concepto del pollo ahora se muestra como `Pollo en pluma`.
- El CSS del ticket usa `box-sizing: border-box` con ancho `80mm` y padding `4mm` para evitar cortes de encabezado.

## No debe mostrarse

- Cajero.
- Tipo de cliente.
- Descuento.
- Precio base.
- Precio aplicado como etiqueta técnica.
- Pago.
- `Cliente: Público general`.

## Corrección de menú móvil

Se revisó el layout actual en `src/components/app/app-shell.tsx` y el componente `Sheet`.

Causa detectada:

- El botón hamburguesa usaba `SheetTrigger` con composición `render={<Button />}` en vez de un `onClick` controlado explícito.
- El tamaño real del botón era `36px` por `36px` (`size="icon-lg"` del botón local), menor al objetivo táctil de `44px`.
- El header móvil tenía menor prioridad visual que otros overlays futuros, por lo que se reforzó su `z-index`.

Corrección aplicada:

- El botón hamburguesa ahora es un botón real controlado con `onClick={() => setMobileOpen(true)}`.
- Usa `aria-label="Abrir menú"`, `aria-expanded` y `aria-controls`.
- El área táctil mínima es `44px` por `44px`.
- El menú sigue usando un solo `Sheet` lateral y se cierra al navegar mediante `onNavigate`.
- El botón de cierre del `Sheet` también usa área táctil de `44px`.
