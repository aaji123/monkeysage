revoke all on public.quotes from public, anon, authenticated;
grant select on public.quotes to anon;

drop policy if exists quotes_public_read on public.quotes;
create policy quotes_public_read
  on public.quotes
  for select
  to anon
  using (true);