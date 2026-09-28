-- El administrador puede ver teléfonos (para llamar a profesionales al verificarlos)
drop policy "ver contacto" on public.contacts;
create policy "ver contacto" on public.contacts
  for select using (
    id = (select auth.uid())
    or public.shares_accepted_job(id)
    or (select public.is_admin())
  );
