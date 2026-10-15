-- Tablas de la app de gestión de herramientas (clientes, ventas, pagos y comprobantes).
-- Pegar todo esto en Supabase → SQL Editor → Run. Se puede volver a correr sin problema.
-- Las tablas llevan el prefijo "herr_" para que no choquen con las del taller
-- si se usa el mismo proyecto de Supabase.

create table if not exists herr_clientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  telefono text,
  documento text,          -- DNI / CUIT
  direccion text,
  notas text,
  created_at timestamptz not null default now()
);

-- Una venta es lo que el cliente compra. La mercadería se entrega recién cuando está
-- todo pagado (entregado_el queda vacío hasta ese momento).
create table if not exists herr_ventas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references herr_clientes(id) on delete cascade,
  fecha date not null default current_date,
  items jsonb not null default '[]',   -- [{ "detalle": "Taladro Bosch", "cantidad": 1, "precio": 85000 }]
  total numeric(14,2) not null,
  notas text,
  created_at timestamptz not null default now()
);
alter table herr_ventas add column if not exists forma_pago text not null default 'EFECTIVO';  -- EFECTIVO, TRANSFERENCIA, TARJETA EN CUOTAS, PLAN PERSONAL
alter table herr_ventas add column if not exists cuotas int;               -- tarjeta o plan personal
alter table herr_ventas add column if not exists recargo numeric(6,2);     -- % de recargo por tarjeta en cuotas
alter table herr_ventas add column if not exists anticipo numeric(14,2);   -- plan personal: lo que dejó al comprar
alter table herr_ventas add column if not exists monto_cuota numeric(14,2);-- plan personal
alter table herr_ventas add column if not exists frecuencia text;          -- plan personal: SEMANAL, QUINCENAL, MENSUAL
alter table herr_ventas add column if not exists primera_cuota date;       -- plan personal: vencimiento de la cuota 1
alter table herr_ventas add column if not exists entregado_el date;        -- cuándo se le entregó la mercadería

-- Un pago es plata que entró, siempre a cuenta de una venta.
create table if not exists herr_pagos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references herr_clientes(id) on delete cascade,
  fecha date not null default current_date,
  monto numeric(14,2) not null,
  medio text not null default 'EFECTIVO',   -- EFECTIVO, TRANSFERENCIA, TARJETA
  notas text,
  created_at timestamptz not null default now()
);
alter table herr_pagos add column if not exists venta_id uuid references herr_ventas(id) on delete cascade;
alter table herr_pagos add column if not exists comprobante_url text;   -- foto del comprobante
alter table herr_pagos add column if not exists comprobante_path text;  -- ruta en el storage (para poder borrarla)

create index if not exists herr_ventas_cliente_idx on herr_ventas(cliente_id);
create index if not exists herr_pagos_cliente_idx on herr_pagos(cliente_id);
create index if not exists herr_pagos_venta_idx on herr_pagos(venta_id);

-- Mismo esquema de acceso que la app del taller: la app entra con la anon key y la
-- contraseña se pide en la pantalla de ingreso.
alter table herr_clientes enable row level security;
alter table herr_ventas enable row level security;
alter table herr_pagos enable row level security;

drop policy if exists "acceso app" on herr_clientes;
drop policy if exists "acceso app" on herr_ventas;
drop policy if exists "acceso app" on herr_pagos;
create policy "acceso app" on herr_clientes for all using (true) with check (true);
create policy "acceso app" on herr_ventas for all using (true) with check (true);
create policy "acceso app" on herr_pagos for all using (true) with check (true);

-- Fotos de los comprobantes (carpeta "comprobantes" del Storage). Los nombres de archivo
-- son aleatorios, así que solo los puede ver quien tenga el link desde la app.
insert into storage.buckets (id, name, public) values ('comprobantes', 'comprobantes', true)
on conflict (id) do nothing;

drop policy if exists "comprobantes subir" on storage.objects;
drop policy if exists "comprobantes ver" on storage.objects;
drop policy if exists "comprobantes borrar" on storage.objects;
create policy "comprobantes subir" on storage.objects for insert with check (bucket_id = 'comprobantes');
create policy "comprobantes ver" on storage.objects for select using (bucket_id = 'comprobantes');
create policy "comprobantes borrar" on storage.objects for delete using (bucket_id = 'comprobantes');
