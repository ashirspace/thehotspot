-- thehotspot Neon-only foundation
-- Apply with: npm run db:migrate

create extension if not exists pgcrypto;
create extension if not exists citext;

do $$
begin
  create type workspace_role as enum ('owner', 'admin', 'member');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type workspace_plan as enum ('starter', 'growth', 'scale');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type lead_status as enum ('new', 'contacted', 'replied', 'booked', 'closed', 'lost');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type validation_status as enum ('unknown', 'valid', 'invalid', 'risky');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type campaign_status as enum ('draft', 'active', 'paused', 'completed');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type message_status as enum ('queued', 'scheduled', 'sending', 'sent', 'delivered', 'bounced', 'replied', 'skipped', 'failed');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type outreach_channel as enum ('email', 'linkedin', 'x', 'instagram', 'facebook');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type sender_provider as enum ('gmail', 'resend', 'sendgrid');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type event_type as enum ('open', 'click', 'reply', 'bounce', 'complaint', 'unsubscribe');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type suppression_reason as enum ('unsubscribed', 'bounced', 'complained', 'manual');
exception when duplicate_object then null;
end $$;

create table if not exists schema_migrations (
  version text primary key,
  applied_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  full_name text,
  password_hash text,
  email_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists users_set_updated_at on users;
create trigger users_set_updated_at
before update on users
for each row execute function set_updated_at();

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz
);

create index if not exists sessions_user_id_idx on sessions(user_id);
create index if not exists sessions_token_active_idx on sessions(token_hash, expires_at);

create table if not exists workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan workspace_plan not null default 'starter',
  owner_id uuid not null references users(id) on delete restrict,
  physical_address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists workspaces_set_updated_at on workspaces;
create trigger workspaces_set_updated_at
before update on workspaces
for each row execute function set_updated_at();

create table if not exists members (
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role workspace_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create index if not exists members_user_id_idx on members(user_id);

create table if not exists workspace_settings (
  workspace_id uuid primary key references workspaces(id) on delete cascade,
  webhook_url text,
  calendar_url text,
  daily_send_window_start time not null default '09:00',
  daily_send_window_end time not null default '17:00',
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists workspace_settings_set_updated_at on workspace_settings;
create trigger workspace_settings_set_updated_at
before update on workspace_settings
for each row execute function set_updated_at();

create table if not exists sending_identities (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  from_name text not null,
  from_email citext not null,
  provider sender_provider not null,
  provider_account_ref text,
  tracking_domain text,
  dns_spf boolean not null default false,
  dns_dkim boolean not null default false,
  dns_dmarc boolean not null default false,
  dns_verified boolean not null default false,
  daily_limit integer not null default 20 check (daily_limit >= 0),
  sent_today integer not null default 0 check (sent_today >= 0),
  last_reset_date date,
  warmup_stage integer not null default 0 check (warmup_stage >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, from_email)
);

drop trigger if exists sending_identities_set_updated_at on sending_identities;
create trigger sending_identities_set_updated_at
before update on sending_identities
for each row execute function set_updated_at();

create index if not exists sending_identities_workspace_idx on sending_identities(workspace_id, dns_verified);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  first_name text,
  email citext not null,
  company text,
  role text,
  linkedin_url text,
  status lead_status not null default 'new',
  validation_status validation_status not null default 'unknown',
  enrichment jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, email)
);

drop trigger if exists leads_set_updated_at on leads;
create trigger leads_set_updated_at
before update on leads
for each row execute function set_updated_at();

create index if not exists leads_workspace_status_idx on leads(workspace_id, status, created_at desc);
create index if not exists leads_workspace_search_idx on leads using gin (to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(email::text, '') || ' ' || coalesce(company, '') || ' ' || coalesce(role, '')));

create table if not exists templates (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  channel outreach_channel not null,
  subject text,
  body text not null,
  variables jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists templates_set_updated_at on templates;
create trigger templates_set_updated_at
before update on templates
for each row execute function set_updated_at();

create index if not exists templates_workspace_idx on templates(workspace_id, channel, created_at);

create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  status campaign_status not null default 'draft',
  sending_identity_id uuid references sending_identities(id) on delete set null,
  tone_guide text not null default 'Concise, specific, no hype, no invented facts.',
  tracking_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists campaigns_set_updated_at on campaigns;
create trigger campaigns_set_updated_at
before update on campaigns
for each row execute function set_updated_at();

create index if not exists campaigns_workspace_status_idx on campaigns(workspace_id, status, created_at desc);

create table if not exists sequences (
  campaign_id uuid primary key references campaigns(id) on delete cascade,
  steps jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists sequences_set_updated_at on sequences;
create trigger sequences_set_updated_at
before update on sequences
for each row execute function set_updated_at();

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  campaign_id uuid references campaigns(id) on delete cascade,
  lead_id uuid references leads(id) on delete set null,
  sending_identity_id uuid references sending_identities(id) on delete set null,
  step_index integer not null default 0,
  channel outreach_channel not null default 'email',
  subject text,
  body text not null,
  status message_status not null default 'queued',
  scheduled_at timestamptz,
  sent_at timestamptz,
  delivered_at timestamptz,
  error text,
  idempotency_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, idempotency_key)
);

drop trigger if exists messages_set_updated_at on messages;
create trigger messages_set_updated_at
before update on messages
for each row execute function set_updated_at();

create index if not exists messages_workspace_status_idx on messages(workspace_id, status, created_at desc);
create index if not exists messages_due_idx on messages(status, scheduled_at) where status = 'scheduled';
create index if not exists messages_campaign_idx on messages(campaign_id, status);
create index if not exists messages_lead_idx on messages(lead_id, status);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  message_id uuid references messages(id) on delete set null,
  lead_id uuid references leads(id) on delete set null,
  type event_type not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists events_workspace_type_idx on events(workspace_id, type, created_at desc);
create index if not exists events_message_idx on events(message_id);

create table if not exists suppression_list (
  workspace_id uuid not null references workspaces(id) on delete cascade,
  email citext not null,
  reason suppression_reason not null,
  source text,
  created_at timestamptz not null default now(),
  primary key (workspace_id, email)
);

create index if not exists suppression_created_idx on suppression_list(workspace_id, created_at desc);

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'queued' check (status in ('queued', 'running', 'done', 'failed')),
  run_after timestamptz not null default now(),
  attempts integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists jobs_set_updated_at on jobs;
create trigger jobs_set_updated_at
before update on jobs
for each row execute function set_updated_at();

create index if not exists jobs_due_idx on jobs(status, run_after, created_at);

create table if not exists ai_generation_records (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  input_hash text not null,
  model text not null,
  prompt jsonb not null,
  output jsonb not null,
  created_at timestamptz not null default now(),
  unique (workspace_id, input_hash, model)
);

create index if not exists ai_generation_records_workspace_idx on ai_generation_records(workspace_id, created_at desc);

create or replace view campaign_funnel as
select
  campaigns.workspace_id,
  campaigns.id as campaign_id,
  campaigns.name,
  count(messages.id) filter (where messages.status in ('sent', 'delivered', 'replied'))::integer as sent,
  count(messages.id) filter (where messages.status in ('delivered', 'replied'))::integer as delivered,
  count(distinct events.message_id) filter (where events.type = 'open')::integer as opened,
  count(messages.id) filter (where messages.status = 'replied')::integer as replied,
  count(distinct leads.id) filter (where leads.status = 'booked')::integer as booked
from campaigns
left join messages on messages.campaign_id = campaigns.id
left join events on events.message_id = messages.id
left join leads on leads.id = messages.lead_id
group by campaigns.workspace_id, campaigns.id, campaigns.name;
