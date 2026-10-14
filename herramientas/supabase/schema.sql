-- Tablas de la app de gestión de herramientas (clientes, ventas y pagos).
-- Pegar todo esto en Supabase → SQL Editor → Run.
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

-- Una venta es lo que el cliente se llevó. Suma a lo que debe.
create table if not exists herr_ventas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references herr_clientes(id) on delete cascade,
  fecha date not null default current_date,
  items jsonb not null default '[]',   -- [{ "detalle": "Taladro Bosch", "cantidad": 1, "precio": 85000 }]
  total numeric(14,2) not null,
  notas text,
  created_at timestamptz not null default now()
);

-- Un pago es plata que entró. Resta de lo que debe.
create table if not exists herr_pagos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references herr_clientes(id) on delete cascade,
  fecha date not null default current_date,
  monto numeric(14,2) not null,
  medio text not null default 'EFECTIVO',   -- EFECTIVO, TRANSFERENCIA, MERCADO PAGO, TARJETA, CHEQUE
  notas text,
  created_at timestamptz not null default now()
);

create index if not exists herr_ventas_cliente_idx on herr_ventas(cliente_id);
create index if not exists herr_pagos_cliente_idx on herr_pagos(cliente_id);

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
