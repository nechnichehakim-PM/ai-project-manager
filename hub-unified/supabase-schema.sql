-- =============================================================
-- Hub Unified — Schéma Supabase
-- PM Hub + Delivery Hub : base de données unifiée
-- =============================================================

-- =============================================================
-- 1. Table PROFILES — profils utilisateurs
-- =============================================================

create table public.profiles (
  id           uuid        references auth.users on delete cascade primary key,
  email        text,
  role         text        default 'pm'
                           check (role in ('god','pm','delivery','business','sales','head')),
  display_name text,
  created_at   timestamptz default now()
);

comment on table public.profiles is 'Profils utilisateurs avec rôle (god, pm, delivery, business, sales, head)';

-- =============================================================
-- 2. Table PMHUB_DATA — stockage clé-valeur JSONB
--    Clés préfixées par pmhub_, delhub_, hub_
-- =============================================================

create table public.pmhub_data (
  id         bigint       generated always as identity primary key,
  user_id    uuid         references auth.users on delete cascade not null,
  key        text         not null,
  value      jsonb,
  updated_at timestamptz  default now(),

  constraint pmhub_data_user_key_unique unique (user_id, key)
);

comment on table public.pmhub_data is 'Stockage clé-valeur principal — données PM Hub, DelHub et Hub';

-- Index composite pour accélérer les lectures par utilisateur + clé
create index idx_pmhub_data_user_key on public.pmhub_data (user_id, key);

-- =============================================================
-- 3. Trigger — création automatique du profil à l'inscription
-- =============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

-- Déclencheur après insertion dans auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- =============================================================
-- 4. Row Level Security (RLS)
-- =============================================================

-- ---- PROFILES ------------------------------------------------

alter table public.profiles enable row level security;

-- Lecture : chaque utilisateur voit son propre profil
create policy "profiles_select_own"
  on public.profiles for select
  using (id = auth.uid());

-- Insertion : uniquement son propre profil
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (id = auth.uid());

-- Mise à jour : uniquement son propre profil
create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---- PMHUB_DATA ----------------------------------------------

alter table public.pmhub_data enable row level security;

-- Lecture : ses propres lignes OU rôle god (accès global)
create policy "pmhub_data_select_own_or_god"
  on public.pmhub_data for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'god'
    )
  );

-- Insertion : uniquement ses propres lignes
create policy "pmhub_data_insert_own"
  on public.pmhub_data for insert
  with check (user_id = auth.uid());

-- Mise à jour : uniquement ses propres lignes
create policy "pmhub_data_update_own"
  on public.pmhub_data for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Suppression : uniquement ses propres lignes
create policy "pmhub_data_delete_own"
  on public.pmhub_data for delete
  using (user_id = auth.uid());

-- =============================================================
-- 5. Realtime — activer la publication pour pmhub_data
-- =============================================================

alter publication supabase_realtime add table public.pmhub_data;
