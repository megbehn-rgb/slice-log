-- Slice Log — Supabase schema
--
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- for a fresh project. Mirrors the app's previous local SQLite schema
-- (see src/db/schema.ts in git history) — same four tables, translated to
-- Postgres types.
--
-- RLS is left OFF on purpose: this is a private, no-login, two-person app.
-- The anon key is meant to be embedded in the client (like the Google
-- Places key), but it grants full read/write to these tables as long as
-- RLS stays off — don't publish the anon key anywhere public.

create table if not exists restaurants (
  id bigint generated always as identity primary key,
  place_id text not null unique,
  name text not null,
  address text not null,
  neighborhood text,
  borough text,
  latitude double precision not null,
  longitude double precision not null,
  google_rating double precision,
  google_rating_count integer,
  tommy_rating double precision,
  tommy_review text not null default '',
  meghan_rating double precision,
  meghan_review text not null default '',
  visit_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists photos (
  id bigint generated always as identity primary key,
  restaurant_id bigint not null references restaurants (id) on delete cascade,
  uri text not null,
  created_at timestamptz not null default now()
);

create table if not exists restaurant_tags (
  id bigint generated always as identity primary key,
  restaurant_id bigint not null references restaurants (id) on delete cascade,
  tag text not null,
  unique (restaurant_id, tag)
);

create table if not exists restaurant_order_types (
  id bigint generated always as identity primary key,
  restaurant_id bigint not null references restaurants (id) on delete cascade,
  order_type text not null,
  unique (restaurant_id, order_type)
);

create index if not exists idx_photos_restaurant_id on photos (restaurant_id);
create index if not exists idx_restaurant_tags_restaurant_id on restaurant_tags (restaurant_id);
create index if not exists idx_restaurant_tags_tag on restaurant_tags (tag);
create index if not exists idx_restaurant_order_types_restaurant_id on restaurant_order_types (restaurant_id);
create index if not exists idx_restaurant_order_types_order_type on restaurant_order_types (order_type);
create index if not exists idx_restaurants_name on restaurants (name);
create index if not exists idx_restaurants_tommy_rating on restaurants (tommy_rating);
create index if not exists idx_restaurants_visit_date on restaurants (visit_date);

alter table restaurants disable row level security;
alter table photos disable row level security;
alter table restaurant_tags disable row level security;
alter table restaurant_order_types disable row level security;
