# Pollería ASI

Base inicial del sistema web **Pollería ASI**, preparado para crecer por módulos. El primer módulo real será **Venta en Pluma**, pero la estructura queda lista para ventas, clientes, caja, administración e integraciones futuras.

## Getting Started

Instala dependencias y levanta el servidor de desarrollo:

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). La ruta raíz redirige a `/dashboard`.

## Stack

- Next.js con App Router.
- TypeScript.
- Tailwind CSS.
- shadcn/ui.
- Supabase Auth y PostgreSQL mediante variables de entorno y helper centralizado.
- Estructura PWA inicial con manifest e iconos.

## Rutas iniciales

- `/dashboard`
- `/ventas/pluma`
- `/clientes/premium`
- `/caja/tickets-pendientes`
- `/caja/corte-dia`
- `/admin/usuarios`
- `/admin/configuracion`

## Estructura

- `src/app/(app)`: rutas principales dentro del layout de aplicación.
- `src/components/app`: shell responsive, navegación y placeholders.
- `src/components/ui`: componentes shadcn/ui.
- `src/config/navigation.ts`: menú principal.
- `src/lib/supabase`: cliente y tipos preparados para Supabase.
- `docs`: documentación del producto y especificaciones.
- `docs/database`: scripts SQL para Supabase.
- `docs/contracts`: contratos de datos del sistema.
- `docs/specs`: futuras especificaciones funcionales.

## Variables de entorno

Copia `.env.example` a `.env.local` cuando existan credenciales reales:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

No subas `.env.local` al repositorio.

## Modelo de datos inicial

El script inicial para Supabase está en `docs/database/001-initial-schema.sql`.

Incluye:

- `business_settings`
- `app_users`
- `premium_customers`
- `pluma_sales`
- `pluma_sale_cancellations`

La fórmula base para Venta en Pluma queda documentada en `docs/contracts/data-contract.md`:

```txt
Precio aplicado = precio general - descuento por kg
Subtotal pollo = peso total kg * precio aplicado
Preparación = cantidad de pollos * precio de preparación unitario
Total = subtotal pollo + preparación
```

Para usarlo, crea un proyecto en Supabase, abre el SQL Editor y ejecuta el contenido de `docs/database/001-initial-schema.sql`.

Después ejecuta `docs/database/002-pluma-sale-number.sql` para activar la generación automática de números de venta:

```txt
PL-000001
PL-000002
PL-000003
```

La pantalla `/ventas/pluma` no envía `sale_number`; Supabase/PostgreSQL lo genera y lo devuelve al registrar la venta.

Ejecuta también `docs/database/003-update-business-phone.sql` para configurar el teléfono real del ticket:

```txt
456-106-0141
```

Por último, ejecuta `docs/database/004-auth-users-permissions.sql` para habilitar Supabase Auth, perfiles internos, permisos iniciales y políticas RLS.

Los usuarios de acceso se crean por ahora desde Supabase Auth. Después vincula el `auth.users.id` real con `public.app_users.auth_user_id`.

Para los usuarios iniciales indispensables, crea primero estas cuentas en Supabase Auth con la contraseña que decidas:

```txt
vane@polleria-asi.com
lupita@polleria-asi.com
adan_jr@polleria-asi.com
arturo_cajero@polleria-asi.com
pc_caja@polleria-asi.com
```

Después ejecuta `docs/database/005-seed-initial-users.sql`. Los primeros cuatro quedan como administradores que también pueden capturar ventas, pero sin permiso de impresión. `pc_caja` queda como administrador/cajero y es el único con `can_print_tickets = true`.

Para activar el seguimiento de impresión y la bandeja de tickets pendientes, ejecuta también:

```txt
docs/database/006-print-tracking-pluma-sales.sql
```

Esta migración agrega `printed_at`, `printed_by_user_id`, el RPC seguro `mark_pluma_sale_printed` y habilita Supabase Realtime para `pluma_sales`.

Para activar el corte del día, ejecuta:

```txt
docs/database/007-daily-cash-closures.sql
```

Esta migración crea `daily_cash_closures` y el RPC seguro `close_daily_cash_closure`.

## Login y permisos

El sistema usa `/login` con email y contraseña de Supabase Auth.

Cada sesión debe tener un registro activo en `app_users`:

- `ADMIN`: puede entrar a administración y cambiar permisos internos.
- `CAJERO`: puede capturar ventas.
- `can_print_tickets = true`: muestra el botón `Imprimir ticket`.
- `can_print_tickets = false`: registra venta, muestra el ticket en pantalla, pero oculta el botón de imprimir y muestra el aviso para imprimir desde la PC de caja.

La ruta `/admin/usuarios` permite al administrador actualizar rol, estado activo y permiso de impresión. No crea cuentas de Supabase Auth todavía.

## Tickets pendientes

La ruta `/caja/tickets-pendientes` funciona como bandeja de trabajo para la PC de caja.

Un ticket está pendiente cuando:

```txt
pluma_sales.status = COMPLETADA
pluma_sales.printed_at is null
```

La pantalla muestra:

- Tickets pendientes por imprimir.
- Últimos tickets impresos.
- Contador de pendientes.
- Avisos en tiempo real cuando llega una nueva venta.
- Botón `Actualizar` como respaldo.

Usuarios sin permiso pueden ver tickets, pero no imprimir ni marcar impreso. Usuarios con `can_print_tickets = true` pueden imprimir, marcar impreso y reimprimir.

La reimpresión no cambia `printed_at`.

## Corte del Día

La ruta `/caja/corte-dia` muestra el resumen diario de ventas de pollo en pluma.

Incluye:

- Total vendido.
- Número de ventas.
- Pollos vendidos.
- Kg vendidos.
- Preparación.
- Subtotal pollo.
- Total efectivo esperado.
- Tickets impresos y pendientes.
- Desglose por usuario.
- Desglose público general vs clientes premium.

El corte usa horario de México:

```txt
America/Mexico_City
```

Solo considera ventas:

```txt
status = COMPLETADA
```

Usuarios autenticados pueden consultar el corte. Solo usuarios `ADMIN` pueden cerrar o actualizar el corte del día.

Al cerrar corte, la app pide:

```txt
Efectivo contado
Notas opcionales
```

La base calcula los totales reales desde `pluma_sales`; el frontend no envía totales calculados. Si entran ventas después de cerrar, la pantalla avisa que puede haber cambios posteriores al cierre.

## Venta rápida en Pluma

La ruta `/ventas/pluma` carga desde Supabase:

- Configuración del negocio.
- Perfil del usuario autenticado.
- Clientes premium activos.

Permite registrar ventas de público general o cliente premium, calcula el total en tiempo real y guarda snapshots de cliente, precio, descuento y usuario que atiende. Por ahora el método de pago queda fijo como `EFECTIVO` y el estado como `COMPLETADA`.

Después de registrar una venta se abre un ticket de 80mm con acciones:

- `Imprimir ticket`: abre la impresión del navegador y muestra solo el ticket cuando el usuario tiene permiso.
- `Marcar como impreso`: aparece para usuarios con permiso y actualiza `printed_at` mediante RPC.
- `Nueva venta`: cierra el ticket y limpia la captura.
- Usuarios sin permiso ven: `Ticket registrado. Imprime desde la PC de caja.`

El ticket está simplificado para cliente final. Siempre inicia con `POLLERÍA ASI` y `Tel: 456-106-0141`; muestra `Precio por kg` usando el precio final aplicado, `Pollo en pluma`, preparación explicada como `cantidad pollos x precio unitario`, y total. No muestra cajero, tipo de cliente, descuento, precio base, etiqueta técnica de precio aplicado ni forma de pago.

## Logo y branding

Coloca el logo real en:

```txt
public/brand/logo-asi.png
```

La app lo usa en la sidebar. Si no existe, mantiene un fallback visual `ASI`.

El branding global usa una versión más suave de la paleta: fondo crema claro, tarjetas blancas, navegación verde y rojo solo para acciones principales.

La impresión actual usa el navegador (`window.print()`). La impresión directa con QZ Tray queda preparada como mejora futura.

## Scripts

- `npm run dev`: servidor de desarrollo.
- `npm run build`: build de producción.
- `npm run start`: servidor de producción después del build.
- `npm run lint`: revisión con ESLint.
