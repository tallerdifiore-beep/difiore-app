# Esteban Herramientas — clientes y pagos

Web aparte (no tiene nada que ver con la app del taller) para llevar la cuenta corriente
de los clientes de la venta de herramientas:

- **Clientes**: nombre, teléfono, DNI/CUIT, dirección y notas.
- **Ventas** con su forma de pago:
  - **Efectivo** o **transferencia**: paga todo (o una parte) en el momento.
  - **Tarjeta en cuotas**: cantidad de cuotas y recargo %; se cobra todo con el posnet.
  - **Plan personal**: anticipo opcional + cuotas semanales, quincenales o mensuales,
    con fecha de vencimiento de cada una y recargo % opcional.
- **La mercadería se entrega recién cuando la venta está pagada completa.** Hasta entonces
  figura "Pagando · no se entrega"; cuando se completa pasa a "Para entregar" y se marca
  como entregada con un botón.
- **Pagos** a cuenta de cada venta (efectivo, transferencia o tarjeta), con **foto del
  comprobante** (se saca con la cámara del celular o se elige de la galería; también PDF).
  Si no se subió en el momento, se puede agregar después.
- **Pantalla principal**: cuánto te deben, cobrado en el mes, cuotas vencidas (con días de
  atraso), cuotas que vencen esta semana y ventas pagadas listas para entregar.
- **Movimientos**: todas las ventas y pagos entre dos fechas, lo cobrado por medio de pago,
  link a cada comprobante y botón para bajarlo a Excel.
- Botón para **mandarle el saldo por WhatsApp** al cliente (avisa si tiene una cuota vencida).

El diseño sigue el logo (`public/logo.png`): fondo negro, azul eléctrico y plateado cromado.
El ícono de la app (`public/icono.png`) es la "E" del logo.

## Cómo ponerla en marcha

1. **Base de datos (Supabase)**: lo ideal es crear un proyecto nuevo en
   [supabase.com](https://supabase.com) para que los datos queden separados del taller
   (también funciona en el mismo proyecto: las tablas empiezan con `herr_` y no chocan).
   Entrar a **SQL Editor**, pegar todo el contenido de `supabase/schema.sql` y apretar **Run**.
   Eso crea las tablas y también la carpeta `comprobantes` del Storage para las fotos.
2. **Vercel**: *Add New → Project*, elegir este mismo repositorio y en **Root Directory**
   poner `herramientas`. Así queda como una web separada, con su propia dirección.
3. En ese proyecto de Vercel, cargar estas variables de entorno (*Settings → Environment Variables*):

   | Variable | Qué va |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | La URL del proyecto de Supabase (Settings → API) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | La clave `anon public` (Settings → API) |
   | `NEXT_PUBLIC_PASS` | La contraseña para entrar (si no se pone: `Herramientas2084`) |
   | `NEXT_PUBLIC_NOMBRE_NEGOCIO` | El nombre en la pestaña del navegador (si no se pone: `Esteban Herramientas`) |

4. Deploy. Desde el celular se puede "Agregar a pantalla de inicio" para usarla como app.

## Probar en la compu

```bash
cd herramientas
npm install
# crear .env.local con las variables de arriba
npm run dev   # abre en http://localhost:3001
```
