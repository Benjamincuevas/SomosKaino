-- Endurecer permisos: las funciones SECURITY DEFINER no deben poder llamarse
-- sin sesión, y las de triggers no deben poder llamarse por RPC en absoluto.

revoke execute on function public.handle_new_user()    from public, anon, authenticated;
revoke execute on function public.refresh_pro_rating() from public, anon, authenticated;

revoke execute on function public.accept_quote(uuid)          from public, anon;
revoke execute on function public.complete_request(uuid)      from public, anon;
revoke execute on function public.cancel_request(uuid)        from public, anon;
revoke execute on function public.is_request_owner(uuid)      from public, anon;
revoke execute on function public.has_quoted(uuid)            from public, anon;
revoke execute on function public.pro_serves_category(text)   from public, anon;
revoke execute on function public.shares_accepted_job(uuid)   from public, anon;

-- Las políticas RLS usan estas funciones, así que los usuarios con sesión las necesitan
grant execute on function public.is_request_owner(uuid)     to authenticated;
grant execute on function public.has_quoted(uuid)           to authenticated;
grant execute on function public.pro_serves_category(text)  to authenticated;
grant execute on function public.shares_accepted_job(uuid)  to authenticated;
