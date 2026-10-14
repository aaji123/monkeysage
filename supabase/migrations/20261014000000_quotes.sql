create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  quote_text text not null unique check (length(btrim(quote_text)) > 0),
  category text not null check (length(btrim(category)) > 0),
  created_at timestamptz not null default now()
);

alter table public.quotes enable row level security;

revoke all on public.quotes from public, anon, authenticated;
grant select on public.quotes to anon;

drop policy if exists quotes_public_read on public.quotes;
create policy quotes_public_read
  on public.quotes
  for select
  to anon
  using (true);
