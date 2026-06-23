# Pollería ASI - Producto MVP

## Nombre del sistema

Pollería ASI

El nombre visible del sistema debe mostrarse como **Pollería ASI**.

## Objetivo general

Crear un sistema web modular para apoyar la operación diaria de la pollería, con una base sencilla, económica y lista para crecer por módulos.

## Primer módulo

El primer módulo real será **Venta en Pluma**. La base del proyecto no queda limitada a ese flujo: también considera clientes, caja, administración y módulos futuros.

El primer flujo funcional será **captura rápida de venta en pluma con cálculo automático y guardado en Supabase**.

El MVP de Venta en Pluma ahora incluye captura rápida, cálculo automático, guardado en Supabase, ticket imprimible de 80mm, bandeja de tickets pendientes por imprimir, corte del día y uso de branding Pollería ASI en la interfaz.

El ticket imprimible está pensado para el cliente final: muestra información clara de compra y evita datos internos como cajero, descuentos, tipo de cliente o desglose técnico de precios.

El acceso inicial usa login con Supabase Auth. Cada usuario autenticado debe tener un perfil activo en `app_users`, con rol `ADMIN` o `CAJERO` y permiso específico para imprimir tickets.

## Problema que resuelve

El sistema busca ordenar capturas de venta, tickets, clientes frecuentes y cortes diarios en una sola herramienta responsive. La intención es reducir trabajo manual, evitar confusiones al cobrar y dejar registros claros para revisar la operación.

## Usuarios iniciales

- Administrador: configura usuarios, parámetros y revisa la operación.
- Cajero: captura ventas, emite tickets y realiza cortes del día.

## Necesidades principales

- Tickets claros para entregar información entendible al cliente.
- Clientes premium para manejar compradores frecuentes o condiciones especiales.
- Corte del día para revisar ventas, caja y cierre operativo.
- Login para separar operación por usuario y evitar selección manual de cajero.
- Permiso de impresión para permitir captura desde celulares o tablets sin imprimir desde todos los dispositivos.
- Bandeja de tickets pendientes para centralizar la impresión en la PC de caja.
- Corte del día para revisar total vendido, efectivo esperado, pollos, kg, preparación y actividad por usuario.
- Enfoque económico, priorizando herramientas accesibles y una implementación mantenible.
- Enfoque responsive para computadora, tablet y celular.

## Base de datos inicial

El sistema usará Supabase PostgreSQL como base de datos compartida para múltiples cajeros y dispositivos. La primera versión del modelo contempla configuración del negocio, usuarios internos, clientes premium, ventas en pluma y cancelaciones de venta.

Para Venta en Pluma, cada venta guardará snapshots de precio, descuento y cliente. Esto evita que ventas históricas cambien cuando se modifique el precio general o el descuento de un cliente premium.

Cada venta queda ligada al usuario autenticado en caja. Los cajeros capturan ventas; los administradores pueden entrar a secciones administrativas y ajustar permisos iniciales de usuarios.

La impresión se controla con `app_users.can_print_tickets`. Los usuarios sin permiso pueden ver el ticket y consultar pendientes, pero no imprimir ni marcar como impreso. La PC de caja puede imprimir y marcar tickets como impresos.

Para identificar tickets pendientes, `pluma_sales` usa:

```txt
printed_at = null
```

Cuando se imprime y confirma, se registra:

```txt
printed_at
printed_by_user_id
```

El corte del día usa `daily_cash_closures` para guardar una fotografía de los totales del día. Solo considera ventas `COMPLETADA`, usa horario `America/Mexico_City` y permite comparar efectivo esperado contra efectivo contado.

Fórmula inicial:

```txt
Precio aplicado = precio general - descuento por kg
Subtotal pollo = peso total kg * precio aplicado
Preparación = cantidad de pollos * precio de preparación unitario
Total = subtotal pollo + preparación
```

La numeración de venta se genera desde base de datos con formato `PL-000001`, evitando duplicados entre varios dispositivos.

El ticket imprimible usa los datos guardados de la venta y el teléfono real del negocio `456-106-0141`. La impresión directa con QZ Tray se considera una mejora futura; por ahora se usa impresión del navegador.

La identidad visual global usa un enfoque limpio y amable: fondo crema suave, superficies blancas, navegación verde, rojo solo para acciones importantes y amarillo únicamente como detalle.

## Módulos futuros posibles

- Inventario.
- Compras y proveedores.
- Reportes de ventas.
- Historial de clientes.
- Promociones o precios especiales.
- Integración con impresoras de tickets.
- Historial/auditoría detallada de reimpresiones.
- Roles y permisos avanzados.
- Creación de usuarios Auth desde la propia aplicación.
