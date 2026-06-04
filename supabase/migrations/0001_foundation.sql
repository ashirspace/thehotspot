create extension if not exists "pgcrypto";

create type member_role as enum ('owner', 'admin', 'member');
create type campaign_status as enum ('draft', 'active', 'paused', 'completed');
create type lead_status as enum ('new', 'contacted', 'replied', 'booked', 'closed', 'lost');
create type validation_status as enum ('unknown', 'valid', 'invalid', 'risky');
create type message_status as enum ('queued', 'sent', 'delivered', 'bounced', 'replied', 'skipped');
create type event_type as enum ('open', 'click', 'reply', 'bounce', 'unsubscribe');
create type suppression_reason as enum ('unsubscribed', 'bounced', 'complained');

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  plan text not null default 'starter',
  created_at timestamptz not null default now()
);

create table public.members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role member_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table public.sending_identities (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  from_name text not null,
  from_email text not null,
  provider text not null,
  dns_verified boolean not null default false,
  daily_limit integer not null default 20,
  sent_today integer not null default 0,
  warmup_stage text not null default 'blocked',
  created_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  email text not null,
  company text,
  role text,
  linkedin_url text,
  enrichment jsonb not null default '{}',
  status lead_status not null default 'new',
  validation_status validation_status not null default 'unknown',
  created_at timestamptz not null default now(),
  unique (workspace_id, email)
);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  status campaign_status not null default 'draft',
  sending_identity_id uuid references public.sending_identities(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.sequences (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  steps jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table public.templates (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  channel text not null,
  subject text,
  body text not null,
  variables text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  step_index integer not null,
  channel text not null,
  subject text,
  body text not null,
  scheduled_at timestamptz not null,
  sent_at timestamptz,
  status message_status not null default 'queued',
  idempotency_key text not null unique,
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  type event_type not null,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.suppression_list (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email text not null,
  reason suppression_reason not null,
  created_at timestamptz not null default now(),
  primary key (workspace_id, email)
);

alter table public.workspaces enable row level security;
alter table public.members enable row level security;
alter table public.sending_identities enable row level security;
alter table public.leads enable row level security;
alter table public.campaigns enable row level security;
alter table public.sequences enable row level security;
alter table public.templates enable row level security;
alter table public.messages enable row level security;
alter table public.events enable row level security;
alter table public.suppression_list enable row level security;

create or replace function public.is_workspace_member(target_workspace uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.members
    where workspace_id = target_workspace and user_id = auth.uid()
  );
$$;

create policy "workspace members can read workspaces"
on public.workspaces for select
using (public.is_workspace_member(id));

create policy "workspace owners can update workspaces"
on public.workspaces for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "members read own workspace members"
on public.members for select
using (public.is_workspace_member(workspace_id));

create policy "workspace member access sending identities"
on public.sending_identities for all
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

create policy "workspace member access leads"
on public.leads for all
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

create policy "workspace member access campaigns"
on public.campaigns for all
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

create policy "workspace member access templates"
on public.templates for all
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

create policy "workspace member access messages"
on public.messages for all
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

create policy "workspace member access suppression"
on public.suppression_list for all
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

create policy "workspace members read sequences via campaign"
on public.sequences for select
using (
  exists (
    select 1 from public.campaigns c
    where c.id = campaign_id and public.is_workspace_member(c.workspace_id)
  )
);

create policy "workspace members write sequences via campaign"
on public.sequences for all
using (
  exists (
    select 1 from public.campaigns c
    where c.id = campaign_id and public.is_workspace_member(c.workspace_id)
  )
)
with check (
  exists (
    select 1 from public.campaigns c
    where c.id = campaign_id and public.is_workspace_member(c.workspace_id)
  )
);

create policy "workspace members read events via message"
on public.events for select
using (
  exists (
    select 1 from public.messages m
    where m.id = message_id and public.is_workspace_member(m.workspace_id)
  )
);
