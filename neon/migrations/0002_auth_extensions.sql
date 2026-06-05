alter table users add column if not exists google_id text;

create unique index if not exists users_google_id_idx
  on users(google_id) where google_id is not null;

create table if not exists otp_tokens (
  email      citext      not null primary key,
  token_hash text        not null,
  expires_at timestamptz not null,
  used_at    timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists otp_tokens_expires_idx on otp_tokens(expires_at);
