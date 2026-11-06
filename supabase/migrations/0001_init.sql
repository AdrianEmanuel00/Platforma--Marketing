-- Schema inițială: workspace-uri, proiecte (clienți), identitate de brand, postări, agenți, research.
-- Fiecare rând aparține unui workspace; RLS lasă un utilizator să vadă doar workspace-urile lui.

create extension if not exists "pgcrypto";

create type workspace_kind as enum ('business', 'agency');
create type member_role as enum ('owner', 'admin', 'editor', 'viewer');
create type social_platform as enum ('instagram', 'facebook', 'tiktok', 'linkedin', 'youtube', 'x');
create type post_status as enum ('idea', 'draft', 'pending_approval', 'approved', 'scheduled', 'published', 'failed');
create type asset_kind as enum ('image', 'carousel', 'video');
create type run_status as enum ('queued', 'running', 'succeeded', 'failed');

create table workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind workspace_kind not null default 'business',
  plan text not null default 'free',
  created_at timestamptz not null default now()
);

create table workspace_members (
  workspace_id uuid not null references workspaces on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  role member_role not null default 'editor',
  -- null = acces la toate proiectele workspace-ului
  project_ids uuid[],
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  slug text not null,
  name text not null,
  industry text,
  website text,
  goals text[] not null default '{}',
  autopilot boolean not null default false,
  created_at timestamptz not null default now(),
  unique (workspace_id, slug)
);

create table brand_kits (
  project_id uuid primary key references projects on delete cascade,
  colors jsonb not null default '[]',
  fonts jsonb not null default '{}',
  logo_path text,
  voice text,
  audience text,
  do_words text[] not null default '{}',
  dont_words text[] not null default '{}',
  visual_style text,
  examples jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

create table social_accounts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects on delete cascade,
  platform social_platform not null,
  external_id text not null,
  handle text,
  created_at timestamptz not null default now(),
  unique (project_id, platform, external_id)
);

-- Token-urile stau separat, cu RLS fără nicio politică: doar serverul (service role) le citește.
-- Se criptează în aplicație înainte de salvare (TOKEN_ENCRYPTION_KEY).
create table social_account_tokens (
  account_id uuid primary key references social_accounts on delete cascade,
  access_token_enc text not null,
  refresh_token_enc text,
  expires_at timestamptz
);

create table competitors (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects on delete cascade,
  name text not null,
  handle text not null,
  platform social_platform not null
);

create table assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects on delete cascade,
  kind asset_kind not null,
  storage_path text not null,
  prompt text,
  model text,
  created_at timestamptz not null default now()
);

create table posts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects on delete cascade,
  title text not null,
  status post_status not null default 'draft',
  asset_kind asset_kind not null default 'image',
  asset_ids uuid[] not null default '{}',
  scheduled_at timestamptz,
  source text not null default 'manual',
  created_by uuid references auth.users,
  created_at timestamptz not null default now()
);

create table post_variants (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts on delete cascade,
  platform social_platform not null,
  caption text not null default '',
  hashtags text[] not null default '{}',
  external_post_id text,
  published_at timestamptz,
  metrics jsonb,
  unique (post_id, platform)
);

create table approvals (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts on delete cascade,
  -- link-ul trimis clientului: /aprobare/<token>
  token text not null unique default encode(gen_random_bytes(24), 'hex'),
  decision text check (decision in ('approved', 'changes_requested')),
  comment text,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

create table research_reports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects on delete cascade,
  report_date date not null,
  trends jsonb not null default '[]',
  competitor_moves jsonb not null default '[]',
  ideas jsonb not null default '[]',
  created_at timestamptz not null default now(),
  unique (project_id, report_date)
);

create table agent_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects on delete cascade,
  agent text not null,
  status run_status not null default 'queued',
  input jsonb,
  output jsonb,
  summary text,
  cost_usd numeric(10, 4) not null default 0,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create index on posts (project_id, scheduled_at);
create index on agent_runs (project_id, started_at desc);

-- ---------- Row Level Security ----------

create or replace function is_member(ws uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from workspace_members where workspace_id = ws and user_id = auth.uid());
$$;

create or replace function can_access_project(p uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from projects pr
    join workspace_members m on m.workspace_id = pr.workspace_id
    where pr.id = p and m.user_id = auth.uid()
      and (m.project_ids is null or pr.id = any (m.project_ids))
  );
$$;

alter table workspaces enable row level security;
alter table workspace_members enable row level security;
alter table projects enable row level security;
alter table brand_kits enable row level security;
alter table social_accounts enable row level security;
alter table social_account_tokens enable row level security;
alter table competitors enable row level security;
alter table assets enable row level security;
alter table posts enable row level security;
alter table post_variants enable row level security;
alter table approvals enable row level security;
alter table research_reports enable row level security;
alter table agent_runs enable row level security;

create policy "membrii văd workspace-ul" on workspaces for select using (is_member(id));
create policy "membrii se văd între ei" on workspace_members for select using (is_member(workspace_id));
create policy "acces la proiect" on projects for all using (can_access_project(id)) with check (is_member(workspace_id));

create policy "acces brand" on brand_kits for all using (can_access_project(project_id));
create policy "acces conturi" on social_accounts for select using (can_access_project(project_id));
create policy "acces competitori" on competitors for all using (can_access_project(project_id));
create policy "acces media" on assets for all using (can_access_project(project_id));
create policy "acces postări" on posts for all using (can_access_project(project_id));
create policy "acces variante" on post_variants for all
  using (can_access_project((select project_id from posts where posts.id = post_id)));
create policy "acces aprobări" on approvals for all
  using (can_access_project((select project_id from posts where posts.id = post_id)));
create policy "acces research" on research_reports for select using (can_access_project(project_id));
create policy "acces rulări" on agent_runs for select using (can_access_project(project_id));

-- Crearea unui workspace trece printr-o funcție, ca utilizatorul să devină automat owner.
create or replace function create_workspace(ws_name text, ws_kind workspace_kind)
returns uuid language plpgsql security definer set search_path = public as $$
declare ws uuid;
begin
  if auth.uid() is null then raise exception 'neautentificat'; end if;
  insert into workspaces (name, kind) values (ws_name, ws_kind) returning id into ws;
  insert into workspace_members (workspace_id, user_id, role) values (ws, auth.uid(), 'owner');
  return ws;
end;
$$;
