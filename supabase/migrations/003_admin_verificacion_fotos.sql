-- ServiNet — Fase 2: administración, verificación de profesionales y fotos en solicitudes
-- También aplica las mejoras de rendimiento sugeridas por Supabase.

-- ─── Administradores ─────────────────────────────────────────────────────────
-- Correos que se convierten en admin al CONFIRMAR su correo (no al registrarse,
-- para que nadie pueda reclamar el rol registrándose con un correo ajeno).
create table public.admin_emails (
  email text primary key
);
alter table public.admin_emails enable row level security; -- sin políticas: solo el sistema la lee

insert into public.admin_emails (email) values ('benjamincuevas809@gmail.com');

create function public.promote_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.email_confirmed_at is not null
     and exists (select 1 from admin_emails where lower(email) = lower(new.email)) then
    update profiles set role = 'admin' where id = new.id;
  end if;
  return new;
end;
$$;

-- Debe correr después de handle_new_user (los triggers corren en orden alfabético)
create trigger on_auth_user_promote_admin
  after insert or update of email_confirmed_at on auth.users
  for each row execute function public.promote_admin();

create function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- ─── Verificación de profesionales ───────────────────────────────────────────
create table public.verifications (
  pro_id          uuid primary key references public.professional_profiles(id) on delete cascade,
  cedula_path     text not null,
  certificado_path text not null,
  references_text text check (char_length(references_text) <= 1000),
  status          text not null default 'pendiente' check (status in ('pendiente', 'aprobada', 'rechazada')),
  admin_note      text check (char_length(admin_note) <= 500),
  submitted_at    timestamptz not null default now(),
  reviewed_at     timestamptz,
  reviewed_by     uuid references public.profiles(id) on delete set null
);
create index verifications_status_idx on public.verifications (status, submitted_at);
create index verifications_reviewed_by_idx on public.verifications (reviewed_by);

alter table public.verifications enable row level security;
create policy "ver verificación" on public.verifications
  for select using (pro_id = (select auth.uid()) or (select public.is_admin()));
-- Sin insert/update directos: se usan las funciones de abajo

create function public.submit_verification(p_cedula text, p_certificado text, p_references text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
begin
  if not exists (select 1 from professional_profiles where id = v_uid) then
    raise exception 'Solo los profesionales pueden verificarse';
  end if;
  if p_cedula not like v_uid::text || '/%' or p_certificado not like v_uid::text || '/%' then
    raise exception 'Documentos no válidos';
  end if;
  if exists (select 1 from verifications where pro_id = v_uid and status = 'aprobada') then
    raise exception 'Tu perfil ya está verificado';
  end if;

  insert into verifications (pro_id, cedula_path, certificado_path, references_text)
  values (v_uid, p_cedula, p_certificado, nullif(trim(p_references), ''))
  on conflict (pro_id) do update
    set cedula_path = excluded.cedula_path,
        certificado_path = excluded.certificado_path,
        references_text = excluded.references_text,
        status = 'pendiente', admin_note = null,
        submitted_at = now(), reviewed_at = null, reviewed_by = null;
end;
$$;

create function public.review_verification(p_pro uuid, p_approve boolean, p_note text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then
    raise exception 'Solo un administrador puede revisar verificaciones';
  end if;

  update verifications
  set status = case when p_approve then 'aprobada' else 'rechazada' end,
      admin_note = nullif(trim(p_note), ''),
      reviewed_at = now(), reviewed_by = auth.uid()
  where pro_id = p_pro;
  if not found then
    raise exception 'Verificación no encontrada';
  end if;

  update professional_profiles set verified = p_approve where id = p_pro;
end;
$$;

-- Números para el panel de administración
create function public.admin_stats()
returns json language plpgsql stable security definer set search_path = public as $$
begin
  if not is_admin() then
    raise exception 'Solo administradores';
  end if;
  return json_build_object(
    'clientes',       (select count(*) from profiles where role = 'cliente'),
    'profesionales',  (select count(*) from profiles where role = 'profesional'),
    'verificados',    (select count(*) from professional_profiles where verified),
    'solicitudes',    (select count(*) from service_requests),
    'abiertas',       (select count(*) from service_requests where status = 'abierta'),
    'asignadas',      (select count(*) from service_requests where status in ('asignada', 'completada')),
    'cotizaciones',   (select count(*) from quotes),
    'resenas',        (select count(*) from reviews)
  );
end;
$$;

-- ─── Fotos en solicitudes ────────────────────────────────────────────────────
alter table public.service_requests
  add column photos text[] not null default '{}'
  check (cardinality(photos) <= 5);

drop policy "crear solicitud" on public.service_requests;
create policy "crear solicitud" on public.service_requests
  for insert with check (
    client_id = (select auth.uid()) and status = 'abierta' and accepted_quote_id is null
    -- Las fotos deben estar en la carpeta del propio cliente
    and not exists (select 1 from unnest(photos) p where p not like (select auth.uid())::text || '/%')
  );

-- ─── Storage: buckets privados ───────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('solicitudes',    'solicitudes',    false, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/heic']),
  ('verificaciones', 'verificaciones', false, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']);

-- Cada usuario sube solo a su propia carpeta: <uid>/archivo
create policy "subir fotos de solicitud" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'solicitudes' and (storage.foldername(name))[1] = (select auth.uid())::text
  );
-- Ve las fotos quien puede ver la solicitud (RLS de service_requests aplica dentro)
create policy "ver fotos de solicitud" on storage.objects
  for select to authenticated using (
    bucket_id = 'solicitudes' and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or exists (select 1 from public.service_requests r where name = any (r.photos))
    )
  );

create policy "subir documentos de verificación" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'verificaciones' and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy "ver documentos de verificación" on storage.objects
  for select to authenticated using (
    bucket_id = 'verificaciones' and (
      (storage.foldername(name))[1] = (select auth.uid())::text or (select public.is_admin())
    )
  );

-- ─── Permisos de funciones ───────────────────────────────────────────────────
revoke execute on function public.promote_admin()                         from public, anon, authenticated;
revoke execute on function public.is_admin()                              from public, anon;
revoke execute on function public.submit_verification(text, text, text)   from public, anon;
revoke execute on function public.review_verification(uuid, boolean, text) from public, anon;
revoke execute on function public.admin_stats()                           from public, anon;
grant execute on function public.is_admin()                               to authenticated;
grant execute on function public.submit_verification(text, text, text)    to authenticated;
grant execute on function public.review_verification(uuid, boolean, text) to authenticated;
grant execute on function public.admin_stats()                            to authenticated;

-- ─── Rendimiento (sugerencias de Supabase) ───────────────────────────────────
create index reviews_client_idx on public.reviews (client_id);
create index service_requests_accepted_quote_idx on public.service_requests (accepted_quote_id);

-- auth.uid() dentro de (select …) se evalúa una vez por consulta y no por fila
drop policy "editar mi perfil" on public.profiles;
create policy "editar mi perfil" on public.profiles
  for update using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy "ver contacto" on public.contacts;
create policy "ver contacto" on public.contacts
  for select using (id = (select auth.uid()) or public.shares_accepted_job(id));
drop policy "editar mi contacto" on public.contacts;
create policy "editar mi contacto" on public.contacts
  for update using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy "editar mi perfil profesional" on public.professional_profiles;
create policy "editar mi perfil profesional" on public.professional_profiles
  for update using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy "ver solicitudes" on public.service_requests;
create policy "ver solicitudes" on public.service_requests
  for select using (
    client_id = (select auth.uid())
    or (status = 'abierta' and public.pro_serves_category(category))
    or public.has_quoted(id)
  );

drop policy "ver cotizaciones" on public.quotes;
create policy "ver cotizaciones" on public.quotes
  for select using (pro_id = (select auth.uid()) or public.is_request_owner(request_id));
drop policy "enviar cotización" on public.quotes;
create policy "enviar cotización" on public.quotes
  for insert with check (
    pro_id = (select auth.uid())
    and status = 'pendiente'
    and exists (
      select 1 from public.service_requests r
      where r.id = quotes.request_id and r.status = 'abierta' and r.client_id <> (select auth.uid())
        and public.pro_serves_category(r.category)
    )
  );

drop policy "dejar reseña" on public.reviews;
create policy "dejar reseña" on public.reviews
  for insert with check (
    client_id = (select auth.uid())
    and exists (
      select 1 from public.service_requests r
      join public.quotes q on q.id = r.accepted_quote_id
      where r.id = reviews.request_id and r.client_id = (select auth.uid())
        and r.status = 'completada' and q.pro_id = reviews.pro_id
    )
  );
