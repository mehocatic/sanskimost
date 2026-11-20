begin;

create schema if not exists quiz_private;
revoke all on schema quiz_private from public, anon, authenticated;

create table if not exists quiz_private.questions (
  id text primary key,
  category text not null,
  question_bs text not null,
  question_en text not null,
  options_bs jsonb not null check (jsonb_typeof(options_bs) = 'array' and jsonb_array_length(options_bs) = 4),
  options_en jsonb not null check (jsonb_typeof(options_en) = 'array' and jsonb_array_length(options_en) = 4),
  correct_option smallint not null check (correct_option between 1 and 4),
  explanation_bs text not null,
  explanation_en text not null,
  source_name text not null,
  source_url text not null,
  active boolean not null default true
);

create table if not exists quiz_private.attempts (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  question_ids text[] not null,
  answers jsonb not null default '[]'::jsonb,
  score integer check (score is null or score between 0 and 1000)
);

create table if not exists quiz_private.results (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null unique references quiz_private.attempts(id),
  display_name text not null check (char_length(trim(display_name)) between 1 and 40),
  score integer not null check (score between 0 and 1000),
  created_at timestamptz not null default now()
);

alter table quiz_private.questions enable row level security;
alter table quiz_private.attempts enable row level security;
alter table quiz_private.results enable row level security;
revoke all on all tables in schema quiz_private from public, anon, authenticated;

commit;
