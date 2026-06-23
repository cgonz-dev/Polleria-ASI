# SPEC 005 - Login, usuarios y permisos

## Objetivo

Implementar acceso inicial con Supabase Auth, perfiles internos en `app_users` y permisos básicos para separar operación de cajero y administración.

## Alcance implementado

- Ruta `/login` con email y contraseña.
- Contexto global de autenticación con un solo cliente Supabase de navegador.
- Protección general de rutas internas.
- Protección de rutas administrativas para rol `ADMIN`.
- Perfil interno `app_users` vinculado a Supabase Auth mediante `auth_user_id`.
- Permiso `can_print_tickets` para controlar impresión desde el ticket.
- Venta en Pluma ligada al usuario autenticado, sin selector manual de cajero.
- Pantalla inicial `/admin/usuarios` para rol, activo y permiso de impresión.
- RLS inicial en Supabase para lectura, venta y administración.

## Decisiones

Los usuarios de acceso se crean manualmente desde Supabase Auth durante esta etapa. La aplicación administra el perfil interno, no crea cuentas Auth todavía.

Venta en Pluma muestra el bloque `Atiende` con el usuario autenticado. El `cashier_user_id` guardado en `pluma_sales` siempre sale del perfil interno activo.

Si `can_print_tickets = false`, el ticket se muestra para revisión, pero no aparece el botón de imprimir. El mensaje visible es:

```txt
Ticket registrado. Imprime desde la PC de caja.
```

## Migración

Ejecutar después de las migraciones previas:

```txt
docs/database/004-auth-users-permissions.sql
```

Después de crear usuarios en Supabase Auth, vincular el UUID real en `app_users.auth_user_id`.

Para los usuarios iniciales indispensables:

```txt
docs/database/005-seed-initial-users.sql
```

Usuarios iniciales:

- `vane`: rol `ADMIN`, puede capturar ventas, no imprime.
- `lupita`: rol `ADMIN`, puede capturar ventas, no imprime.
- `adan_jr`: rol `ADMIN`, puede capturar ventas, no imprime.
- `arturo_cajero`: rol `ADMIN`, puede capturar ventas, no imprime.
- `pc_caja`: rol `ADMIN`, puede capturar ventas e imprime tickets.

Nota: en esta etapa `ADMIN` también puede operar como cajero. La impresión queda separada con `can_print_tickets`.

## Rutas protegidas

- `/dashboard`
- `/ventas/pluma`
- `/clientes/premium`
- `/caja/corte-dia`
- `/admin/usuarios`
- `/admin/configuracion`

Las rutas `/admin/*` requieren rol `ADMIN`.

## Pendientes futuros

- Crear usuarios de Supabase Auth desde la aplicación.
- Recuperación/cambio de contraseña desde UI.
- Auditoría detallada de cambios de permisos.
- Permisos más granulares por módulo.
