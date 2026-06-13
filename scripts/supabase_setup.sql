-- SaluLink — run once in Supabase SQL Editor
-- Dashboard: https://supabase.com/dashboard/project/bzhalwgbjaexswwwnxhx/sql/new

create table if not exists campaign_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  character_id text,
  completed_at timestamptz,
  email text,
  email_opt_in boolean default false,
  modules_completed int default 0,
  modules_data jsonb,
  created_at timestamptz default now()
);

create table if not exists campaign_module_results (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  module_id text not null,
  character_id text,
  scenario_id text,
  score int not null default 0,
  total_questions int not null default 0,
  skipped boolean default false,
  scenario_run boolean default false,
  answers jsonb not null default '[]'::jsonb,
  completed_at timestamptz default now()
);

create table if not exists campaign_events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  module_id text not null,
  character_id text,
  event text not null,
  recorded_at timestamptz default now()
);

create index if not exists idx_campaign_module_session on campaign_module_results (session_id);
create index if not exists idx_campaign_events_session on campaign_events (session_id);

alter table campaign_sessions enable row level security;
alter table campaign_module_results enable row level security;
alter table campaign_events enable row level security;

drop policy if exists "Allow anonymous insert campaign_sessions" on campaign_sessions;
drop policy if exists "Allow anonymous upsert campaign_sessions" on campaign_sessions;
drop policy if exists "Allow anonymous insert campaign_module_results" on campaign_module_results;
drop policy if exists "Allow anonymous insert campaign_events" on campaign_events;

create policy "Allow anonymous insert campaign_sessions"
  on campaign_sessions for insert to anon with check (true);

create policy "Allow anonymous upsert campaign_sessions"
  on campaign_sessions for update to anon using (true) with check (true);

create policy "Allow anonymous insert campaign_module_results"
  on campaign_module_results for insert to anon with check (true);

create policy "Allow anonymous insert campaign_events"
  on campaign_events for insert to anon with check (true);

-- Allow the anon API key to write (required for tables created via SQL editor)
grant usage on schema public to anon, authenticated;
grant insert, update on campaign_sessions to anon;
grant insert on campaign_module_results to anon;
grant insert on campaign_events to anon;
