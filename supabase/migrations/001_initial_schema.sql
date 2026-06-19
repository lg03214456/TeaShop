begin;

-- User-facing data associated with Supabase Auth users.
create table public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  role text not null default 'user',
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_profiles_metadata_is_object
    check (jsonb_typeof(metadata) = 'object')
);

-- Primary business records. Status remains text so workflows can evolve without
-- requiring a PostgreSQL enum migration.
create table public.main_records (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  status text not null default 'draft',
  description text,
  created_at timestamptz not null default now(),
  created_by uuid references public.user_profiles (id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.user_profiles (id) on delete set null,
  version bigint not null default 1,
  is_deleted boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  constraint main_records_title_not_blank
    check (length(btrim(title)) > 0),
  constraint main_records_status_not_blank
    check (length(btrim(status)) > 0),
  constraint main_records_version_positive
    check (version > 0),
  constraint main_records_metadata_is_object
    check (jsonb_typeof(metadata) = 'object')
);

-- Flexible child rows for fields that do not belong in the stable main record.
create table public.record_details (
  id uuid primary key default gen_random_uuid(),
  record_id uuid not null references public.main_records (id) on delete cascade,
  detail_key text not null,
  detail_value jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  created_by uuid references public.user_profiles (id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.user_profiles (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  constraint record_details_key_not_blank
    check (length(btrim(detail_key)) > 0),
  constraint record_details_sort_order_nonnegative
    check (sort_order >= 0),
  constraint record_details_metadata_is_object
    check (jsonb_typeof(metadata) = 'object')
);

-- A generic lock target allows the same locking mechanism to serve future
-- editable tables. One active lock row is allowed per table and record pair.
create table public.edit_locks (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id uuid not null,
  locked_by uuid not null references public.user_profiles (id) on delete cascade,
  locked_by_name text not null,
  locked_at timestamptz not null default now(),
  expires_at timestamptz not null,
  lock_token uuid not null default gen_random_uuid(),
  metadata jsonb not null default '{}'::jsonb,
  constraint edit_locks_target_unique unique (table_name, record_id),
  constraint edit_locks_token_unique unique (lock_token),
  constraint edit_locks_table_name_not_blank
    check (length(btrim(table_name)) > 0),
  constraint edit_locks_user_name_not_blank
    check (length(btrim(locked_by_name)) > 0),
  constraint edit_locks_expiry_after_lock
    check (expires_at > locked_at),
  constraint edit_locks_metadata_is_object
    check (jsonb_typeof(metadata) = 'object')
);

-- Immutable snapshots of record changes. User names are copied as snapshots so
-- audit history remains readable if a profile later changes.
create table public.record_logs (
  id bigint generated always as identity primary key,
  record_id uuid not null references public.main_records (id) on delete restrict,
  source_table text not null default 'main_records',
  action text not null,
  old_data jsonb,
  new_data jsonb,
  record_version bigint,
  changed_by uuid references public.user_profiles (id) on delete set null,
  changed_by_name text,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint record_logs_source_table_not_blank
    check (length(btrim(source_table)) > 0),
  constraint record_logs_action_not_blank
    check (length(btrim(action)) > 0),
  constraint record_logs_version_positive
    check (record_version is null or record_version > 0),
  constraint record_logs_metadata_is_object
    check (jsonb_typeof(metadata) = 'object')
);

-- Broader sign-in and application activity audit trail.
create table public.user_activity_logs (
  id bigint generated always as identity primary key,
  user_id uuid references public.user_profiles (id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  ip_address inet,
  user_agent text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint user_activity_logs_action_not_blank
    check (length(btrim(action)) > 0),
  constraint user_activity_logs_details_is_object
    check (jsonb_typeof(details) = 'object')
);

-- File bytes live in Supabase Storage; this table stores record associations and
-- file metadata only.
create table public.record_attachments (
  id uuid primary key default gen_random_uuid(),
  record_id uuid not null references public.main_records (id) on delete cascade,
  storage_bucket text not null,
  storage_path text not null,
  original_file_name text not null,
  mime_type text,
  file_size_bytes bigint,
  uploaded_by uuid references public.user_profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_deleted boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  constraint record_attachments_storage_object_unique
    unique (storage_bucket, storage_path),
  constraint record_attachments_bucket_not_blank
    check (length(btrim(storage_bucket)) > 0),
  constraint record_attachments_path_not_blank
    check (length(btrim(storage_path)) > 0),
  constraint record_attachments_file_name_not_blank
    check (length(btrim(original_file_name)) > 0),
  constraint record_attachments_file_size_nonnegative
    check (file_size_bytes is null or file_size_bytes >= 0),
  constraint record_attachments_metadata_is_object
    check (jsonb_typeof(metadata) = 'object')
);

-- Maintain updated_at consistently without duplicating it in application code.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_profiles_set_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

create trigger main_records_set_updated_at
before update on public.main_records
for each row execute function public.set_updated_at();

create trigger record_details_set_updated_at
before update on public.record_details
for each row execute function public.set_updated_at();

create trigger record_attachments_set_updated_at
before update on public.record_attachments
for each row execute function public.set_updated_at();

-- Common list, lookup, expiry, and audit-history access paths.
create index user_profiles_role_idx
  on public.user_profiles (role)
  where is_active = true;

create index main_records_active_status_updated_idx
  on public.main_records (status, updated_at desc)
  where is_deleted = false;

create index main_records_created_by_idx
  on public.main_records (created_by, created_at desc)
  where is_deleted = false;

create index record_details_record_sort_idx
  on public.record_details (record_id, sort_order, created_at);

create index record_details_key_idx
  on public.record_details (detail_key);

create index edit_locks_expires_at_idx
  on public.edit_locks (expires_at);

create index edit_locks_locked_by_idx
  on public.edit_locks (locked_by, expires_at);

create index record_logs_record_created_idx
  on public.record_logs (record_id, created_at desc);

create index record_logs_changed_by_created_idx
  on public.record_logs (changed_by, created_at desc);

create index user_activity_logs_user_created_idx
  on public.user_activity_logs (user_id, created_at desc);

create index user_activity_logs_entity_created_idx
  on public.user_activity_logs (entity_type, entity_id, created_at desc);

create index user_activity_logs_created_at_idx
  on public.user_activity_logs (created_at desc);

create index record_attachments_record_created_idx
  on public.record_attachments (record_id, created_at desc)
  where is_deleted = false;

-- Deny client access by default until explicit Auth-based policies are added.
alter table public.user_profiles enable row level security;
alter table public.main_records enable row level security;
alter table public.record_details enable row level security;
alter table public.edit_locks enable row level security;
alter table public.record_logs enable row level security;
alter table public.user_activity_logs enable row level security;
alter table public.record_attachments enable row level security;

comment on table public.record_attachments is
  'Metadata for files stored in Supabase Storage; file content is not stored here.';
comment on column public.main_records.version is
  'Application-managed optimistic concurrency version.';
comment on column public.edit_locks.record_id is
  'Generic target identifier interpreted together with table_name.';

commit;
