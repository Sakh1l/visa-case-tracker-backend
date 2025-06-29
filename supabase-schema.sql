-- Supabase schema for VisaCase Tracker

-- 1. Users table (Supabase Auth manages users, but we can extend with roles if needed)
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id),
  role text check (role in ('admin', 'viewer')) not null default 'admin',
  created_at timestamp with time zone default timezone('utc', now())
);

-- 2. Cases table
create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  employee_name text not null,
  visa_type text not null,
  expiry_date date not null,
  current_stage text,
  uscis_case_id text,
  notes text,
  last_updated_at timestamp with time zone default timezone('utc', now()),
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc', now())
);

-- 3. Uploads table
create table if not exists public.uploads (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  uploaded_at timestamp with time zone default timezone('utc', now()),
  uploaded_by uuid references auth.users(id)
);

-- 4. Shared Links table
create table if not exists public.shared_links (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references cases(id) on delete cascade,
  email text not null,
  link_token text unique not null,
  created_at timestamp with time zone default timezone('utc', now()),
  expires_at timestamp with time zone
);
