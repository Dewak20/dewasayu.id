-- ============================================================
-- Undangan Digital — skema Supabase (Postgres)
-- Jalankan di Supabase Studio → SQL Editor → New query → Run.
-- ============================================================

create extension if not exists "pgcrypto";

-- Satu undangan per pasangan (MVP: identitas lewat edit_token, belum pakai auth).
create table if not exists invitations (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,                       -- dipakai di URL publik /u/<slug>
  edit_token  uuid not null default gen_random_uuid(),    -- kunci edit (disimpan di localStorage pasangan)
  template    text not null default 'klasik',             -- id template yang dipilih
  content     jsonb not null default '{}'::jsonb,          -- nama, acara, kisah, foto, dsb.
  published   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Jawaban RSVP dari tamu.
create table if not exists rsvps (
  id             uuid primary key default gen_random_uuid(),
  invitation_id  uuid not null references invitations(id) on delete cascade,
  name           text not null,
  pax            int  not null default 1,
  attending      text not null default 'hadir',           -- hadir | tidak | ragu
  events         text[] default '{}',                      -- acara yang dihadiri (opsional)
  message        text,                                      -- ucapan
  created_at     timestamptz not null default now()
);
create index if not exists rsvps_invitation_idx on rsvps(invitation_id);

-- ------------------------------------------------------------
-- Row Level Security
-- Prinsip: publik hanya boleh BACA undangan yang sudah terbit,
-- dan MENGIRIM RSVP. Semua tulis undangan & baca daftar RSVP
-- lewat API server (service_role key), bukan dari browser.
-- ------------------------------------------------------------
alter table invitations enable row level security;
alter table rsvps        enable row level security;

drop policy if exists "public read published invitations" on invitations;
create policy "public read published invitations"
  on invitations for select
  using (published = true);

drop policy if exists "public insert rsvp" on rsvps;
create policy "public insert rsvp"
  on rsvps for insert
  with check (
    exists (select 1 from invitations i where i.id = invitation_id and i.published = true)
  );

-- Catatan: tidak ada policy untuk update/delete undangan atau select rsvp dari
-- anon. Operasi itu memakai service_role key di API route server (bypass RLS),
-- dengan validasi edit_token di dalam route.
