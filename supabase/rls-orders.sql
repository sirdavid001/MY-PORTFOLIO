-- Restrict direct client access to orders.
alter table public.orders enable row level security;

-- Optional but recommended: remove broad grants from anon/authenticated roles.
revoke all on table public.orders from anon;
revoke all on table public.orders from authenticated;

-- Explicit deny policies for non-service roles.
drop policy if exists deny_anon_orders on public.orders;
create policy deny_anon_orders on public.orders
for all
to anon
using (false)
with check (false);

drop policy if exists deny_authenticated_orders on public.orders;
create policy deny_authenticated_orders on public.orders
for all
to authenticated
using (false)
with check (false);
