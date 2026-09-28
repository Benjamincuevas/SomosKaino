-- ServiNet — esquema inicial
-- Flujo: el cliente publica una solicitud → los profesionales de esa categoría
-- envían cotizaciones → el cliente acepta una → se revelan los teléfonos →
-- el trabajo se completa → el cliente deja una reseña.

-- ─── Perfiles ────────────────────────────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null check (role in ('cliente', 'profesional', 'admin')),
  full_name   text not null,
  city        text,
  created_at  timestamptz not null default now()
);

-- El teléfono va aparte: solo lo ve su dueño y la otra parte de un trabajo aceptado
create table public.contacts (
  id     uuid primary key references public.profiles(id) on delete cascade,
  phone  text not null
);

create table public.professional_profiles (
  id                uuid primary key references public.profiles(id) on delete cascade,
  bio               text,
  categories        text[] not null default '{}',
  cities            text[] not null default '{}',
  years_experience  int check (years_experience >= 0),
  verified          boolean not null default false,
  rating_avg        numeric(2,1) not null default 0,
  rating_count      int not null default 0,
  jobs_done         int not null default 0
);

-- ─── Solicitudes, cotizaciones y reseñas ─────────────────────────────────────
create table public.service_requests (
  id                 uuid primary key default gen_random_uuid(),
  client_id          uuid not null references public.profiles(id) on delete cascade,
  category           text not null,
  title              text not null check (char_length(title) between 5 and 120),
  description        text not null check (char_length(description) between 10 and 2000),
  city               text not null,
  sector             text,
  urgency            text not null default 'flexible' check (urgency in ('urgente', 'esta_semana', 'flexible')),
  budget             int check (budget > 0),
  status             text not null default 'abierta' check (status in ('abierta', 'asignada', 'completada', 'cancelada')),
  accepted_quote_id  uuid,
  created_at         timestamptz not null default now()
);
create index service_requests_open_idx on public.service_requests (category, status, created_at desc);
create index service_requests_client_idx on public.service_requests (client_id, created_at desc);

create table public.quotes (
  id              uuid primary key default gen_random_uuid(),
  request_id      uuid not null references public.service_requests(id) on delete cascade,
  pro_id          uuid not null references public.professional_profiles(id) on delete cascade,
  price           int not null check (price > 0),
  message         text not null check (char_length(message) between 5 and 1000),
  available_date  date,
  status          text not null default 'pendiente' check (status in ('pendiente', 'aceptada', 'rechazada')),
  created_at      timestamptz not null default now(),
  unique (request_id, pro_id)
);
create index quotes_pro_idx on public.quotes (pro_id, created_at desc);

alter table public.service_requests
  add constraint service_requests_accepted_quote_fk
  foreign key (accepted_quote_id) references public.quotes(id) on delete set null;

create table public.reviews (
  id          uuid primary key default gen_random_uuid(),
  request_id  uuid not null unique references public.service_requests(id) on delete cascade,
  client_id   uuid not null references public.profiles(id) on delete cascade,
  pro_id      uuid not null references public.professional_profiles(id) on delete cascade,
  rating      int not null check (rating between 1 and 5),
  comment     text check (char_length(comment) <= 1000),
  created_at  timestamptz not null default now()
);
create index reviews_pro_idx on public.reviews (pro_id, created_at desc);

-- ─── Alta automática de perfil al registrarse ────────────────────────────────
create function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_role text := coalesce(new.raw_user_meta_data->>'role', 'cliente');
begin
  -- Nadie puede registrarse como admin desde la app
  if v_role not in ('cliente', 'profesional') then
    v_role := 'cliente';
  end if;

  insert into profiles (id, role, full_name, city)
  values (new.id, v_role,
          coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), 'Usuario'),
          nullif(new.raw_user_meta_data->>'city', ''));

  insert into contacts (id, phone)
  values (new.id, coalesce(new.raw_user_meta_data->>'phone', ''));

  if v_role = 'profesional' then
    insert into professional_profiles (id, cities)
    values (new.id, case when new.raw_user_meta_data->>'city' is null then '{}'
                         else array[new.raw_user_meta_data->>'city'] end);
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Funciones auxiliares (security definer para evitar recursión en RLS) ────
create function public.is_request_owner(p_request uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from service_requests where id = p_request and client_id = auth.uid());
$$;

create function public.has_quoted(p_request uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from quotes where request_id = p_request and pro_id = auth.uid());
$$;

create function public.pro_serves_category(p_category text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from professional_profiles where id = auth.uid() and p_category = any(categories));
$$;

-- ¿Comparten un trabajo aceptado? (para mostrar el teléfono de la otra parte)
create function public.shares_accepted_job(p_other uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from service_requests r
    join quotes q on q.id = r.accepted_quote_id
    where r.status in ('asignada', 'completada')
      and ((r.client_id = auth.uid() and q.pro_id = p_other)
        or (q.pro_id = auth.uid() and r.client_id = p_other))
  );
$$;

-- ─── Transiciones de estado (el cliente no puede editar la solicitud a mano) ─
create function public.accept_quote(p_quote uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_request uuid;
begin
  select q.request_id into v_request
  from quotes q join service_requests r on r.id = q.request_id
  where q.id = p_quote and r.client_id = auth.uid() and r.status = 'abierta'
    and q.status = 'pendiente'
  for update of r;

  if v_request is null then
    raise exception 'No puedes aceptar esta cotización';
  end if;

  update quotes set status = 'aceptada'  where id = p_quote;
  update quotes set status = 'rechazada' where request_id = v_request and id <> p_quote;
  update service_requests set status = 'asignada', accepted_quote_id = p_quote where id = v_request;
end;
$$;

create function public.complete_request(p_request uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_pro uuid;
begin
  select q.pro_id into v_pro
  from service_requests r join quotes q on q.id = r.accepted_quote_id
  where r.id = p_request and r.client_id = auth.uid() and r.status = 'asignada'
  for update of r;

  if v_pro is null then
    raise exception 'No puedes completar esta solicitud';
  end if;

  update service_requests set status = 'completada' where id = p_request;
  update professional_profiles set jobs_done = jobs_done + 1 where id = v_pro;
end;
$$;

create function public.cancel_request(p_request uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update service_requests set status = 'cancelada'
  where id = p_request and client_id = auth.uid() and status = 'abierta';
  if not found then
    raise exception 'No puedes cancelar esta solicitud';
  end if;
  update quotes set status = 'rechazada' where request_id = p_request;
end;
$$;

-- Recalcular la calificación del profesional tras cada reseña
create function public.refresh_pro_rating()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update professional_profiles p
  set rating_avg   = coalesce((select round(avg(rating)::numeric, 1) from reviews where pro_id = new.pro_id), 0),
      rating_count = (select count(*) from reviews where pro_id = new.pro_id)
  where p.id = new.pro_id;
  return new;
end;
$$;

create trigger on_review_created
  after insert on public.reviews
  for each row execute function public.refresh_pro_rating();

-- ─── Row Level Security ──────────────────────────────────────────────────────
alter table public.profiles              enable row level security;
alter table public.contacts              enable row level security;
alter table public.professional_profiles enable row level security;
alter table public.service_requests      enable row level security;
alter table public.quotes                enable row level security;
alter table public.reviews               enable row level security;

-- Perfiles: nombre, rol y ciudad son públicos (perfil del profesional)
create policy "perfiles visibles" on public.profiles
  for select using (true);
create policy "editar mi perfil" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
-- El rol no se puede cambiar desde la app
revoke update on public.profiles from anon, authenticated;
grant update (full_name, city) on public.profiles to authenticated;

-- Teléfonos: el mío, o el de la otra parte de un trabajo aceptado
create policy "ver contacto" on public.contacts
  for select using (id = auth.uid() or public.shares_accepted_job(id));
create policy "editar mi contacto" on public.contacts
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Perfil profesional: público; cada profesional edita el suyo
create policy "profesionales visibles" on public.professional_profiles
  for select using (true);
create policy "editar mi perfil profesional" on public.professional_profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
-- verified, rating y jobs_done solo los cambia el sistema o un admin
revoke update on public.professional_profiles from anon, authenticated;
grant update (bio, categories, cities, years_experience) on public.professional_profiles to authenticated;

-- Solicitudes
create policy "ver solicitudes" on public.service_requests
  for select using (
    client_id = auth.uid()
    or (status = 'abierta' and public.pro_serves_category(category))
    or public.has_quoted(id)
  );
create policy "crear solicitud" on public.service_requests
  for insert with check (
    client_id = auth.uid() and status = 'abierta' and accepted_quote_id is null
  );
-- Sin política de update: los cambios de estado pasan por las funciones de arriba

-- Cotizaciones
create policy "ver cotizaciones" on public.quotes
  for select using (pro_id = auth.uid() or public.is_request_owner(request_id));
create policy "enviar cotización" on public.quotes
  for insert with check (
    pro_id = auth.uid()
    and status = 'pendiente'
    and exists (
      select 1 from public.service_requests r
      where r.id = quotes.request_id and r.status = 'abierta' and r.client_id <> auth.uid()
        and public.pro_serves_category(r.category)
    )
  );

-- Reseñas: públicas; solo el cliente de un trabajo completado, sobre el profesional aceptado
create policy "reseñas visibles" on public.reviews
  for select using (true);
create policy "dejar reseña" on public.reviews
  for insert with check (
    client_id = auth.uid()
    and exists (
      select 1 from public.service_requests r
      join public.quotes q on q.id = r.accepted_quote_id
      where r.id = reviews.request_id and r.client_id = auth.uid()
        and r.status = 'completada' and q.pro_id = reviews.pro_id
    )
  );

grant execute on function public.accept_quote(uuid)     to authenticated;
grant execute on function public.complete_request(uuid) to authenticated;
grant execute on function public.cancel_request(uuid)   to authenticated;
