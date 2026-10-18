-- Cole no SQL Editor do painel do Supabase e rode uma vez.

create table public.filmes_marcados (
  usuario_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  filme_id integer not null,
  estado text not null check (estado in ('quero_assistir', 'assistido')),
  titulo text not null,
  poster text,
  ano integer,
  nota numeric,
  atualizado_em timestamptz not null default now(),
  primary key (usuario_id, filme_id)
);

alter table public.filmes_marcados enable row level security;

create policy "ler as proprias marcacoes" on public.filmes_marcados
  for select to authenticated using (usuario_id = (select auth.uid()));
create policy "criar as proprias marcacoes" on public.filmes_marcados
  for insert to authenticated with check (usuario_id = (select auth.uid()));
create policy "alterar as proprias marcacoes" on public.filmes_marcados
  for update to authenticated
  using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));
create policy "apagar as proprias marcacoes" on public.filmes_marcados
  for delete to authenticated using (usuario_id = (select auth.uid()));
