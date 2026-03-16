-- ════════════════════════════════════════════════════════════
--  Migración 005: Catálogo de productos nativo de RentIA
--
--  Permite crear productos directamente en la app con nombre,
--  descripción, precio e imagen (subida a Supabase Storage).
--  Funciona como fuente de conocimiento para el agente de IA.
-- ════════════════════════════════════════════════════════════

create table catalog_products (
  id          uuid primary key default uuid_generate_v4(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  name        text not null,
  description text,
  price       numeric(10,2),
  currency    text default 'USD',
  image_url   text,        -- URL pública en Supabase Storage
  enabled     boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index catalog_products_tenant_id_idx on catalog_products(tenant_id);

alter table catalog_products enable row level security;

create policy "Tenant owners can manage catalog products"
  on catalog_products for all
  using (
    tenant_id in (select id from tenants where owner_id = auth.uid())
  );

create trigger set_updated_at_catalog_products
  before update on catalog_products
  for each row execute procedure update_updated_at();


-- ── Supabase Storage: bucket público para imágenes del catálogo ──
insert into storage.buckets (id, name, public)
values ('catalog-images', 'catalog-images', true)
on conflict (id) do nothing;

-- Cualquier usuario autenticado puede subir/actualizar/borrar sus imágenes
create policy "Auth users can upload catalog images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'catalog-images');

create policy "Auth users can update catalog images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'catalog-images');

create policy "Auth users can delete catalog images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'catalog-images');

-- Cualquiera puede ver las imágenes (necesario para WhatsApp)
create policy "Public can view catalog images"
  on storage.objects for select
  using (bucket_id = 'catalog-images');
