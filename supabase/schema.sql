-- Jalankan di Supabase → SQL Editor
create table if not exists public.progress (
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  doc_id     text not null check (doc_id in ('state','notes','journal')),
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, doc_id)
);

alter table public.progress enable row level security;

create policy "own rows select" on public.progress for select using (auth.uid() = user_id);
create policy "own rows insert" on public.progress for insert with check (auth.uid() = user_id);
create policy "own rows update" on public.progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows delete" on public.progress for delete using (auth.uid() = user_id);
