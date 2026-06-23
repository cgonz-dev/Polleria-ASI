# SPEC 003 - Venta rápida en Pluma

## Objetivo

Implementar la primera pantalla funcional del sistema **Pollería ASI** en la ruta `/ventas/pluma`.

## Alcance implementado

- Pantalla real de captura de venta.
- Usuario que atiende tomado del login activo. En la primera versión de SPEC 003 existía selección manual de cajero, pero quedó reemplazada por SPEC 005.
- Selección de tipo de cliente: público general o cliente premium.
- Búsqueda y selección de cliente premium activo.
- Cálculo automático de importes.
- Resumen en tiempo real con total destacado.
- Guardado de venta en Supabase.
- Preparación para `sale_number` automático generado por PostgreSQL.
- Mensajes de carga, éxito y error.
- Validaciones principales antes de guardar.
- Interacción con teclado: Enter en peso intenta registrar la venta.
- Reset posterior a venta exitosa, manteniendo la sesión del usuario autenticado.
- Diseño responsive para computadora, tablet y celular.

## Fuera de alcance

- Impresión real de ticket.
- QZ Tray.
- Corte del día.
- Alta o edición de clientes premium desde esta pantalla.
- Cancelación de ventas desde UI.
- Reportes.

La autenticación, permisos y RLS inicial quedaron agregados en SPEC 005.

## Paleta visual

- Verde principal: `#028201`
- Rojo de acción y total: `#F20F02`
- Dorado: `#FBBE01`
- Naranja: `#E98D01`
- Fondo suave: `#FFF7D6`
- Superficie: `#FFFFFF`
- Texto: `#1F1F1F`

## Datos cargados al abrir

- `business_settings`: nombre del negocio, teléfono, precio actual por kg y precio de preparación por pollo.
- `app_users`: perfil interno del usuario autenticado.
- `premium_customers`: clientes premium activos.

## Fórmulas

```txt
applied_price_per_kg = base_price_per_kg - discount_per_kg
chicken_subtotal = total_weight_kg * applied_price_per_kg
preparation_total = chicken_quantity * preparation_unit_price
grand_total = chicken_subtotal + preparation_total
```

## Guardado

El frontend inserta en `pluma_sales` sin enviar:

```txt
id
sale_number
created_at
```

Valores fijos por ahora:

```txt
payment_method = EFECTIVO
status = COMPLETADA
```

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
discount_per_kg = descuento del cliente premium
```

## Migración requerida

Ejecutar en Supabase:

```txt
docs/database/002-pluma-sale-number.sql
```

Esto crea la secuencia y función para generar tickets con formato:

```txt
PL-000001
PL-000002
PL-000003
```
