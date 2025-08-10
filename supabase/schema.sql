-- schema.sql
create extension if not exists pgcrypto;

create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

create table if not exists fragrance_families (
  id text primary key,
  slug text not null unique,
  name text not null
);

create table if not exists product_categories (
  id text primary key,
  slug text not null unique,
  name text not null
);

create table if not exists fragrances (
  id uuid primary key default gen_random_uuid(),
  brand_slug text not null references brands(slug) on delete cascade,
  code text not null,
  name text not null,
  description text,
  image_url text,
  is_llf_free boolean default false,
  is_allergen_free boolean default false,
  is_sales_push boolean default false,
  is_spc_in_use boolean default false,
  status text not null default 'active',
  primary_family_id text references fragrance_families(id),
  created_at timestamptz default now()
);

create table if not exists references_master (
  id uuid primary key default gen_random_uuid(),
  brand_name text,
  code text,
  name text not null
);

create table if not exists fragrance_references_map (
  fragrance_id uuid references fragrances(id) on delete cascade,
  reference_id uuid references references_master(id) on delete cascade,
  is_primary boolean default false,
  primary key (fragrance_id, reference_id)
);

create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  fragrance_id uuid not null references fragrances(id) on delete cascade,
  supplier text not null,
  trade_name text,
  lead_time_days int not null default 0,
  last_verified_at timestamptz not null default now(),
  supplier_status text not null default 'active',
  is_recommended boolean not null default false
);

create table if not exists supplier_tiers (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references suppliers(id) on delete cascade,
  moq_kg text,
  base_price_thb_per_kg numeric,
  enable_excise boolean default false
);

create table if not exists fragrance_subfamilies_map (
  fragrance_id uuid references fragrances(id) on delete cascade,
  family_id text references fragrance_families(id) on delete cascade,
  primary key (fragrance_id, family_id)
);

create table if not exists fragrance_fit_products (
  fragrance_id uuid references fragrances(id) on delete cascade,
  product_category_id text references product_categories(id) on delete cascade,
  fit_level text not null check (fit_level in ('best','good','avoid')),
  primary key (fragrance_id, product_category_id)
);

create table if not exists user_roles (
  user_id uuid primary key,
  role text not null check (role in ('sales','rd','admin'))
);