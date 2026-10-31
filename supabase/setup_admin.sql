-- Execute este arquivo UMA VEZ no SQL Editor do projeto Supabase.
-- NÃO cole senhas nem chaves secretas no site.
-- Depois crie o usuário em Authentication > Users e autorize o UUID dele
-- com o comando mostrado no README.

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text not null,
  storage_path text not null,
  published boolean default true,
  created_at timestamptz default now()
);
create table if not exists public.site_information (
  id uuid primary key default gen_random_uuid(),
  section text not null,
  title text not null,
  content text not null,
  display_order integer default 0,
  published boolean default true,
  updated_at timestamptz default now()
);
create table if not exists public.fish_species (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  image_url text,
  display_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz default now()
);
create table if not exists public.site_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.gallery_images enable row level security;
alter table public.site_information enable row level security;
alter table public.fish_species enable row level security;
alter table public.site_admins enable row level security;

grant select on public.gallery_images,public.site_information,public.fish_species to anon,authenticated;
grant insert,update,delete on public.gallery_images,public.site_information,public.fish_species to authenticated;
grant select on public.site_admins to authenticated;

-- Cada usuário só pode verificar se ELE MESMO é administrador.
drop policy if exists "Admins see their own status" on public.site_admins;
create policy "Admins see their own status" on public.site_admins for select to authenticated using (user_id=(select auth.uid()));

-- Consulta pública: só conteúdo publicado.
drop policy if exists "Public sees published gallery" on public.gallery_images;
create policy "Public sees published gallery" on public.gallery_images for select to anon,authenticated using (published=true);
drop policy if exists "Public sees published info" on public.site_information;
create policy "Public sees published info" on public.site_information for select to anon,authenticated using (published=true);
drop policy if exists "Public sees published fish" on public.fish_species;
create policy "Public sees published fish" on public.fish_species for select to anon,authenticated using (published=true);

-- Administradores têm acesso completo a estas tabelas.
drop policy if exists "Admins manage gallery" on public.gallery_images;
create policy "Admins manage gallery" on public.gallery_images for all to authenticated
using (exists(select 1 from public.site_admins where user_id=(select auth.uid())))
with check (exists(select 1 from public.site_admins where user_id=(select auth.uid())));
drop policy if exists "Admins manage info" on public.site_information;
create policy "Admins manage info" on public.site_information for all to authenticated
using (exists(select 1 from public.site_admins where user_id=(select auth.uid())))
with check (exists(select 1 from public.site_admins where user_id=(select auth.uid())));
drop policy if exists "Admins manage fish" on public.fish_species;
create policy "Admins manage fish" on public.fish_species for all to authenticated
using (exists(select 1 from public.site_admins where user_id=(select auth.uid())))
with check (exists(select 1 from public.site_admins where user_id=(select auth.uid())));

-- Storage: bucket "galeria" precisa existir como PUBLIC no painel Storage.
-- Não remover políticas padrão de leitura pública já existentes.
drop policy if exists "Admins read gallery files" on storage.objects;
create policy "Admins read gallery files" on storage.objects for select to authenticated
using(bucket_id='galeria' and exists(select 1 from public.site_admins where user_id=(select auth.uid())));
drop policy if exists "Admins upload gallery files" on storage.objects;
create policy "Admins upload gallery files" on storage.objects for insert to authenticated
with check(bucket_id='galeria' and exists(select 1 from public.site_admins where user_id=(select auth.uid())));
drop policy if exists "Admins update gallery files" on storage.objects;
create policy "Admins update gallery files" on storage.objects for update to authenticated
using(bucket_id='galeria' and exists(select 1 from public.site_admins where user_id=(select auth.uid()))))
with check(bucket_id='galeria' and exists(select 1 from public.site_admins where user_id=(select auth.uid())));
drop policy if exists "Admins delete gallery files" on storage.objects;
create policy "Admins delete gallery files" on storage.objects for delete to authenticated
using(bucket_id='galeria' and exists(select 1 from public.site_admins where user_id=(select auth.uid()))));

-- Espécies nomeadas no cartaz divulgado. O cartaz diz 14, mas identifica 13 nomes específicos.
insert into public.fish_species(slug,title,description,display_order) values
('pirarara','Pirarara','Espécie mencionada na divulgação. Consulte a equipe para confirmar a disponibilidade.',1),
('pintado','Pintado','Espécie mencionada na divulgação. Consulte a equipe para confirmar a disponibilidade.',2),
('jundia','Jundiá','Espécie mencionada na divulgação. Consulte a equipe para confirmar a disponibilidade.',3),
('cachapira','Cachapira','Espécie mencionada na divulgação. Consulte a equipe para confirmar a disponibilidade.',4),
('pacu-caranha','Pacu caranha','Espécie mencionada na divulgação. Consulte a equipe para confirmar a disponibilidade.',5),
('tambacu','Tambacu','Espécie mencionada na divulgação. Consulte a equipe para confirmar a disponibilidade.',6),
('patinga','Patinga','Espécie mencionada na divulgação. Consulte a equipe para confirmar a disponibilidade.',7),
('tambaqui','Tambaqui','Espécie mencionada na divulgação. Consulte a equipe para confirmar a disponibilidade.',8),
('dourado','Dourado','Espécie mencionada na divulgação. Consulte a equipe para confirmar a disponibilidade.',9),
('matrinxa','Matrinxã','Espécie mencionada na divulgação. Consulte a equipe para confirmar a disponibilidade.',10),
('piau-acu','Piau açu','Espécie mencionada na divulgação. Consulte a equipe para confirmar a disponibilidade.',11),
('trairao','Trairão','Espécie mencionada na divulgação. Consulte a equipe para confirmar a disponibilidade.',12),
('tilapia-saint-peter','Tilápia Saint Peter','Espécie mencionada na divulgação. Consulte a equipe para confirmar a disponibilidade.',13)
on conflict(slug) do nothing;
