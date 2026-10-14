# Gestión de herramientas — clientes y pagos

Web aparte (no tiene nada que ver con la app del taller) para llevar la cuenta corriente
de los clientes de la venta de herramientas:

- **Clientes**: nombre, teléfono, DNI/CUIT, dirección y notas.
- **Ventas**: qué se llevó cada uno (varias herramientas por venta, con cantidad y precio).
  Si paga algo en el momento, se carga ahí mismo.
- **Pagos**: cuánto pagó, cuándo y cómo (efectivo, transferencia, Mercado Pago, tarjeta, cheque).
- **Saldo**: cuánto debe cada cliente, con la cuenta corriente línea por línea.
- **Panel**: total que te deben, cuántos clientes deben, vendido y cobrado en el mes.
- **Movimientos**: todas las ventas y pagos entre dos fechas, lo cobrado por medio de pago,
  y botón para bajarlo a Excel.
- Botón para **mandarle el saldo por WhatsApp** al cliente.

## Cómo ponerla en marcha

1. **Base de datos (Supabase)**: lo ideal es crear un proyecto nuevo en
   [supabase.com](https://supabase.com) para que los datos queden separados del taller
   (también funciona en el mismo proyecto: las tablas empiezan con `herr_` y no chocan).
   Entrar a **SQL Editor**, pegar todo el contenido de `supabase/schema.sql` y apretar **Run**.
2. **Vercel**: *Add New → Project*, elegir este mismo repositorio y en **Root Directory**
   poner `herramientas`. Así queda como una web separada, con su propia dirección.
3. En ese proyecto de Vercel, cargar estas variables de entorno (*Settings → Environment Variables*):

   | Variable | Qué va |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | La URL del proyecto de Supabase (Settings → API) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | La clave `anon public` (Settings → API) |
   | `NEXT_PUBLIC_PASS` | La contraseña para entrar (si no se pone: `Herramientas2084`) |
   | `NEXT_PUBLIC_NOMBRE_NEGOCIO` | El nombre que aparece arriba (si no se pone: `Herramientas`) |

4. Deploy. Desde el celular se puede "Agregar a pantalla de inicio" para usarla como app.

## Probar en la compu

```bash
cd herramientas
npm install
# crear .env.local con las variables de arriba
npm run dev   # abre en http://localhost:3001
```
