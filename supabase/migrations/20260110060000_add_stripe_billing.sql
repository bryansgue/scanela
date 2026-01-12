create extension if not exists "pgcrypto";

alter table if exists public.subscriptions
  add column if not exists plan_source text default 'manual',
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists stripe_price_id text,
  add column if not exists stripe_checkout_session_id text,
  add column if not exists cancel_at_period_end boolean default false,
  add column if not exists current_period_start timestamptz,
  add column if not exists current_period_end timestamptz,
  add column if not exists last_payment_status text,
  add column if not exists last_payment_at timestamptz,
  add column if not exists billing_period text default 'monthly',
  add column if not exists trial_ends_at timestamptz,
  add column if not exists plan_metadata jsonb default '{}'::jsonb;

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  stripe_id text,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table if exists public.payment_events
  add column if not exists stripe_id text;

create index if not exists payment_events_user_id_idx on public.payment_events(user_id);
create index if not exists payment_events_stripe_id_idx on public.payment_events(stripe_id);
create index if not exists subscriptions_stripe_customer_idx on public.subscriptions(stripe_customer_id);
create index if not exists subscriptions_stripe_subscription_idx on public.subscriptions(stripe_subscription_id);
