-- ════════════════════════════════════════════════════════════
--  Migración 006: Añadir campo company a tenants
--  El formulario de registro ahora captura el nombre de la empresa.
--  Lo guardamos en tenants.company y en raw_user_meta_data.
-- ════════════════════════════════════════════════════════════

-- 1. Agregar columna company (nullable para no romper tenants existentes)
alter table tenants add column if not exists company text;

-- 2. Actualizar la función trigger para capturar company del metadata
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_tenant_id uuid;
  tenant_name   text;
begin
  -- Usar el nombre de empresa si existe, si no el nombre personal, si no el email
  tenant_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'company'), ''),
    nullif(trim(new.raw_user_meta_data->>'name'), ''),
    split_part(new.email, '@', 1)
  );

  -- 1. Crear tenant con nombre y empresa
  insert into tenants (owner_id, name, company)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'name'), ''), split_part(new.email, '@', 1)),
    nullif(trim(new.raw_user_meta_data->>'company'), '')
  )
  returning id into new_tenant_id;

  -- 2. Config de WhatsApp vacía
  insert into whatsapp_configs (tenant_id) values (new_tenant_id);

  -- 3. Config de IA con valores por defecto
  insert into ai_configs (tenant_id) values (new_tenant_id);

  return new;
end;
$$;
